# Firebase Google Sign-In — Setup & Integration Guide

This guide covers everything needed to replace the current email/password auth with
Google Sign-In via Firebase, from creating the Firebase project to wiring it into
the React frontend and FastAPI backend.

---

## 1. Create the Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `Fleeto` → disable Google Analytics (not needed) → **Create project**
3. In the left sidebar go to **Build → Authentication**
4. Click **Get started**
5. Under **Sign-in method**, enable **Google** → set your project support email → **Save**

---

## 2. Register Your Web App

1. In the Firebase console, click the gear icon → **Project settings**
2. Scroll to **Your apps** → click the **`</>`** (Web) icon
3. Name it `Fleeto Web` → **Register app**
4. Copy the `firebaseConfig` object — you will need it in the frontend

```js
// Example — yours will have real values
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "fleeto-xxxxx.firebaseapp.com",
  projectId: "fleeto-xxxxx",
  storageBucket: "fleeto-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## 3. Get the Backend Service Account Key (base64 approach)

The FastAPI backend needs the service account to verify Firebase ID tokens locally
via the Admin SDK. We store it as a base64 string in an env var — no JSON file in
the repo.

1. In **Project settings → Service accounts**
2. Click **Generate new private key** → **Generate key**
3. A JSON file is downloaded. **Never commit it.**
4. Encode it to base64 in your terminal:

```bash
base64 -i fleeto-60a7a-firebase-adminsdk-fbsvc-8732abe2fa.json | tr -d '\n'
```

5. Copy the output and paste it into `python-service/.env`:

```
FIREBASE_SERVICE_ACCOUNT_B64=<paste the base64 string here>
```

6. The JSON file can now be deleted or kept locally — the app only needs the env var.

```
# .gitignore (already configured)
*.json
.env
```

---

## 4. Update the Backend

### 4a. Add the dependency

```
# requirements.txt
firebase-admin==6.5.0
```

Install it:

```bash
source myenv/bin/activate
pip install firebase-admin==6.5.0
```

### 4b. Initialize Firebase Admin (`app/core/firebase.py`)

This reads the base64 env var, decodes it in memory, and never touches the filesystem:

```python
import base64, json
import firebase_admin
from firebase_admin import auth, credentials
from app.core.config import settings

_app = None

def _get_app():
    global _app
    if _app is None:
        account_info = json.loads(base64.b64decode(settings.firebase_service_account_b64))
        cred = credentials.Certificate(account_info)
        _app = firebase_admin.initialize_app(cred)
    return _app

def verify_firebase_token(id_token: str) -> dict:
    _get_app()
    return auth.verify_id_token(id_token)
```

### 4c. Add the Google auth endpoint (`app/api/v1/auth.py`)

Add this route alongside the existing ones:

```python
from app.core.firebase import verify_firebase_token
from firebase_admin.auth import InvalidIdTokenError

@router.post("/google", response_model=TokenResponse)
async def google_signin(
    id_token: str,                          # Firebase ID token from the frontend
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    try:
        decoded = verify_firebase_token(id_token)
    except (InvalidIdTokenError, Exception):
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    return await service.google_signin(
        firebase_uid=decoded["uid"],
        email=decoded.get("email", ""),
        name=decoded.get("name", ""),
    )
```

### 4d. Update the Operator model

Add `firebase_uid` and make `hashed_password` optional so operators who signed in
with Google don't need a password:

```python
# app/models/operator.py — add these two columns
firebase_uid: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, unique=True, index=True)
hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
```

### 4e. Add `google_signin` to `AuthService` (`app/services/auth_service.py`)

```python
async def google_signin(self, firebase_uid: str, email: str, name: str) -> TokenResponse:
    # Look up by firebase_uid first, then fall back to email
    operator = await self.operator_repo.get_by_firebase_uid(firebase_uid)
    if not operator:
        operator = await self.operator_repo.get_by_email(email)

    if not operator:
        # First time — create the account automatically
        operator = await self.operator_repo.create_google(
            firebase_uid=firebase_uid,
            email=email,
            name=name,
        )
    elif not operator.firebase_uid:
        # Existing email/password account — link it to Google
        await self.operator_repo.link_firebase_uid(operator, firebase_uid)

    token = create_access_token(f"operator:{operator.id}")
    return TokenResponse(access_token=token)
```

### 4f. Add the new repo methods (`app/repositories/operator_repo.py`)

```python
async def get_by_firebase_uid(self, uid: str) -> Optional[Operator]:
    result = await self.session.execute(
        select(Operator).where(Operator.firebase_uid == uid)
    )
    return result.scalar_one_or_none()

async def create_google(self, firebase_uid: str, email: str, name: str) -> Operator:
    operator = Operator(firebase_uid=firebase_uid, email=email, name=name)
    self.session.add(operator)
    await self.session.commit()
    await self.session.refresh(operator)
    return operator

async def link_firebase_uid(self, operator: Operator, firebase_uid: str) -> Operator:
    operator.firebase_uid = firebase_uid
    await self.session.commit()
    await self.session.refresh(operator)
    return operator
```

---

## 5. Frontend Integration (React PWA)

### 5a. Install Firebase SDK

```bash
npm install firebase
```

### 5b. Create `src/firebase.js`

```js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  // This is the short-lived Firebase ID token — send it to your backend
  const idToken = await result.user.getIdToken();
  return idToken;
}

export async function logout() {
  await signOut(auth);
  localStorage.removeItem("fleeto_token");
}
```

### 5c. Auth context (`src/context/AuthContext.jsx`)

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on page reload
    const stored = localStorage.getItem("fleeto_token");
    if (stored) setOperator({ token: stored });
    setLoading(false);

    // Keep Firebase session in sync
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        localStorage.removeItem("fleeto_token");
        setOperator(null);
      }
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ operator, setOperator, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 5d. Sign-In button component (`src/components/GoogleSignInButton.jsx`)

```jsx
import { signInWithGoogle } from "../firebase";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export function GoogleSignInButton() {
  const { setOperator } = useAuth();

  async function handleSignIn() {
    try {
      const idToken = await signInWithGoogle();

      // Exchange the Firebase token for a Fleeto JWT
      const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (!res.ok) throw new Error("Backend auth failed");

      const { access_token } = await res.json();
      localStorage.setItem("fleeto_token", access_token);
      setOperator({ token: access_token });
    } catch (err) {
      console.error("Sign-in failed:", err);
      alert("Sign-in failed. Please try again.");
    }
  }

  return (
    <button onClick={handleSignIn} className="btn-google">
      Sign in with Google
    </button>
  );
}
```

### 5e. Authenticated API calls

All subsequent API calls use the Fleeto JWT stored in localStorage:

```js
// src/api/client.js
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("fleeto_token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    // Token expired — force re-login
    localStorage.removeItem("fleeto_token");
    window.location.href = "/login";
  }
  return res;
}

// Usage
const jobs = await apiFetch("/api/v1/jobs").then(r => r.json());
```

---

## 6. The Full Auth Flow (End to End)

```
User clicks "Sign in with Google"
        │
        ▼
Firebase SDK opens Google popup
        │
        ▼
Google returns user credentials to Firebase
        │
        ▼
Firebase SDK gives your app an ID Token (JWT, ~1hr lifetime)
        │
        ▼
Frontend POSTs id_token → POST /api/v1/auth/google
        │
        ▼
FastAPI calls firebase_admin.verify_id_token()
  ├── Invalid → 401 Unauthorized
  └── Valid → look up or create Operator in DB
        │
        ▼
FastAPI returns a Fleeto JWT (operator:{uuid}, 24hr)
        │
        ▼
Frontend stores Fleeto JWT in localStorage
        │
        ▼
All API calls send: Authorization: Bearer <fleeto_jwt>
```

---

## 7. CORS — Allow the Frontend Origin

Add this to `app/main.py` so the browser doesn't block requests:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",          # Vite dev server
        "https://your-production-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 8. Environment Variables

**Backend `python-service/.env`** (copy from `.env.example` and fill in)
```
DATABASE_URL=sqlite+aiosqlite:///./fleeto.db
JWT_SECRET=replace-with-a-long-random-string
FIREBASE_SERVICE_ACCOUNT_B64=<output of the base64 command above>
```

**Frontend `.env`**
```
VITE_API_URL=http://localhost:8000
```

---

## 9. What Stays the Same

- Rider auth is **not** changed — riders still log in with phone + password via
  `POST /api/v1/auth/rider/login` because riders won't have Google accounts
- All job, tracking, and location endpoints are unchanged
- The Fleeto JWT format (`operator:{uuid}` / `rider:{uuid}`) is unchanged

---

## 10. Cost Summary

| Firebase Feature | Free tier limit |
|---|---|
| Google Sign-In | Unlimited |
| ID token verification | Unlimited (done locally via Admin SDK) |
| Firebase Auth MAU | 10,000/month (Spark plan) |
| Upgrade needed? | Only if you add phone SMS auth at scale |

For the Fleeto MVP with a handful of operators, the free tier will never be hit.

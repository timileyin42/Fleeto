# Delivra — Logistics Operations Platform

Delivra is a full-stack logistics dispatch platform for fleet operators in Africa. Operators create and assign delivery jobs, riders manage pickups and drop-offs via a mobile-optimised web app, and customers receive a WhatsApp tracking link with a live map — no app download required.

---

## Architecture Overview

```mermaid
graph TB
    subgraph Client["Client Layer"]
        LandingPage["Landing / Marketing Pages"]
        OperatorDash["Operator Dashboard\n(React SPA)"]
        RiderApp["Rider App\n(Mobile Web)"]
        TrackingPage["Customer Tracking Page\n(Public — no auth)"]
    end

    subgraph Auth["Authentication"]
        FirebaseAuth["Firebase Auth\n(Google OAuth)"]
        JWTAuth["JWT Tokens\n(Operator + Rider)"]
    end

    subgraph Backend["Backend — FastAPI"]
        API["REST API\n/api/v1"]
        WS["WebSocket\n/tracking/:id/ws"]
        subgraph Services["Service Layer"]
            JobSvc["Job Service"]
            RiderSvc["Rider Service"]
            AuthSvc["Auth Service"]
            TrackingSvc["Tracking Service"]
            StorageSvc["Storage Service"]
            WhatsAppSvc["WhatsApp Service"]
            LocationSvc["Location Service"]
        end
    end

    subgraph Storage["Storage Layer"]
        PostgreSQL[("PostgreSQL\n(Aiven)")]
        R2["Cloudflare R2\n(Image Storage)"]
    end

    subgraph Notifications["Notifications"]
        Twilio["Twilio\nWhatsApp API"]
    end

    OperatorDash -->|"HTTPS + Bearer JWT"| API
    RiderApp -->|"HTTPS + Bearer JWT"| API
    TrackingPage -->|"HTTPS (no auth)"| API
    TrackingPage -->|"WebSocket"| WS
    OperatorDash -->|"Google Sign-In"| FirebaseAuth
    FirebaseAuth -->|"ID Token"| AuthSvc
    AuthSvc --> JWTAuth
    API --> Services
    WS --> LocationSvc
    Services --> PostgreSQL
    StorageSvc --> R2
    WhatsAppSvc --> Twilio
    Twilio -->|"Tracking link"| CustomerPhone["Customer's WhatsApp"]
```

---

## System Flow

```mermaid
sequenceDiagram
    actor Operator
    actor Rider
    actor Customer

    Operator->>Frontend: Create new job (customer name, phone, addresses)
    Frontend->>API: POST /api/v1/jobs
    API->>Database: Insert job record + generate tracking token
    API-->>WhatsApp Service: Fire-and-forget notification
    WhatsApp Service->>Customer: WhatsApp message with tracking link
    API-->>Frontend: Job response (id, tracking_token)

    Operator->>Frontend: Assign rider to job
    Frontend->>API: PATCH /api/v1/jobs/:id/assign
    API->>Database: Update job.rider_id → status: assigned

    Rider->>RiderApp: View assigned jobs
    RiderApp->>API: GET /api/v1/jobs/mine
    Rider->>RiderApp: Open job → Mark Picked Up
    RiderApp->>API: PATCH /api/v1/jobs/:id/status {status: picked_up}

    Rider->>RiderApp: Start Delivery → GPS tracking begins
    RiderApp->>API: POST /api/v1/jobs/:id/location (lat, lng)
    API->>Database: Insert location_ping

    Customer->>TrackingPage: Opens WhatsApp link → /track/:token
    TrackingPage->>API: GET /api/v1/tracking/:token
    TrackingPage->>WebSocket: Connect /tracking/:id/ws
    WebSocket-->>TrackingPage: Live location updates

    Rider->>RiderApp: Upload proof photo → Mark Delivered
    RiderApp->>API: POST /api/v1/uploads/jobs/:id/proof
    API->>R2: Upload photo to Cloudflare R2
    RiderApp->>API: PATCH /api/v1/jobs/:id/status {status: delivered}
```

---

## Data Model

```mermaid
erDiagram
    OPERATOR {
        uuid id PK
        string name
        string email
        string password_hash
        string firebase_uid
        string plan
        string profile_picture_url
        timestamp created_at
    }

    RIDER {
        uuid id PK
        uuid operator_id FK
        string name
        string phone
        string password_hash
        string status
        string profile_picture_url
        timestamp created_at
    }

    JOB {
        uuid id PK
        uuid operator_id FK
        uuid rider_id FK
        string customer_name
        string customer_phone
        string pickup_address
        string dropoff_address
        string parcel_description
        string status
        string tracking_token
        string item_photo_url
        string proof_photo_url
        timestamp created_at
        timestamp updated_at
    }

    LOCATION_PING {
        uuid id PK
        uuid job_id FK
        float lat
        float lng
        timestamp recorded_at
    }

    OPERATOR ||--o{ RIDER : "manages"
    OPERATOR ||--o{ JOB : "creates"
    RIDER ||--o{ JOB : "assigned to"
    JOB ||--o{ LOCATION_PING : "broadcasts"
```

---

## Job Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> created : Operator creates job
    created --> assigned : Operator assigns rider
    assigned --> picked_up : Rider marks picked up
    picked_up --> in_transit : Rider starts delivery\n(GPS tracking begins)
    in_transit --> delivered : Rider marks delivered\n(proof photo uploaded)
    in_transit --> failed : Rider marks failed
    created --> cancelled : Operator cancels
    assigned --> cancelled : Operator cancels
    delivered --> [*]
    failed --> [*]
    cancelled --> [*]
```

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.115 |
| Runtime | Python 3.9+ |
| ORM | SQLAlchemy 2.0 (async) |
| Database | PostgreSQL (Aiven) / SQLite (dev) |
| Migrations | Alembic |
| Auth | JWT (python-jose) + Firebase Admin SDK |
| Storage | Cloudflare R2 via boto3 |
| Notifications | Twilio WhatsApp |
| Validation | Pydantic v2 |
| Server | Uvicorn |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v3 |
| Auth | Firebase Web SDK |
| HTTP Client | Axios |
| Maps | Leaflet + react-leaflet |

### Infrastructure
| Service | Provider |
|---------|---------|
| Backend hosting | FastAPI Cloud |
| Frontend hosting | Vercel |
| Database | Aiven PostgreSQL |
| Image storage | Cloudflare R2 |
| Auth provider | Firebase |
| WhatsApp | Twilio Sandbox → Business |

---

## Project Structure

```
Delivra/
├── delivra-web/                  # React frontend (Vite + TypeScript)
│   └── src/
│       ├── api/                 # Axios API clients
│       │   ├── auth.ts
│       │   ├── jobs.ts
│       │   ├── riders.ts
│       │   └── tracking.ts
│       ├── components/          # Shared UI components
│       │   ├── DashboardLayout.tsx
│       │   ├── MarketingNav.tsx
│       │   ├── ProtectedRoute.tsx
│       │   └── SideNav.tsx
│       ├── contexts/
│       │   └── AuthContext.tsx  # Firebase + JWT auth state
│       ├── pages/
│       │   ├── auth/            # Login, Signup, RiderLogin
│       │   ├── landing/         # LandingPage, FleetApp, RiderApp, Pricing
│       │   ├── operator/        # Dashboard, Jobs, Fleet, Settings, Billing
│       │   ├── rider/           # RiderJobList, RiderJobDetail
│       │   └── tracking/        # Public customer tracking page
│       └── lib/
│           └── firebase.ts      # Firebase web SDK init
│
└── python-service/              # FastAPI backend
    ├── app/
    │   ├── api/v1/              # Route handlers
    │   │   ├── auth.py
    │   │   ├── jobs.py
    │   │   ├── riders.py
    │   │   ├── tracking.py
    │   │   └── uploads.py
    │   ├── core/                # App config, DB, security, Firebase
    │   ├── models/              # SQLAlchemy ORM models
    │   ├── repositories/        # DB query layer
    │   ├── schemas/             # Pydantic request/response models
    │   └── services/            # Business logic
    ├── migrations/              # Alembic migration files
    └── requirements.txt
```

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | None | Register new operator |
| `POST` | `/api/v1/auth/operator/login` | None | Operator email/password login |
| `POST` | `/api/v1/auth/google` | Firebase ID token | Google OAuth login |
| `GET` | `/api/v1/auth/me` | Operator JWT | Get current operator profile |
| `POST` | `/api/v1/auth/rider/login` | None | Rider phone/password login |
| `GET` | `/api/v1/auth/rider/me` | Rider JWT | Get current rider profile |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/jobs` | Operator | Create new job |
| `GET` | `/api/v1/jobs` | Operator | List all operator jobs |
| `GET` | `/api/v1/jobs/:id` | Operator | Get job details |
| `PATCH` | `/api/v1/jobs/:id/assign` | Operator | Assign rider to job |
| `GET` | `/api/v1/jobs/mine` | Rider | List rider's assigned jobs |
| `GET` | `/api/v1/jobs/mine/:id` | Rider | Get specific job as rider |
| `PATCH` | `/api/v1/jobs/:id/status` | Rider | Update job status |
| `POST` | `/api/v1/jobs/:id/location` | Rider | Record GPS ping |

### Riders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/riders` | Operator | Add rider to fleet |
| `GET` | `/api/v1/riders` | Operator | List all riders |
| `GET` | `/api/v1/riders/:id` | Operator | Get rider details |

### Uploads
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/uploads/operator/avatar` | Operator | Upload operator profile picture |
| `POST` | `/api/v1/uploads/rider/avatar` | Rider | Upload rider profile picture |
| `POST` | `/api/v1/uploads/jobs/:id/item` | Operator | Upload parcel photo |
| `POST` | `/api/v1/uploads/jobs/:id/proof` | Rider | Upload delivery proof photo |

### Tracking (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/tracking/:token` | None | Get job tracking info |
| `WS` | `/api/v1/tracking/:id/ws` | None | Real-time location stream |

---

## Local Development

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker (for local PostgreSQL)

### Backend

```bash
cd python-service

# Start local Postgres
docker-compose up -d

# Create virtual environment
python -m venv myenv
source myenv/bin/activate   # Windows: myenv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env and fill in values
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Frontend

```bash
cd delivra-web

# Install dependencies
npm install

# Copy env and fill in values
cp .env.example .env

# Start dev server
npm run dev
# → http://localhost:5173
```

### Environment Variables

**Backend (`python-service/.env`)**
```env
DATABASE_URL=postgresql+asyncpg://delivra:delivra_dev@localhost:5432/delivra
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FIREBASE_SERVICE_ACCOUNT_B64=<base64 encoded service account JSON>
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=+14155238886
APP_BASE_URL=http://localhost:3000
cloudflare_r2_account_id=your_account_id
cloudflare_r2_access_key_id=your_access_key
cloudflare_r2_secret_access_key=your_secret_key
cloudflare_r2_bucket_name=delivra-assets
cloudflare_r2_public_url=https://pub-xxxx.r2.dev
```

**Frontend (`delivra-web/.env`)**
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Deployment

### Backend — FastAPI Cloud
1. Connect GitHub repo, set root directory to `python-service`
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
3. Set all environment variables in the dashboard
4. After first deploy, run: `alembic upgrade head`

### Frontend — Vercel
1. Connect GitHub repo, set root directory to `delivra-web`
2. Build command: `npm run build` · Output: `dist`
3. Set `VITE_API_URL` to your FastAPI Cloud backend URL

### Database — Aiven PostgreSQL
Connection string format for `DATABASE_URL`:
```
postgresql+asyncpg://user:password@host:port/dbname?sslmode=require
```

---

## User Roles

| Role | Access | Authentication |
|------|--------|---------------|
| **Operator** | Full dashboard — create jobs, manage fleet, view analytics | Email/password or Google OAuth |
| **Rider** | Mobile job list and job detail — update status, upload proof | Phone number + password |
| **Customer** | Read-only tracking page via unique link | None — public URL |

---

## License

Private — all rights reserved.

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

// Only initialise Firebase if credentials are present
const app = apiKey && projectId
  ? initializeApp({
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    })
  : null

export const auth = app ? getAuth(app) : null
const googleProvider = app ? new GoogleAuthProvider() : null

export const signInWithGoogle = async (): Promise<string> => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* keys to .env')
  }
  const result = await signInWithPopup(auth, googleProvider)
  return result.user.getIdToken()
}

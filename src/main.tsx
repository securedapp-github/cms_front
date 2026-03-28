import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Must match backend GOOGLE_CLIENT_ID so /auth/google-login verifyIdToken audience check passes.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {GOOGLE_CLIENT_ID ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <App />
            </GoogleOAuthProvider>
        ) : (
            <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 p-4 text-center">
                Missing VITE_GOOGLE_CLIENT_ID in .env file
            </div>
        )}
    </React.StrictMode>,
)

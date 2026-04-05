import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // Optional: customize based on preference
            retry: 1,
        },
    },
});

// Must match backend GOOGLE_CLIENT_ID so /auth/google-login verifyIdToken audience check passes.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            {GOOGLE_CLIENT_ID ? (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <App />
                </GoogleOAuthProvider>
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 p-4 text-center">
                    Missing VITE_GOOGLE_CLIENT_ID in .env file
                </div>
            )}
        </QueryClientProvider>
    </React.StrictMode>,
)


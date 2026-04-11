import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { Building2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import logo from '../assets/img/STRIGHT.png';



const Login = () => {
    const { loginWithOnboarding, loginFull } = useAuthStore();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError(null);
        try {
            const token = credentialResponse.credential;

            // Call backend API to exchange Google token for application JWT
            // Note: Update authApi typings to include `onboarding`, `email`, `name`, `tenant_id`, `client_id`
            const response: any = await authApi.loginWithGoogle({ googleToken: token });

            if (response.onboarding) {
                // First-time user, complete onboarding
                loginWithOnboarding(
                    response.token,
                    {
                        name: response.name || 'User',
                        email: response.email
                    }
                );
                navigate('/onboarding');
            } else {
                // Returning user, log in full
                loginFull(
                    response.token,
                    response.tenant_id,
                    response.client_id,
                    {
                        name: response.name || 'User',
                        email: response.email,
                        role: response.role
                    }
                );
                navigate('/dashboard');
            }

        } catch (err: any) {
            console.error('Authentication Error:', err);
            setError(err?.response?.data?.message || 'An error occurred during authentication. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="login-logo flex justify-center items-center mb-0">
                    <img 
                        src={logo} 
                        alt="Secure CMS Logo" 
                        className="h-[180px] w-auto object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.08)]" 
                    />
                </div>
                <h2 className="login-title mt-[-40px] mb-2 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                    Sign in to your organization
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Secure access via Google Single Sign-On
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center pt-2 pb-4 space-y-4">
                        {loading ? (
                            <div className="h-10 w-full flex items-center justify-center text-sm text-slate-500 font-medium bg-slate-50 rounded border border-slate-200">
                                Authenticating...
                            </div>
                        ) : (
                            <>
                                <div className="w-full flex flex-col space-y-3 items-center">
                                    <div className="w-full flex justify-center min-h-[40px]">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => setError('Google Sign-In failed')}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-6">
                        <p className="text-xs text-center text-slate-500">
                            By continuing, you agree to our Terms of Service and Privacy Policy. All access is secured and monitored.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

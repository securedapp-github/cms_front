import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { Building2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import logo from '../assets/img/STRIGHT.png';



const Login = () => {
    const { loginWithOnboarding, loginFull } = useAuthStore();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError(null);
        setIsBlocked(false);
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
            const msg = err?.response?.data?.message || '';
            
            // Check specifically for pause 403 error
            if (err?.response?.status === 403 && (msg.toLowerCase().includes('pause') || msg.toLowerCase().includes('suspended') || msg.toLowerCase().includes('disabled'))) {
                setIsBlocked(true);
            } else {
                setError(msg || 'An error occurred during authentication. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse shadow-2xl"></div>
            </div>

            <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-indigo-200/50 border border-white p-10 flex flex-col items-center">
                    {/* Branding */}
                    <div className="mb-0 flex flex-col items-center">
                        <img 
                            src={logo} 
                            alt="SecureCMS" 
                            className="h-32 w-auto object-contain transition-transform hover:scale-105 duration-500" 
                        />
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mt-2 leading-tight">
                            Identity Portal
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-2 text-center">
                            Single Sign-On for Secure Organization Access
                        </p>
                    </div>

                    {/* Auth Section */}
                    {isBlocked ? (
                        <div className="w-full mt-10 space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex flex-col items-center justify-center text-rose-500 shadow-inner mb-2 border border-rose-100">
                                <AlertTriangle className="w-10 h-10 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 text-center">Access Blocked</h3>
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 relative overflow-hidden w-full">
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                                <p className="text-sm font-bold text-rose-800 text-center leading-relaxed">
                                    Your organization is currently paused. Please contact your administrator for access.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsBlocked(false)}
                                className="mt-4 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                            >
                                Try Another Account
                            </button>
                        </div>
                    ) : (
                        <div className="w-full mt-10 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start animate-in shake duration-500">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                    <p className="text-xs font-bold text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col items-center">
                                {loading ? (
                                    <div className="h-14 w-full flex items-center justify-center space-x-3 text-indigo-600 font-black text-xs uppercase tracking-widest bg-indigo-50 rounded-2xl border border-indigo-100 animate-pulse">
                                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Verifying Identity...</span>
                                    </div>
                                ) : (
                                    <div className="w-full relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative bg-white border border-slate-200 rounded-2xl p-1 shadow-sm flex justify-center">
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={() => setError('Google Sign-In failed')}
                                                theme="outline"
                                                size="large"
                                                text="signin_with"
                                                shape="pill"
                                                width="100%"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative pt-2">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-slate-100"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-black">
                                    <span className="bg-white px-4 text-slate-300">Protected Access</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-slate-400 font-bold leading-relaxed px-4">
                                By reaching into the portal, you consent to our security protocols. 
                                Unauthorized access attempts are logged and reported.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center items-center space-x-6 opacity-40 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DPDP Compliant</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enterprise Ready</span>
                </div>
            </div>
        </div>
    );
};

export default Login;

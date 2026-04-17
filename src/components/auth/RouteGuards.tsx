import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// For authenticated users with a full token
export const ProtectedRoute = () => {
    const { token, onboardingToken } = useAuthStore();

    if (!token) {
        if (onboardingToken) {
            return <Navigate to="/onboarding" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

// For users who have an onboardingToken but no full token yet
export const OnboardingRoute = () => {
    const { token, onboardingToken } = useAuthStore();

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    if (!onboardingToken) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

// For unauthenticated users (Login page)
export const PublicRoute = () => {
    const { token, onboardingToken } = useAuthStore();

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    if (onboardingToken) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};

// Role Guard for specific roles
export const RoleGuard = ({ allowedRoles }: { allowedRoles: string[] }) => {
    const { user } = useAuthStore();
    
    if (user?.role && !allowedRoles.includes(user.role)) {
        // Redirect Super Admin to platform level, others to tenant level
        const redirectPath = user.role === 'super_admin' ? '/platform/dashboard' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
};

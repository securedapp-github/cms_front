import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Building2,
    Bell,
    ChevronRight,
    ShieldCheck,
    BookOpen,
    FileText,
    History,
    Webhook,
    UserCircle,
    Key,
    AppWindow,
    Database,
    Globe,
    MessageSquare,
    CreditCard
} from 'lucide-react';
import useSWR from 'swr';
import { appsApi } from '../api/appsApi';
import { tenantApi } from '../api/tenantApi';
import { authApi } from '../api/authApi';
import { useAppStore } from '../store/appStore';
import { 
    ROLES, 
    canViewPlatformLevel, 
    canViewSensitiveConfig,
    canViewManageApps,
    canManageOrgRoles,
    canViewAudit 
} from '../utils/rbac';
import logo from '../assets/img/STRIGHT.png';

const DashboardLayout = () => {
    const { user, logout, tenantId, tenantMetadata, setTenantMetadata, updateUserRole } = useAuthStore();
    const { selectedAppId, setSelectedAppId } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();
    const fetchInProgress = useRef(false);

    // Fetch user role if missing (Optimized with Ref guard)
    useEffect(() => {
        if (user && !user.role && !fetchInProgress.current) {
            fetchInProgress.current = true;
            authApi.getCurrentUser().then((res) => {
                if (res.client && res.client.role) {
                    updateUserRole(res.client.role);
                }
            }).catch((err) => {
                console.error('Auth check failed:', err);
                if (err.response?.status === 401) {
                    logout();
                    navigate('/');
                }
            }).finally(() => {
                fetchInProgress.current = false;
            });
        }
    }, [user, updateUserRole, logout, navigate]);

    // Fetch apps
    const { data: appsData } = useSWR('tenant/apps', () => appsApi.listApps());
    const apps = appsData?.apps || [];

    // Fetch tenant metadata
    const { data: tenantData } = useSWR('tenant/me', () => tenantApi.getCurrentTenant());

    useEffect(() => {
        if (tenantData) {
            setTenantMetadata({
                organizationName: tenantData.organizationName,
                industry: tenantData.industry,
                country: tenantData.country
            });
        }
    }, [tenantData, setTenantMetadata]);

    // Set default app if none selected and apps exist
    useEffect(() => {
        if (apps.length > 0) {
            const isValid = apps.some(app => app.id === selectedAppId);
            if (!selectedAppId || !isValid) {
                setSelectedAppId(apps[0].id);
            }
        } else if (selectedAppId) {
            setSelectedAppId(null);
        }
    }, [apps, selectedAppId, setSelectedAppId]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, visible: true },
        { label: 'Apps', path: '/apps', icon: AppWindow, visible: canViewManageApps(user?.role) },
        { label: 'Consents', path: '/consents', icon: ShieldCheck, visible: true },
        { label: 'Purposes', path: '/purposes', icon: BookOpen, visible: true },
        { label: 'Policy Versions', path: '/policy-versions', icon: FileText, visible: true },
        { label: 'Clients', path: '/clients', icon: Users, visible: true },
        { label: 'Data Catalog', path: '/data-catalog', icon: Database, visible: true },
        { label: 'Webhooks', path: '/webhooks', icon: Webhook, visible: canViewSensitiveConfig(user?.role) },
        { label: 'DSR Requests', path: '/dsr-requests', icon: MessageSquare, visible: true },
        { label: 'Audit Logs', path: '/audit-logs', icon: History, visible: canViewAudit(user?.role) },
        { label: 'API Keys', path: '/api-keys', icon: Key, visible: canViewSensitiveConfig(user?.role) },
        { label: 'Pricing', path: '/pricing', icon: CreditCard, visible: canManageOrgRoles(user?.role) },
        { label: 'Tenant Profile', path: '/tenant', icon: Settings, visible: true },
    ].filter(item => item.visible);

    const platformNavItems = [
        { label: 'Organizations', path: '/platform/orgs', icon: Building2 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
                <div className="h-14 flex items-center justify-center border-b border-slate-200 bg-white">
                    <img 
                        src={logo} 
                        alt="SecureCMS Logo" 
                        className="h-[140px] w-auto object-contain" 
                    />
                </div>

                <nav className="flex-1 py-8 px-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            <div className="flex items-center">
                                <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${location.pathname === item.path ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                {item.label}
                            </div>
                            {location.pathname === item.path && (
                                <ChevronRight className="w-4 h-4 text-indigo-400" />
                            )}
                        </NavLink>
                    ))}

                    {canViewPlatformLevel(user?.role) && (
                        <>
                            <div className="pt-4 pb-2">
                                <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Platform</p>
                            </div>
                            {platformNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    <div className="flex items-center">
                                        <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${location.pathname === item.path ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                        {item.label}
                                    </div>
                                    {location.pathname === item.path && (
                                        <ChevronRight className="w-4 h-4 text-indigo-400" />
                                    )}
                                </NavLink>
                            ))}
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3 mb-4 p-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                                {user?.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate font-medium">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                    >
                        <LogOut className="w-4 h-4 mr-3 flex-shrink-0 text-slate-400 group-hover:text-red-500" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col pl-64">
                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center space-x-3">
                        {/* Title removed */}
                    </div>

                    <div className="flex items-center space-x-5">
                        {/* App Selector */}
                        <div className="flex items-center space-x-2 mr-2">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Managed App</span>
                            </div>
                            <div className="relative group">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500 z-10" />
                                <select
                                    value={selectedAppId || ''}
                                    onChange={(e) => setSelectedAppId(e.target.value)}
                                    className="pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none min-w-[140px]"
                                >
                                    <option value="" disabled>Select an App</option>
                                    {apps.map((app) => (
                                        <option key={app.id} value={app.id}>
                                            {app.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col items-end border-r border-slate-200 pr-5 mr-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Active Tenant</span>
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                {tenantMetadata?.organizationName || (tenantId ? tenantId.substring(0, 12) : 'No Tenant')}
                            </span>
                        </div>
                        <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition-all duration-200 group">
                            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-transparent group-hover:ring-red-100 transition-all"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 pt-4 px-8 pb-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
    LayoutDashboard, 
    Building2, 
    ShieldCheck, 
    Users, 
    AppWindow, 
    Webhook, 
    Search, 
    Filter, 
    Calendar, 
    ArrowUpRight,
    Loader2,
    Monitor,
    ExternalLink,
    MessageSquare,
    Star,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { platformApi } from '../../api/platformApi';

const PlatformDashboard = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [addAdminOpen, setAddAdminOpen] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminSubmitting, setAdminSubmitting] = useState(false);
    const [adminError, setAdminError] = useState('');

    const handleCreateSuperAdmin = async () => {
        setAdminError('');
        if (!adminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
            setAdminError('Please enter a valid email address.');
            return;
        }
        setAdminSubmitting(true);
        try {
            const res = await platformApi.createSuperAdmin({ email: adminEmail.trim(), name: adminName.trim() || undefined });
            toast.success(res.message || 'Super admin status updated successfully');
            setAddAdminOpen(false);
            setAdminEmail('');
            setAdminName('');
        } catch (err: any) {
            setAdminError(err?.response?.data?.message || 'Failed to update super admin. Please try again.');
        } finally {
            setAdminSubmitting(false);
        }
    };

    const { data, isLoading, error } = useSWR(
        ['platform/dashboard', search, status, startDate, endDate],
        () => platformApi.getDashboardData({ 
            search, 
            status, 
            startDate: startDate || undefined, 
            endDate: endDate || undefined 
        })
    );

    const summary = data?.summary;
    const organizations = data?.organizations || [];

    const stats = [
        { label: 'Total Organizations', value: summary?.total_organizations || 0, icon: Building2, color: 'indigo' },
        { label: 'Total Consents', value: summary?.total_consents || 0, icon: ShieldCheck, color: 'emerald' },
        { label: 'Data Principals', value: summary?.total_data_principals || 0, icon: Users, color: 'purple' },
        { label: 'Pending Grievances', value: summary?.pending_grievances || 0, icon: MessageSquare, color: 'rose' },
        { label: 'Platform Rating', value: summary?.average_rating || 0, icon: Star, color: 'amber' },
        { label: 'Webhooks', value: summary?.total_webhooks || 0, icon: Webhook, color: 'blue' },
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
                <LayoutDashboard className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold">Failed to load platform metrics</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Global oversight of all organizations and security metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAddAdminOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-sm"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Add Super Admin
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer group">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                            stat.color === 'indigo' ? 'bg-indigo-50 group-hover:bg-indigo-100' :
                            stat.color === 'emerald' ? 'bg-emerald-50 group-hover:bg-emerald-100' :
                            stat.color === 'blue' ? 'bg-blue-50 group-hover:bg-blue-100' :
                            stat.color === 'purple' ? 'bg-purple-50 group-hover:bg-purple-100' :
                            stat.color === 'amber' ? 'bg-amber-50 group-hover:bg-amber-100' :
                            'bg-rose-50 group-hover:bg-rose-100'
                        }`}>
                            <stat.icon className={`w-6 h-6 ${
                                stat.color === 'indigo' ? 'text-indigo-600' :
                                stat.color === 'emerald' ? 'text-emerald-600' :
                                stat.color === 'blue' ? 'text-blue-600' :
                                stat.color === 'purple' ? 'text-purple-600' :
                                stat.color === 'amber' ? 'text-amber-600' :
                                'text-rose-600'
                            }`} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {isLoading ? '...' : (stat.label === 'Platform Rating' ? `${stat.value}/5` : stat.value.toLocaleString())}
                            </h3>
                            {stat.label === 'Pending Grievances' && !isLoading && summary?.total_grievances ? (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                                    {summary.resolved_grievances} Res.
                                </span>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by organization name..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <input
                                type="date"
                                className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none px-2 py-1.5"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-slate-300">to</span>
                            <input
                                type="date"
                                className="bg-transparent border-none text-xs font-bold text-slate-600 outline-none px-2 py-1.5"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <select
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none min-w-[140px]"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Organization Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">App Flow Split</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Consents</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Users</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Services</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Org Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                                        <p className="font-bold text-sm">Aggregating platform metrics...</p>
                                    </td>
                                </tr>
                            ) : organizations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                                        <p className="font-bold text-sm">No organizations found matching criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                organizations.map((org: any) => (
                                    <tr key={org.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-xs border border-indigo-100">
                                                    {org.organization_name?.charAt(0) || 'O'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{org.organization_name}</p>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                        org.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                        {org.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5" title="Embedded Apps">
                                                    <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span className="text-xs font-black text-slate-700">{org.consent_flow_split?.embedded_apps || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" title="Redirect Apps">
                                                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className="text-xs font-black text-slate-700">{org.consent_flow_split?.redirect_apps || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col gap-2 min-w-[120px]">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-sm font-black text-slate-900">{org.metrics?.total_consents?.toLocaleString()}</span>
                                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest ${
                                                        (org.metrics?.active_consents / org.metrics?.total_consents) > 0.8 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {Math.round((org.metrics?.active_consents / org.metrics?.total_consents) * 100 || 0)}% Integrity
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${
                                                            (org.metrics?.active_consents / org.metrics?.total_consents) > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'
                                                        }`}
                                                        style={{ width: `${(org.metrics?.active_consents / org.metrics?.total_consents) * 100 || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                    {org.metrics?.active_consents?.toLocaleString()} Active Grants
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className="text-sm font-black text-slate-900">{org.metrics?.total_users?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <div className="flex justify-center gap-3">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-rose-500">{org.metrics?.total_clients || 0}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Clients</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-indigo-600">{org.metrics?.total_apps || 0}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Apps</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-black text-slate-600">{org.metrics?.total_webhooks || 0}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Hooks</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <button 
                                                className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors"
                                                onClick={() => navigate(`/platform/orgs/${org.id}`)}
                                            >
                                                Details
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Super Admin Modal */}
            {addAdminOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900">Add Super Admin</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Create or promote an existing user</p>
                            </div>
                            <button 
                                onClick={() => setAddAdminOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="px-8 py-6 flex-1 space-y-6">
                            
                            {adminError && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2 text-rose-800">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="text-sm font-semibold">{adminError}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address <span className="text-rose-500">*</span></label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="admin@platform.com"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        disabled={adminSubmitting}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="Jane Doe"
                                        value={adminName}
                                        onChange={(e) => setAdminName(e.target.value)}
                                        disabled={adminSubmitting}
                                    />
                                </div>
                            </div>

                        </div>
                        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setAddAdminOpen(false)}
                                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200/50 transition-colors"
                                disabled={adminSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSuperAdmin}
                                disabled={adminSubmitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                            >
                                {adminSubmitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                ) : 'Save Admin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformDashboard;

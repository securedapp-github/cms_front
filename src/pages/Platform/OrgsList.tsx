import React, { useState } from 'react';
import useSWR from 'swr';
import { platformApi } from '../../api/platformApi';
import { Building2, Search, ArrowRight, Loader2, PauseCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OrgsList() {
    const { data, isLoading, mutate } = useSWR('platform/orgs', platformApi.listOrganizations);
    const orgs = data?.organizations || [];
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [confirmAction, setConfirmAction] = useState<'pause' | 'resume' | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleOrgAction = async () => {
        if (!selectedOrg || !confirmAction) return;
        setIsActionLoading(true);
        try {
            if (confirmAction === 'pause') {
                await platformApi.pauseOrganization(selectedOrg.id);
                toast.success('Organization has been paused');
            } else {
                await platformApi.resumeOrganization(selectedOrg.id);
                toast.success('Organization has been resumed');
            }
            await mutate(); // Refresh list
            setConfirmAction(null);
            setSelectedOrg(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || `Failed to ${confirmAction} organization.`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredOrgs = orgs.filter(o => 
        o.name.toLowerCase().includes(search.toLowerCase()) || 
        o.domain.toLowerCase().includes(search.toLowerCase()) || 
        o.id.includes(search)
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organizations</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage platform tenants, monitor metrics, and administer access.</p>
                </div>
            </div>

            <div className="flex bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 items-center max-w-md focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search organizations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-sm outline-none bg-transparent"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : filteredOrgs.length === 0 ? (
                    <div className="text-center p-12 text-slate-500">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="font-medium">No organizations found.</p>
                    </div>
        ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400 border-b border-slate-100">Organization</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400 border-b border-slate-100">Domain</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400 border-b border-slate-100">Consent Health</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400 border-b border-slate-100">Status</th>
                                    <th className="px-8 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400 border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrgs.map((org) => (
                                    <tr 
                                        key={org.id} 
                                        className="hover:bg-slate-50/50 transition-all group cursor-pointer" 
                                        onClick={() => navigate(`/platform/orgs/${org.id}`)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 tracking-tight text-base leading-none mb-1 group-hover:text-indigo-600 transition-colors">{org.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(org.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm text-slate-600 font-bold">{org.domain}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-2 min-w-[140px]">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-black text-slate-600">{org.metrics?.total_apps || 0} Apps / {org.metrics?.total_consents || 0} Consents</span>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${
                                                        (org.metrics?.active_consents / org.metrics?.total_consents) > 0.8 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {Math.round((org.metrics?.active_consents / org.metrics?.total_consents) * 100 || 0)}% Integrity
                                                    </span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 ${
                                                            (org.metrics?.active_consents / org.metrics?.total_consents) > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'
                                                        }`}
                                                        style={{ width: `${(org.metrics?.active_consents / org.metrics?.total_consents) * 100 || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                org.status === 'active' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {org.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {org.status === 'active' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrg(org);
                                                            setConfirmAction('pause');
                                                        }}
                                                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-amber-500 hover:bg-amber-50 transition-all shadow-sm hover:scale-110"
                                                        title="Pause Organization"
                                                    >
                                                        <PauseCircle className="w-4 h-4" />
                                                    </button>
                                                ) : org.status === 'suspended' ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedOrg(org);
                                                            setConfirmAction('resume');
                                                        }}
                                                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-all shadow-sm hover:scale-110"
                                                        title="Resume Organization"
                                                    >
                                                        <PlayCircle className="w-4 h-4" />
                                                    </button>
                                                ) : null}
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm hover:scale-110">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Confirmation Modal */}
            {confirmAction && selectedOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-8">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                            confirmAction === 'pause' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 text-center mb-2">
                            {confirmAction === 'pause' ? 'Pause Organization?' : 'Resume Organization?'}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 text-center mb-8">
                            {confirmAction === 'pause' ? (
                                <>Are you sure you want to pause <strong>{selectedOrg.name}</strong>? This will immediately deactivate all users and strictly prevent login access.</>
                            ) : (
                                <>Are you sure you want to resume <strong>{selectedOrg.name}</strong>? This will restore access to all users immediately.</>
                            )}
                        </p>
                        
                        <div className="flex gap-3 mt-auto">
                            <button
                                onClick={() => { setConfirmAction(null); setSelectedOrg(null); }}
                                className="flex-1 py-3 rounded-xl text-sm font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                                disabled={isActionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleOrgAction}
                                disabled={isActionLoading}
                                className={`flex-1 py-3 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-colors shadow-sm flex justify-center items-center gap-2 ${
                                    confirmAction === 'pause' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                                }`}
                            >
                                {isActionLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing</> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

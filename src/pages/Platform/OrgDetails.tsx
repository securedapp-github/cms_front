import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useParams, useNavigate } from 'react-router-dom';
import { platformApi } from '../../api/platformApi';
import { ArrowLeft, Ban, Loader2, Building2, AlertTriangle, ShieldCheck, History, User, AppWindow } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrgDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [confirmName, setConfirmName] = useState('');
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [isDisabling, setIsDisabling] = useState(false);
    const [activeTab, setActiveTab] = useState<'consents' | 'audit'>('consents');

    const { data: orgData, isLoading } = useSWR('platform/orgs', platformApi.listOrganizations);
    const org = orgData?.organizations.find(o => o.id === id);

    const { data: consentsData } = useSWR(id && activeTab === 'consents' ? `platform/orgs/${id}/consents` : null, () => platformApi.listOrganizationConsents(id!));
    const { data: auditData } = useSWR(id && activeTab === 'audit' ? `platform/orgs/${id}/audit-logs` : null, () => platformApi.listOrganizationAuditLogs(id!));

    const handleDisable = async () => {
        if (confirmName !== org?.name) {
            toast.error('Organization name does not match');
            return;
        }
        setIsDisabling(true);
        try {
            await platformApi.disableOrganization(id!);
            toast.success('Organization has been disabled');
            setShowDisableModal(false);
            mutate('platform/orgs');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to disable organization');
        } finally {
            setIsDisabling(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
    }

    if (!org) {
        return <div className="p-8 text-center text-slate-500">Organization not found.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/platform/orgs')} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
                        <Building2 className="w-6 h-6 mr-3 text-indigo-500" />
                        {org.name}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{org.domain} &middot; ID: {org.id}</p>
                </div>
                <div className="flex-1" />
                <button
                    onClick={() => setShowDisableModal(true)}
                    disabled={org.status !== 'active'}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${org.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                    <Ban className="w-4 h-4 mr-2" />
                    {org.status === 'active' ? 'Disable Organization' : 'Disabled'}
                </button>
            </div>

            {/* Metrics Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Apps', value: org.metrics?.total_apps || 0, icon: AppWindow, color: 'indigo' },
                    { label: 'Total Consents', value: org.metrics?.total_consents || 0, icon: ShieldCheck, color: 'emerald' },
                    { label: 'Data Principals', value: org.metrics?.total_users || 0, icon: User, color: 'purple' },
                    { label: 'Active Consents', value: org.metrics?.active_consents || 0, icon: History, color: 'amber' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                                'bg-amber-50 text-amber-600'
                            }`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value.toLocaleString()}</h3>
                    </div>
                ))}
            </div>

            {/* Custom Modal */}
            {showDisableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center px-6 py-4 bg-red-50 border-b border-red-100">
                            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                            <h2 className="text-lg font-bold text-red-900">Disable Organization</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">
                                This will immediately revoke access for all users in <span className="font-bold">{org.name}</span>. Data will not be deleted but API requests and dashboard access will be rejected.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Type organization name to confirm</label>
                                <input
                                    type="text"
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                    placeholder={org.name}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button onClick={() => setShowDisableModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button 
                                    onClick={handleDisable}
                                    disabled={confirmName !== org.name || isDisabling}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors flex items-center"
                                >
                                    {isDisabling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Confirm Disable
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('consents')}
                        className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'consents' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <ShieldCheck className="w-4 h-4 mr-2" /> Consents
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'audit' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <History className="w-4 h-4 mr-2" /> Audit Logs
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'consents' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Simple list rendering for consents overview */}
                            {!consentsData ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                                    <p className="font-bold text-sm">Loading organization consents...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(consentsData.consents || []).map((c: any) => (
                                        <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center transition-all hover:shadow-md group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                                                    <ShieldCheck className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 leading-tight uppercase tracking-tight">{c.app?.name || 'Legacy App'}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">User: {c.user_id?.substring(0, 16)}...</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged At</p>
                                                    <p className="text-xs font-bold text-slate-600">{new Date(c.created_at || Date.now()).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                                                    c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!consentsData.consents || consentsData.consents.length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                            <ShieldCheck className="w-12 h-12 mb-4 opacity-10" />
                                            <p className="font-black text-sm uppercase tracking-widest">No consents recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'audit' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                             {!auditData ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                                    <p className="font-bold text-sm">Loading activity logs...</p>
                                </div>
                             ) : (
                                <div className="space-y-3">
                                    {(auditData.logs || []).map((log: any) => (
                                        <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col space-y-3 transition-all hover:border-slate-300 hover:shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                                                        <History className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-900 uppercase tracking-tight">{log.action}</span>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{log.resource_type}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold">ID: {log.resource_id?.substring(0, 8)}...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-dotted border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actor</p>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-700">{log.actor_client_id}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!auditData.logs || auditData.logs.length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                            <History className="w-12 h-12 mb-4 opacity-10" />
                                            <p className="font-black text-sm uppercase tracking-widest">No audit history found</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

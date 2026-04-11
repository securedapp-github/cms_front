import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useParams, useNavigate } from 'react-router-dom';
import { platformApi } from '../../api/platformApi';
import { ArrowLeft, Ban, Loader2, Building2, AlertTriangle, ShieldCheck, History } from 'lucide-react';
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
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
                        <div>
                            {/* Simple list rendering for consents overview */}
                            {!consentsData ? <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> : (
                                <div className="space-y-4">
                                    {(consentsData.consents || []).map((c: any) => (
                                        <div key={c.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-bold text-slate-800">{c.app_id}</p>
                                                <p className="text-slate-500 text-xs">User: {c.user_identifier}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{c.status}</span>
                                        </div>
                                    ))}
                                    {(!consentsData.consents || consentsData.consents.length === 0) && <p className="text-slate-500 text-sm">No consents found.</p>}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'audit' && (
                        <div>
                             {!auditData ? <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> : (
                                <div className="space-y-4">
                                    {(auditData.logs || []).map((log: any) => (
                                        <div key={log.id} className="p-4 border border-slate-200 rounded-lg flex flex-col space-y-1 text-sm">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-slate-800">{log.action}</span>
                                                <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded">{log.resource_type}: {log.resource_id}</span>
                                                <span>Actor: {log.actor_client_id}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!auditData.logs || auditData.logs.length === 0) && <p className="text-slate-500 text-sm">No audit logs found.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

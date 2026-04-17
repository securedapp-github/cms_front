import React, { useState } from 'react';
import useSWR from 'swr';
import { 
    MessageSquare, 
    Search, 
    Filter, 
    Calendar, 
    Building2, 
    User, 
    Clock, 
    AlertCircle,
    CheckCircle2,
    Loader2,
    ArrowUpRight
} from 'lucide-react';
import { platformApi } from '../../api/platformApi';

const PlatformGrievances = () => {
    const [status, setStatus] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [replyError, setReplyError] = useState('');

    const { data: orgsData } = useSWR('platform/orgs', platformApi.listOrganizations);
    const { data, isLoading, mutate } = useSWR(
        ['platform/grievances', status, tenantId, startDate, endDate],
        () => platformApi.listPlatformGrievances({ 
            status, 
            tenant_id: tenantId || undefined, 
            startDate: startDate || undefined, 
            endDate: endDate || undefined 
        })
    );

    const grievances = data?.grievances || [];
    const organizations = orgsData?.organizations || [];

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'closed': return 'bg-slate-50 text-slate-700 border-slate-100';
            default: return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    const handleReplySubmit = async () => {
        setReplyError('');
        if (replyText.trim().length < 2 || replyText.trim().length > 5000) {
            setReplyError('Reply must be between 2 and 5000 characters.');
            return;
        }
        setSubmittingReply(true);
        try {
            await platformApi.replyToGrievance(selectedGrievance.id, {
                reply: replyText.trim(),
                status: replyStatus || undefined
            });
            await mutate(); // Optimistic refresh
            setSelectedGrievance(null);
            setReplyText('');
            setReplyStatus('');
        } catch (err: any) {
            setReplyError(err?.response?.data?.message || 'Failed to submit reply. Please try again.');
        } finally {
            setSubmittingReply(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Global Grievances</h1>
                <p className="text-slate-500 font-medium mt-1">Monitor and oversee user grievances across all organizations.</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Organization Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization</label>
                        <div className="relative group">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}
                            >
                                <option value="">All Organizations</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                        <div className="relative group">
                            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date Range</label>
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <div className="relative flex-1">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="date"
                                    className="w-full pl-9 pr-3 py-1.5 bg-transparent border-none text-xs font-bold text-slate-600 outline-none"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <span className="text-slate-300 font-bold text-xs uppercase">to</span>
                            <div className="relative flex-1">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="date"
                                    className="w-full pl-9 pr-3 py-1.5 bg-transparent border-none text-xs font-bold text-slate-600 outline-none"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-24 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                        <p className="font-bold text-sm">Fetching global grievances...</p>
                    </div>
                ) : grievances.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-24 text-slate-400">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
                        <p className="font-black text-sm uppercase tracking-widest">No grievances found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grievance Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {grievances.map((g: any) => (
                                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-black text-slate-900 leading-tight uppercase tracking-tight">{g.category}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1 font-medium">{g.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-700 border border-indigo-100">
                                                    {g.tenant?.name?.charAt(0) || 'O'}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{g.tenant?.name || 'Platform'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-900">{g.principal_id?.substring(0, 12)}...</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{g.principal_type || 'User'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusColor(g.status)}`}>
                                                    {g.status}
                                                </span>
                                                {g.admin_reply && (
                                                    <span className="mt-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1">
                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                        Replied
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center text-xs text-slate-500 font-bold tracking-tight">
                                                <Clock className="w-3.5 h-3.5 mr-2 opacity-30 group-hover:opacity-100 transition-opacity" />
                                                {new Date(g.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => {
                                                    setSelectedGrievance(g);
                                                    setReplyText(g.admin_reply || '');
                                                    setReplyStatus(g.status === 'pending' ? 'resolved' : g.status);
                                                    setReplyError('');
                                                }}
                                                className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest group-hover:translate-x-1 duration-300"
                                            >
                                                {g.admin_reply ? 'View / Edit Reply' : 'Reply'}
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reply Modal */}
            {selectedGrievance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900">Reply to Grievance</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Tenant: {selectedGrievance.tenant?.name || 'Platform'} • Cat: {selectedGrievance.category}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedGrievance(null)}
                                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="px-8 py-6 flex-1 overflow-y-auto space-y-6">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Original Message</p>
                                <p className="text-sm font-medium text-slate-700">{selectedGrievance.description}</p>
                            </div>
                            
                            {replyError && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2 text-rose-800">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="text-sm font-semibold">{replyError}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Reply <span className="text-rose-500">*</span></label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-32 resize-none"
                                    placeholder="Type your response to the user..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={submittingReply}
                                />
                                <div className="flex justify-between items-center mt-1 px-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${replyText.trim().length > 0 && (replyText.trim().length < 2 || replyText.trim().length > 5000) ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {replyText.length} / 5000 chars
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Status (Optional)</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={replyStatus}
                                    onChange={(e) => setReplyStatus(e.target.value)}
                                    disabled={submittingReply}
                                >
                                    <option value="">Leave default (Resolved)</option>
                                    <option value="pending">Pending</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="escalated">Escalated</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedGrievance(null)}
                                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200/50 transition-colors"
                                disabled={submittingReply}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReplySubmit}
                                disabled={submittingReply}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                            >
                                {submittingReply ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                ) : 'Submit Reply'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformGrievances;

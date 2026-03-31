import React, { useEffect, useState } from 'react';
import {
    Plus,
    FileText,
    X,
    Loader2,
    AlertTriangle,
    ShieldCheck,
    Calendar,
    Eye
} from 'lucide-react';
import { policyApi, PolicyVersion } from '../api/policyApi';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { CopyButton } from '../components/ui/CopyButton';

const PolicyVersions = () => {
    const { selectedAppId } = useAppStore();
    const [policies, setPolicies] = useState<PolicyVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyVersion | null>(null);
    const [formData, setFormData] = useState({
        version: '',
        policy_text: ''
    });

    useEffect(() => {
        if (selectedAppId) {
            fetchPolicies();
        }
    }, [selectedAppId]);

    const fetchPolicies = async () => {
        if (!selectedAppId) return;
        try {
            setLoading(true);
            const data = await policyApi.getPolicyVersions(selectedAppId);
            setPolicies(data);
        } catch (error) {
            toast.error('Failed to fetch policy versions');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppId) {
            toast.error('Please select an app first');
            return;
        }
        try {
            setIsSubmitting(true);
            await policyApi.createPolicyVersion(selectedAppId, formData);
            toast.success('New policy version published!');
            setIsModalOpen(false);
            setFormData({ version: '', policy_text: '' });
            fetchPolicies();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to publish policy');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Pending...';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const truncateId = (id: string) => {
        if (!id) return '';
        return id.length > 16 ? `${id.substring(0, 8)}…${id.slice(-4)}` : id;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Policy Versions</h2>
                    <p className="text-slate-500 font-medium text-sm">Maintain and audit your privacy policy and terms of service history.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-95 space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Publish New Version</span>
                </button>
            </div>

            {/* Main Policy List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">Loading policy history...</p>
                    </div>
                ) : policies.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No policy versions published yet.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                        >
                            Publish version 1.0
                        </button>
                    </div>
                ) : (
                    policies.map((policy) => (
                        <div key={policy.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${policy.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-slate-900">Version {policy.version}</h3>
                                            {policy.isActive && (
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">CURRENT ACTIVE</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Published: {formatDate(policy.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span
                                                    className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                                                    title={policy.id}
                                                >
                                                    {truncateId(policy.id)}
                                                </span>
                                                <CopyButton text={policy.id} iconSize={12} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedPolicy(policy)}
                                        className="inline-flex items-center px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-xs font-bold rounded-lg border border-slate-100 hover:border-indigo-100 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5 mr-2" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ──────────────── View Details Modal ──────────────── */}
            {selectedPolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setSelectedPolicy(null)}
                    />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${selectedPolicy.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Policy Version {selectedPolicy.version}</h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border mt-0.5 ${selectedPolicy.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {selectedPolicy.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPolicy(null)}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Meta */}
                        <div className="px-8 py-4 border-b border-slate-100 bg-white shrink-0">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Policy Version ID</p>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                                            title={selectedPolicy.id}
                                        >
                                            {truncateId(selectedPolicy.id)}
                                        </span>
                                        <CopyButton text={selectedPolicy.id} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Version</p>
                                    <p className="text-sm font-bold text-slate-900">v{selectedPolicy.version}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Published Date</p>
                                    <div className="flex items-center text-sm font-bold text-slate-900">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                        {formatDate(selectedPolicy.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Policy Content */}
                        <div className="flex-1 overflow-y-auto p-8 min-h-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Policy Content</p>
                            {selectedPolicy.policy_text ? (
                                <pre className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                                    {selectedPolicy.policy_text}
                                </pre>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <FileText className="w-10 h-10 mb-3 text-slate-200" />
                                    <p className="text-sm font-medium">No policy content available.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                            <button
                                onClick={() => setSelectedPolicy(null)}
                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──────────────── Publish Modal ──────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Publish New Policy</h3>
                                <p className="text-xs text-slate-500 font-medium">New versions will automatically become the active version for new users.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Version Identifier</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., 2.1.0"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Policy Content (Markdown supported)</label>
                                    <textarea
                                        required
                                        placeholder="Paste your policy content here..."
                                        rows={12}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none font-mono"
                                        value={formData.policy_text}
                                        onChange={(e) => setFormData({ ...formData, policy_text: e.target.value })}
                                    />
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                        Note: Publishing a new version will immediately update the active policy. All new user consents will be linked to this version.
                                    </p>
                                </div>
                            </div>
                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 inline-flex items-center"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Publish version
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyVersions;

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Database, Loader2, Info, Plus, Trash2, X } from 'lucide-react';
import { dataCatalogApi, DataCatalogEntry } from '../api/dataCatalogApi';
import toast from 'react-hot-toast';

export default function DataCatalog() {
    const { data, error, isLoading } = useSWR<{ data: DataCatalogEntry[] }>('dataCatalog', dataCatalogApi.listCatalog);
    const catalog = data?.data || [];

    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        data_id: '',
        category: '',
        description: '',
        sensitivity: 'LOW',
        max_validity_days: 0
    });

    const handleDelete = async (id: string, data_id: string) => {
        if (!confirm(`Are you sure you want to delete ${data_id}?`)) return;
        try {
            await dataCatalogApi.deleteEntry(data_id);
            toast.success('Data entry deleted');
            mutate('dataCatalog');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete entry');
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await dataCatalogApi.addEntry(formData);
            toast.success('Data entry added');
            setIsAdding(false);
            setFormData({ data_id: '', category: '', description: '', sensitivity: 'LOW', max_validity_days: 0 });
            mutate('dataCatalog');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add entry');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (error) {
        return <div className="p-8 text-center text-red-500">Failed to load data catalog.</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Catalog</h1>
                    <p className="text-sm text-slate-500 mt-1">Platform-wide registry of discoverable data objects and elements.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Entry
                </button>
            </div>

            {/* Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800">Add Data Entry</h2>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Data ID</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. AADHAAR_NUMBER"
                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.data_id}
                                    onChange={(e) => setFormData(p => ({ ...p, data_id: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                                <input
                                    required
                                    title="category"
                                    type="text"
                                    placeholder="e.g. Identity"
                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.category}
                                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                                <input
                                    required
                                    title="description"
                                    type="text"
                                    placeholder="Brief details..."
                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Sensitivity</label>
                                <select
                                    title="sensitivity"
                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.sensitivity}
                                    onChange={(e) => setFormData(p => ({ ...p, sensitivity: e.target.value }))}
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Max Validity Days (Optional)</label>
                                <input
                                    type="number"
                                    title="max_validity_days"
                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={formData.max_validity_days}
                                    onChange={(e) => setFormData(p => ({ ...p, max_validity_days: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
                                    {isSubmitting ? 'Saving...' : 'Save Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : catalog.length === 0 ? (
                    <div className="text-center p-12 text-slate-500">
                        <Database className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="font-medium">No data entries available.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 whitespace-nowrap">
                                <tr>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Data ID</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Category</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Sensitivity</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Status</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Description</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {catalog.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{entry.data_id}</span>
                                                <span className="text-[9px] text-slate-400 font-medium">Internal ID: {entry.id.split('-')[0]}...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {entry.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                                entry.sensitivity === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                entry.sensitivity === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}>
                                                {entry.sensitivity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                                entry.status === 'active' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                    : 'bg-slate-50 text-slate-700 border-slate-100'
                                            }`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs min-w-[250px]">
                                            <div className="flex items-start">
                                                <Info className="w-4 h-4 mr-2 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                <span className="leading-relaxed font-medium">{entry.description || 'No description provided.'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(entry.id, entry.data_id)}
                                                className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

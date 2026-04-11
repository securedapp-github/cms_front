import React, { useState } from 'react';
import useSWR from 'swr';
import { platformApi } from '../../api/platformApi';
import { Building2, Search, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrgsList() {
    const { data, isLoading } = useSWR('platform/orgs', platformApi.listOrganizations);
    const orgs = data?.organizations || [];
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

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
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 whitespace-nowrap">
                                <tr>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Organization</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Domain</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Metrics</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Status</th>
                                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredOrgs.map((org) => (
                                    <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/platform/orgs/${org.id}`)}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{org.name}</span>
                                                    <div className="flex items-center space-x-1 mt-0.5 text-slate-400">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-[10px] font-medium leading-none">
                                                            {new Date(org.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 font-medium">{org.domain}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Apps</span>
                                                    <span className="font-bold text-slate-700">{org.metrics?.total_apps || 0}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Consents</span>
                                                    <span className="font-bold text-slate-700">{org.metrics?.total_consents || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                org.status === 'active' 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                                : 'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {org.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 text-slate-300 group-hover:text-indigo-600 rounded-md transition-colors" title="Manage Organization">
                                                <ArrowRight className="w-4 h-4" />
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

import React, { useState } from 'react';
import useSWR from 'swr';
import { 
    Star, 
    MessageSquare, 
    Calendar, 
    Building2, 
    User, 
    Clock, 
    Loader2,
    ArrowUpRight,
    Tag,
    Filter,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';
import { platformApi } from '../../api/platformApi';

const PlatformFeedback = () => {
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState('');
    const [rating, setRating] = useState<string>('');
    const [tenantId, setTenantId] = useState('');
    const [principalId, setPrincipalId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const { data: orgsData } = useSWR('platform/orgs', platformApi.listOrganizations);
    const { data, isLoading } = useSWR(
        ['platform/feedback', category, tenantId, startDate, endDate, rating, principalId, page],
        () => platformApi.listPlatformFeedback({ 
            category: category || undefined, 
            tenant_id: tenantId || undefined, 
            startDate: startDate || undefined, 
            endDate: endDate || undefined,
            rating: rating ? parseInt(rating, 10) : undefined,
            principal_id: principalId || undefined,
            page,
            limit: 9
        })
    );

    const feedback = data?.feedbacks || [];
    const organizations = orgsData?.organizations || [];
    const pagination = data?.pagination || { page: 1, total_pages: 1, total: 0 };

    const handleFilterChange = (setter: (val: any) => void, val: any) => {
        setter(val);
        setPage(1); // Reset to first page on filter change
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-50'}`} 
                    />
                ))}
            </div>
        );
    };

    const getCategoryDisplay = (cat: string) => {
        return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Feedback</h1>
                    <p className="text-slate-500 font-medium mt-1">Platform-wide overview of user satisfaction and category-based insights.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                   <div className="flex flex-col items-end">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Entries</span>
                       <span className="text-xl font-black text-indigo-600 leading-none">{pagination.total}</span>
                   </div>
                   <div className="w-px h-8 bg-slate-100" />
                   <MessageSquare className="text-slate-300 w-5 h-5" />
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-12 gap-5">
                    {/* Organization Filter */}
                    <div className="space-y-2 xl:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization</label>
                        <div className="relative group">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                value={tenantId}
                                onChange={(e) => handleFilterChange(setTenantId, e.target.value)}
                            >
                                <option value="">All Organizations</option>
                                {organizations.map((org: any) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2 xl:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <div className="relative group">
                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                value={category}
                                onChange={(e) => handleFilterChange(setCategory, e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="ui_experience">UI Experience</option>
                                <option value="performance">Performance</option>
                                <option value="bug_report">Bug Report</option>
                                <option value="feature_request">Feature Request</option>
                                <option value="other">Other</option>
                                <option value="general_experience">General Experience</option>
                                <option value="dsr_request">Recent DSR Request</option>
                                <option value="grievance_resolution">Grievance Ticket Resolution</option>
                            </select>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="space-y-2 xl:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Minimum Rating</label>
                        <div className="relative group">
                            <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all appearance-none cursor-pointer"
                                value={rating}
                                onChange={(e) => handleFilterChange(setRating, e.target.value)}
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars Only</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                                <option value="1">1+ Stars</option>
                            </select>
                        </div>
                    </div>

                    {/* Principal ID Filter */}
                    <div className="space-y-2 xl:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal ID</label>
                        <div className="relative group">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <input
                                placeholder="Search by ID..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                value={principalId}
                                onChange={(e) => handleFilterChange(setPrincipalId, e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2 xl:col-span-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Date</label>
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 h-[46px]">
                            <div className="relative flex-1 h-full">
                                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    className="w-full pl-7 pr-1 h-full bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none appearance-none"
                                    value={startDate}
                                    onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                                />
                            </div>
                            <span className="text-slate-300 font-bold text-[8px] uppercase tracking-tighter">to</span>
                            <div className="relative flex-1 h-full">
                                <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    className="w-full pl-7 pr-1 h-full bg-transparent border-none text-[10px] font-bold text-slate-600 outline-none appearance-none"
                                    value={endDate}
                                    onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-32 flex flex-col items-center text-slate-400">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                        <p className="font-black text-xs uppercase tracking-[0.2em]">Synchronizing feedback data...</p>
                    </div>
                ) : feedback.length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center text-slate-400 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm mb-6">
                            <Star className="w-8 h-8 opacity-10" />
                        </div>
                        <p className="font-black text-xs uppercase tracking-[0.2em]">No feedback matches filters</p>
                        <button onClick={() => {
                            setCategory(''); setRating(''); setTenantId(''); setPrincipalId(''); setStartDate(''); setEndDate('');
                        }} className="mt-4 text-xs font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors">
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    feedback.map((f: any) => (
                        <div key={f.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden flex flex-col">
                            {/* Accent Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-colors group-hover:bg-indigo-100/50 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 duration-500" />
                            
                            {/* Top Info */}
                            <div className="flex justify-between items-start mb-6 relative">
                                <div className="space-y-2">
                                    {renderStars(f.rating)}
                                    <div className="flex items-center gap-1.5">
                                        <Badge category={f.category} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-400 uppercase tracking-tight transition-colors">
                                        {new Date(f.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest mt-0.5">
                                        {new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="flex-1 relative mb-8">
                                <div className="relative">
                                    <p className={`text-sm font-bold text-slate-700 leading-relaxed italic transition-all duration-300 ${expandedComments[f.id] ? '' : 'line-clamp-4'}`}>
                                        "{f.comment}"
                                    </p>
                                    {f.comment.length > 200 && (
                                        <button 
                                            onClick={() => toggleExpand(f.id)}
                                            className="mt-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors flex items-center gap-1"
                                        >
                                            {expandedComments[f.id] ? 'Show Less' : 'Read More'}
                                            <div className={`w-1 h-1 rounded-full bg-indigo-500 transition-all ${expandedComments[f.id] ? 'scale-150' : ''}`} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between relative mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-[11px] font-black text-white shadow-indigo-100 shadow-lg">
                                        {f.principal_id?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                                            Data Principal
                                        </p>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID:</span>
                                            <span className="text-[9px] font-bold text-slate-600 font-mono tracking-tight cursor-help" title={f.principal_id}>
                                                {f.principal_id?.substring(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="View Trace">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between bg-white px-8 py-5 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <span>Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.total_pages}</span></span>
                        <div className="w-px h-4 bg-slate-100" />
                        <span>Showing <span className="text-slate-900">{feedback.length}</span> of <span className="text-slate-900">{pagination.total}</span></span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={pagination.page === 1}
                            className="p-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="hidden md:flex items-center gap-1.5 mx-2">
                            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${
                                        pagination.page === p 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                        : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                            disabled={pagination.page === pagination.total_pages}
                            className="p-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Badge = ({ category }: { category: string }) => {
    const labels: Record<string, string> = {
        'ui_experience': 'UI Experience',
        'performance': 'Performance',
        'bug_report': 'Bug Report',
        'feature_request': 'Feature Request',
        'other': 'Other',
        'general_experience': 'General Experience',
        'dsr_request': 'Recent DSR Request',
        'grievance_resolution': 'Grievance Ticket Resolution'
    };

    const colors: Record<string, string> = {
        'ui_experience': 'bg-indigo-500 shadow-indigo-100',
        'performance': 'bg-amber-500 shadow-amber-100',
        'bug_report': 'bg-rose-500 shadow-rose-100',
        'feature_request': 'bg-emerald-500 shadow-emerald-100',
        'other': 'bg-slate-500 shadow-slate-100',
        'general_experience': 'bg-blue-500 shadow-blue-100',
        'dsr_request': 'bg-violet-500 shadow-violet-100',
        'grievance_resolution': 'bg-cyan-500 shadow-cyan-100'
    };
    
    return (
        <span className={`px-2 py-0.5 ${colors[category] || 'bg-slate-900'} text-white text-[8px] font-black uppercase tracking-widest rounded shadow-sm border border-white/10`}>
            {labels[category] || category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </span>
    );
};

export default PlatformFeedback;

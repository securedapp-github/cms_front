import { useState } from 'react';
import useSWR from 'swr';
import {
    Search,
    Filter,
    Download,
    User,
    Shield,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Activity,
    Info
} from 'lucide-react';
import { auditApi } from '../api/auditApi';
import { tenantApi } from '../api/tenantApi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { canExportCompliance } from '../utils/rbac';

interface AuditLog {
    id: string;
    action: string;
    actor_client_id: string;
    resource_type: string;
    resource_id: string;
    ip_address: string;
    created_at: string;
    metadata: any;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

// QA-020: Month/Day/Year dropdown picker so the user can NEVER see/select a date outside
// [profileCreatedAt, today]. Year list is hard-capped; months are filtered per year.
const MONTHS = [
    { v: '01', l: 'January' },
    { v: '02', l: 'February' },
    { v: '03', l: 'March' },
    { v: '04', l: 'April' },
    { v: '05', l: 'May' },
    { v: '06', l: 'June' },
    { v: '07', l: 'July' },
    { v: '08', l: 'August' },
    { v: '09', l: 'September' },
    { v: '10', l: 'October' },
    { v: '11', l: 'November' },
    { v: '12', l: 'December' },
];

function daysInMonth(year: number, month1to12: number): number {
    // month is 1..12
    return new Date(year, month1to12, 0).getDate();
}

function rangeForDate(
    ymd: string | null,
): { year?: number; minMonth?: number; maxMonth?: number; minDay?: number; maxDay?: number } {
    if (!ymd) return {};
    const [y, m, d] = ymd.split('-').map((s) => parseInt(s, 10));
    return { year: y, minMonth: m, maxMonth: m, minDay: d, maxDay: d };
}

interface DatePickerProps {
    label: string;
    value: string; // YYYY-MM-DD or ''
    onChange: (next: string) => void;
    minDate: string | null; // YYYY-MM-DD
    maxDate: string; // YYYY-MM-DD (always today)
    onOutOfRange?: (kind: 'min' | 'max') => void;
}

function clampYmd(value: string, minDate: string | null, maxDate: string): string {
    if (!value) return value;
    if (minDate && value < minDate) return minDate;
    if (value > maxDate) return maxDate;
    return value;
}

function DatePicker({ label, value, onChange, minDate, maxDate, onOutOfRange }: DatePickerProps) {
    // minDate / maxDate are inclusive bounds.
    const minInfo = minDate ? rangeForDate(minDate) : {};
    const maxInfo = rangeForDate(maxDate);
    const minYear = minInfo.year ?? maxInfo.year! - 100;
    const maxYear = maxInfo.year!;

    // Current selection, clamped into bounds.
    const safeValue = clampYmd(value, minDate, maxDate);
    const hasValue = !!safeValue;
    const selYear = hasValue ? parseInt(safeValue.slice(0, 4), 10) : minYear;
    const selMonth = hasValue ? parseInt(safeValue.slice(5, 7), 10) : (minInfo.minMonth ?? 1);
    const selDay = hasValue ? parseInt(safeValue.slice(8, 10), 10) : 1;

    // Year options: [minYear, maxYear]
    const yearOptions: number[] = [];
    for (let y = minYear; y <= maxYear; y++) yearOptions.push(y);

    // Month options for selected year.
    const monthMinForYear = selYear === minInfo.year ? (minInfo.minMonth ?? 1) : 1;
    const monthMaxForYear = selYear === maxInfo.year ? (maxInfo.maxMonth ?? 12) : 12;
    const monthOptions = MONTHS.filter((m) => {
        const mv = parseInt(m.v, 10);
        return mv >= monthMinForYear && mv <= monthMaxForYear;
    });

    // Day options for selected month/year.
    const dayMin = selYear === minInfo.year && selMonth === minInfo.minMonth ? (minInfo.minDay ?? 1) : 1;
    const dayMax = selYear === maxInfo.year && selMonth === maxInfo.maxMonth ? (maxInfo.maxDay ?? daysInMonth(selYear, selMonth)) : daysInMonth(selYear, selMonth);
    const dayOptions: number[] = [];
    for (let d = dayMin; d <= dayMax; d++) dayOptions.push(d);

    const setYmd = (y: number, m: number, d: number) => {
        const ymd = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        onChange(ymd);
    };

    const onYearChange = (raw: string) => {
        const newYear = parseInt(raw, 10);
        // Clamp month/day into the new year's bounds, then compute new YMD and clamp overall.
        const newMonthMin = newYear === minInfo.year ? (minInfo.minMonth ?? 1) : 1;
        const newMonthMax = newYear === maxInfo.year ? (maxInfo.maxMonth ?? 12) : 12;
        const m = Math.min(Math.max(selMonth, newMonthMin), newMonthMax);
        const dim = daysInMonth(newYear, m);
        const newDayMin = newYear === minInfo.year && m === minInfo.minMonth ? (minInfo.minDay ?? 1) : 1;
        const newDayMax = newYear === maxInfo.year && m === maxInfo.maxMonth ? (maxInfo.maxDay ?? dim) : dim;
        const d = Math.min(Math.max(selDay, newDayMin), newDayMax);
        const candidate = `${newYear.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const finalValue = clampYmd(candidate, minDate, maxDate);
        if (finalValue !== candidate && onOutOfRange) {
            onOutOfRange(finalValue < (minDate || '') ? 'min' : 'max');
        }
        onChange(finalValue);
    };

    const onMonthChange = (raw: string) => {
        const newMonth = parseInt(raw, 10);
        const dim = daysInMonth(selYear, newMonth);
        const newDayMin = selYear === minInfo.year && newMonth === minInfo.minMonth ? (minInfo.minDay ?? 1) : 1;
        const newDayMax = selYear === maxInfo.year && newMonth === maxInfo.maxMonth ? (maxInfo.maxDay ?? dim) : dim;
        const d = Math.min(Math.max(selDay, newDayMin), newDayMax);
        setYmd(selYear, newMonth, d);
    };

    const onDayChange = (raw: string) => {
        setYmd(selYear, selMonth, parseInt(raw, 10));
    };

    const selectClass =
        'px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all';

    return (
        <div className="flex-1 space-y-1.5">
            <div className="flex items-center pl-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <select
                    className={selectClass + ' flex-1'}
                    value={selYear}
                    onChange={(e) => onYearChange(e.target.value)}
                    aria-label={`${label} year`}
                >
                    {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <select
                    className={selectClass + ' flex-1'}
                    value={selMonth.toString().padStart(2, '0')}
                    onChange={(e) => onMonthChange(e.target.value)}
                    aria-label={`${label} month`}
                    disabled={monthOptions.length === 0}
                >
                    {monthOptions.length === 0 ? (
                        <option value="">-</option>
                    ) : (
                        monthOptions.map((m) => (
                            <option key={m.v} value={m.v}>{m.l}</option>
                        ))
                    )}
                </select>
                <select
                    className={selectClass + ' flex-1'}
                    value={selDay.toString().padStart(2, '0')}
                    onChange={(e) => onDayChange(e.target.value)}
                    aria-label={`${label} day`}
                    disabled={dayOptions.length === 0}
                >
                    {dayOptions.length === 0 ? (
                        <option value="">-</option>
                    ) : (
                        dayOptions.map((d) => (
                            <option key={d} value={d.toString().padStart(2, '0')}>{d}</option>
                        ))
                    )}
                </select>
            </div>
        </div>
    );
}

const AuditLogs = () => {
    const { user } = useAuthStore();
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    // QA-020: profile/tenant creation date is the earliest selectable audit-log date.
    // Reuse the cached 'tenant/me' SWR key so this dedupes with DashboardLayout.
    const { data: tenantData } = useSWR('tenant/me', () => tenantApi.getCurrentTenant());
    const profileCreatedAt = tenantData?.createdAt
        ? new Date(tenantData.createdAt).toISOString().slice(0, 10)
        : null;
    const today = new Date().toISOString().slice(0, 10);

    const { data: response, isLoading: loading } = useSWR(
        ['audit-logs', page, actionFilter, startDate, endDate],
        ([_, p, a, sd, ed]) => auditApi.getAuditLogs({
            page: p,
            limit: 10,
            action: a || undefined,
            from_date: sd || undefined,
            to_date: ed || undefined
        })
    );

    const logs: AuditLog[] = response?.logs || [];
    const pagination: Pagination | null = response?.pagination || null;


    const getActionColor = (action: string) => {
        if (action.includes('DELETE') || action.includes('REVOKE') || action.includes('WITHDRAWN')) return 'text-red-600 bg-red-50 border-red-100';
        if (action.includes('CREATE') || action.includes('GRANT') || action.includes('INVITE')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (action.includes('UPDATE')) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Audit Logs</h2>
                    <p className="text-slate-500 font-medium text-sm">Comprehensive trail of all administrative and system actions.</p>
                </div>
                {canExportCompliance(user?.role) && (
                    <button className="inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 transition-all active:scale-95 space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by action (e.g., PURPOSE_CREATED)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold placeholder:text-slate-400"
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowMoreFilters(!showMoreFilters)}
                            className={`inline-flex items-center px-4 py-2.5 border rounded-xl text-sm font-bold transition-all ${
                                showMoreFilters
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm shadow-indigo-50'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {showMoreFilters ? 'Close' : 'More Filters'}
                        </button>
                    </div>
                </div>

                {/* Collapsible Filter Panel */}
                {showMoreFilters && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pl-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Range</label>
                                {(startDate || endDate) && (
                                    <button
                                        type="button"
                                        onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                                        className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-widest"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="flex items-start gap-3">
                                <DatePicker
                                    label="From"
                                    value={startDate}
                                    onChange={(v) => { setStartDate(v); setPage(1); }}
                                    minDate={profileCreatedAt}
                                    maxDate={today}
                                    onOutOfRange={(kind) => {
                                        if (kind === 'min') toast.error('Start date cannot be before your profile creation date.');
                                        else toast.error('Start date cannot be in the future.');
                                    }}
                                />
                                <span className="text-xs text-slate-400 font-bold mt-9">to</span>
                                <DatePicker
                                    label="To"
                                    value={endDate}
                                    onChange={(v) => { setEndDate(v); setPage(1); }}
                                    minDate={profileCreatedAt}
                                    maxDate={today}
                                    onOutOfRange={(kind) => {
                                        if (kind === 'min') toast.error('End date cannot be before your profile creation date.');
                                        else toast.error('End date cannot be in the future.');
                                    }}
                                />
                            </div>
                            {profileCreatedAt && (
                                <p className="text-[11px] text-slate-400 font-semibold pl-1">
                                    Audit logs available from {profileCreatedAt} to {today}.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Resource</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold">Fetching activity logs...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold">No activity logs found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                                                <Activity className="w-4 h-4" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">
                                                    {new Date(log.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    {new Date(log.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500 mr-2">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">
                                                    {log.actor_client_id ? log.actor_client_id.substring(0, 13) + '...' : 'System'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-xs font-bold text-slate-500">
                                                <Shield className="w-3.5 h-3.5 mr-1.5 opacity-40" />
                                                <span className="capitalize">{log.resource_type || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                                                <Info className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Showing <span className="text-slate-900">{logs.length}</span> of <span className="text-slate-900">{pagination.total}</span> events
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </button>
                            <div className="flex items-center px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-600">
                                {page} / {pagination.total_pages}
                            </div>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page === pagination.total_pages}
                                className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;

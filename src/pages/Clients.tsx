import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import {
    UserPlus,
    MoreVertical,
    Search,
    Filter,
    Mail,
    Shield,
    CheckCircle2,
    Clock,
    X,
    Loader2,
    AlertCircle,
    Trash2,
    UserMinus,
    Edit2,
    ShieldAlert
} from 'lucide-react';
import { clientApi, Client } from '../api/clientApi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { canManageOrgRoles } from '../utils/rbac';

const Clients = () => {
    const { user } = useAuthStore();
    const { data: clients = [], isLoading: loading, mutate } = useSWR('clients', () => clientApi.getClients());
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('operations_manager');
    const [isInviting, setIsInviting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [emailWarning, setEmailWarning] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [clientToDeactivate, setClientToDeactivate] = useState<Client | null>(null);
    const [clientToRemove, setClientToRemove] = useState<Client | null>(null);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [editRole, setEditRole] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        const handleScroll = () => setActiveMenu(null);

        if (activeMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [activeMenu]);

    const handleMenuToggle = (clientId: string) => {
        if (activeMenu === clientId) {
            setActiveMenu(null);
        } else {
            const button = buttonRefs.current[clientId];
            if (button) {
                const rect = button.getBoundingClientRect();
                setMenuPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.right - 192 + window.scrollX // 192 is w-48 (dropdown width)
                });
            }
            setActiveMenu(clientId);
        }
    };

    const isGmail = (email?: string) => email?.toLowerCase().endsWith('@gmail.com');

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isGmail(inviteEmail)) {
            toast.error('Only Gmail accounts (@gmail.com) are allowed');
            return;
        }
        try {
            setIsInviting(true);
            await clientApi.inviteClient({ email: inviteEmail.toLowerCase().trim(), role: inviteRole });
            toast.success('Client invited successfully');
            setIsInviteModalOpen(false);
            setInviteEmail('');
            mutate();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to invite client');
        } finally {
            setIsInviting(false);
        }
    };

    const handleUpdateStatus = async (clientId: string, status: 'active' | 'suspended') => {
        try {
            setIsActionLoading(true);
            await clientApi.updateClientStatus(clientId, status);
            toast.success(`Client ${status === 'suspended' ? 'deactivated' : 'activated'} successfully`);
            mutate();
            setClientToDeactivate(null);
            setActiveMenu(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update status');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRemoveClient = async (clientId: string) => {
        try {
            setIsActionLoading(true);
            await clientApi.deleteClient(clientId);
            toast.success('Client removed successfully');
            mutate();
            setClientToRemove(null);
            setActiveMenu(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to remove client');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientToEdit) return;
        try {
            setIsActionLoading(true);
            await clientApi.updateClientRole(clientToEdit.id, editRole);
            toast.success('Client role updated successfully');
            mutate();
            setClientToEdit(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update role');
        } finally {
            setIsActionLoading(false);
        }
    };

    const getInitials = (name?: string, email?: string) => {
        if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        if (email) return email.substring(0, 2).toUpperCase();
        return '??';
    };

    const filteredClients = clients.filter(c =>
        (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
                    <p className="text-slate-500 font-medium text-sm">Manage your organization's clients and their access levels.</p>
                </div>
                {canManageOrgRoles(user?.role) && (
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-95 space-x-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Invite Client</span>
                    </button>
                )}
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 font-medium">Loading clients...</p>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <p className="text-sm text-slate-500 font-medium">No clients found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3 border-2 border-white shadow-sm">
                                                    {getInitials(client.name, client.email)}
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium flex items-center mt-0.5">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {client.email}
                                                        {!isGmail(client.email) && (
                                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold">
                                                                <ShieldAlert className="w-2.5 h-2.5 mr-1" />
                                                                Non-Gmail
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm font-semibold text-slate-700">
                                                <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                <span className="capitalize">{client.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                                client.status === 'suspended'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : client.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-slate-50 text-slate-700 border-slate-100'
                                            }`}>
                                                {client.status === 'inactive' ? 'Pending' : (client.status?.charAt(0).toUpperCase() + (client.status?.slice(1) || 'Active'))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <button
                                                    ref={el => buttonRefs.current[client.id] = el}
                                                    onClick={() => handleMenuToggle(client.id)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {activeMenu === client.id && createPortal(
                                                    <div 
                                                        ref={menuRef}
                                                        style={{ 
                                                            position: 'absolute', 
                                                            top: menuPosition.top, 
                                                            left: menuPosition.left,
                                                            zIndex: 9999 
                                                        }}
                                                        className="w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200"
                                                    >
                                                        <button 
                                                            className="w-full px-4 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                                            onClick={() => {
                                                                setClientToEdit(client);
                                                                setEditRole(client.role || 'operations_manager');
                                                                setActiveMenu(null);
                                                            }}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Edit Profile
                                                        </button>
                                                        {client.status !== 'suspended' ? (
                                                            <button 
                                                                className="w-full px-4 py-2 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                                                                onClick={() => setClientToDeactivate(client)}
                                                            >
                                                                <UserMinus className="w-4 h-4" />
                                                                Deactivate
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="w-full px-4 py-2 text-left text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                                                                onClick={() => handleUpdateStatus(client.id, 'active')}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                Activate
                                                            </button>
                                                        )}
                                                        <div className="my-1 border-t border-slate-100" />
                                                        <button 
                                                            className="w-full px-4 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                                                            onClick={() => setClientToRemove(client)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Remove
                                                        </button>
                                                    </div>,
                                                    document.body
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsInviteModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">Invite New Client</h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="p-8 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={inviteEmail}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setInviteEmail(val);
                                            if (/[A-Z]/.test(val)) {
                                                setEmailWarning('Capital letters are not allowed in email');
                                            } else if (val && !val.toLowerCase().endsWith('@gmail.com')) {
                                                setEmailWarning('Only Gmail accounts (@gmail.com) are allowed');
                                            } else {
                                                setEmailWarning('');
                                            }
                                        }}
                                    />
                                    {emailWarning && (
                                        <p className="text-[10px] text-amber-600 font-bold mt-1 ml-1 flex items-center gap-1 animate-pulse">
                                            <AlertCircle className="w-3 h-3" /> {emailWarning}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Role</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                    >
                                        <option value="org_admin">Org Admin</option>
                                        <option value="operations_manager">Operations Manager</option>
                                        <option value="auditor_compliance">Auditor / Compliance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
                                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isInviting || !!emailWarning || !inviteEmail}
                                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 inline-flex items-center"
                                >
                                    {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Send Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deactivate Confirmation Modal */}
            {clientToDeactivate && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <UserMinus className="w-10 h-10 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Deactivate Client</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                Are you sure you want to deactivate <span className="text-slate-900 font-bold">{clientToDeactivate.email}</span>? They will lose access to the platform immediately.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setClientToDeactivate(null)}
                                    disabled={isActionLoading}
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(clientToDeactivate.id, 'suspended')}
                                    disabled={isActionLoading}
                                    className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Confirmation Modal */}
            {clientToRemove && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10 text-rose-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Remove Client</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                Are you sure you want to permanently remove <span className="text-slate-900 font-bold">{clientToRemove.email}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setClientToRemove(null)}
                                    disabled={isActionLoading}
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRemoveClient(clientToRemove.id)}
                                    disabled={isActionLoading}
                                    className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Remove'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {clientToEdit && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900">Edit Client Role</h3>
                            <button onClick={() => setClientToEdit(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateRole}>
                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                                        {getInitials(clientToEdit.name, clientToEdit.email)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{clientToEdit.name || 'Client'}</div>
                                        <div className="text-xs text-indigo-600 font-medium">{clientToEdit.email}</div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Assign New Role</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value)}
                                    >
                                        <option value="org_admin">Org Admin</option>
                                        <option value="operations_manager">Operations Manager</option>
                                        <option value="auditor_compliance">Auditor / Compliance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
                                <button type="button" onClick={() => setClientToEdit(null)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Update Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { hasPermission, ROLE_PERMISSIONS, Role } from '../../utils/rbac';
import { 
    ShieldCheck, 
    ShieldAlert, 
    Users, 
    Key, 
    FileText, 
    BarChart, 
    CheckCircle, 
    XCircle,
    RefreshCw
} from 'lucide-react';

const ACTIONS = [
    { id: 'manage_roles', label: 'Create/Manage Roles', icon: Users },
    { id: 'view_consents', label: 'View Consents', icon: FileText },
    { id: 'manage_api', label: 'Manage API Keys', icon: Key },
    { id: 'view_reports', label: 'View Reports', icon: BarChart },
    { id: 'view_audit_logs', label: 'View Audit Logs', icon: ShieldCheck },
    { id: 'disable_org', label: 'Disable Organization', icon: ShieldAlert, permission: 'disable_org' }
];

const ROLES_TO_TEST: Role[] = ['super_admin', 'org_admin', 'operations_manager', 'auditor_compliance'];

const RBACTest: React.FC = () => {
    const { user, updateUserRole } = useAuthStore();
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [isRunningTests, setIsRunningTests] = useState(false);

    const currentRole = user?.role || 'Guest';

    const handleRoleSwitch = (role: Role) => {
        updateUserRole(role);
    };

    const runAutoTests = () => {
        setIsRunningTests(true);
        const results = [
            { name: "Super Admin Access Check", expected: "Full Access", result: hasPermission('super_admin', 'any_action') ? 'PASSED' : 'FAILED' },
            { name: "Org Admin Manage API", expected: "Allowed", result: hasPermission('org_admin', 'manage_api') ? 'PASSED' : 'FAILED' },
            { name: "Operations Manage Roles", expected: "Forbidden", result: !hasPermission('operations_manager', 'manage_roles') ? 'PASSED' : 'FAILED' },
            { name: "Operations Manage Consents", expected: "Allowed", result: hasPermission('operations_manager', 'manage_consents') ? 'PASSED' : 'FAILED' },
            { name: "Auditor Delete/Manage Consents", expected: "Forbidden", result: !hasPermission('auditor_compliance', 'manage_consents') ? 'PASSED' : 'FAILED' },
            { name: "Org Admin Disable Org", expected: "Forbidden", result: !hasPermission('org_admin', 'disable_org') ? 'PASSED' : 'FAILED' },
            { name: "Auditor View Audit Logs", expected: "Allowed", result: hasPermission('auditor_compliance', 'view_audit_logs') ? 'PASSED' : 'FAILED' },
        ];
        
        setTimeout(() => {
            setScenarios(results);
            setIsRunningTests(false);
        }, 1000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">RBAC Validation Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">Dynamic testing and verification of the Role-Based Access Control matrix.</p>
                </div>
                <button 
                    onClick={runAutoTests}
                    disabled={isRunningTests}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={`mr-2 h-5 w-5 ${isRunningTests ? 'animate-spin' : ''}`} />
                    Run Automated Scenarios
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Role Switcher & Status */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="px-6 py-8 bg-gradient-to-br from-indigo-50 to-white">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <Users className="h-6 w-6 mr-2 text-indigo-600" />
                                identity Simulation
                            </h2>
                            <div className="flex items-center space-x-4 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                                    {(user?.name || 'U')[0]}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-gray-900">{user?.name || 'Test User'}</div>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                                        {currentRole.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Switch Role for Testing</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {ROLES_TO_TEST.map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => handleRoleSwitch(role)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                                currentRole === role 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                        >
                                            {role.replace('_', ' ')}
                                            {currentRole === role && <CheckCircle className="h-5 w-5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auto-Test Results */}
                    {scenarios.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-in slide-in-from-left duration-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Auto-Validation Scenarios</h3>
                            <div className="space-y-4">
                                {scenarios.map((s, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div>
                                            <div className="text-sm font-semibold text-gray-800">{s.name}</div>
                                            <div className="text-xs text-gray-500">Expected: {s.expected}</div>
                                        </div>
                                        <div className={`flex items-center text-sm font-bold ${s.result === 'PASSED' ? 'text-green-600' : 'text-red-600'}`}>
                                            {s.result === 'PASSED' ? <CheckCircle className="h-5 w-5 mr-1" /> : <XCircle className="h-5 w-5 mr-1" />}
                                            {s.result}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Permission Matrix */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="px-8 py-8 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Dynamic Permission Matrix</h2>
                            <p className="text-sm text-gray-500 mt-1">Real-time validation of account permissions based on your requirements.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Target Action</th>
                                        {ROLES_TO_TEST.map(role => (
                                            <th key={role} scope="col" className={`px-4 py-4 text-center text-xs font-bold uppercase tracking-widest ${currentRole === role ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500'}`}>
                                                {role.replace('_', ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {ACTIONS.map((action) => (
                                        <tr key={action.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                                        {action.icon && <action.icon className="h-5 w-5 text-indigo-600" />}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900">{action.label}</span>
                                                </div>
                                            </td>
                                            {ROLES_TO_TEST.map(role => {
                                                const allowed = hasPermission(role, action.id);
                                                return (
                                                    <td key={role} className={`px-4 py-5 text-center whitespace-nowrap ${currentRole === role ? 'bg-indigo-50/50' : ''}`}>
                                                        {allowed ? (
                                                            <div className="inline-flex items-center justify-center p-1 bg-green-100 rounded-lg text-green-700">
                                                                <CheckCircle className="h-6 w-6" />
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center justify-center p-1 bg-red-100 rounded-lg text-red-700">
                                                                <XCircle className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Example UI Blocks */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Live UI Enforcement (Example)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50 space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role Management</p>
                                {hasPermission(currentRole, "manage_roles") ? (
                                    <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                                        <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-800 text-sm font-medium">
                                            Role management access enabled.
                                        </div>
                                        <button className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Create New Role</button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-200/50 border border-gray-200 border-dashed rounded-xl text-gray-400 text-sm text-center py-8">
                                        Access Restricted
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50 space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">API Configuration</p>
                                <div className="space-y-4">
                                    <div className={`p-3 rounded-xl text-sm font-medium border ${hasPermission(currentRole, "manage_api") ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                                        {hasPermission(currentRole, "manage_api") 
                                            ? 'Full Write Access' 
                                            : 'Read-only Access (Restricted)'}
                                    </div>
                                    <button 
                                        disabled={!hasPermission(currentRole, "manage_api")}
                                        className="w-full py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 transition-all"
                                    >
                                        Generate New API Key
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RBACTest;

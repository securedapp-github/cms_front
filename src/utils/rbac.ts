export type Role = 'super_admin' | 'org_admin' | 'operations_manager' | 'auditor_compliance';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: ["*"],
  org_admin: [
    "manage_roles",
    "assign_roles",
    "manage_templates",
    "manage_purposes",
    "manage_api",
    "view_reports",
    "view_audit_logs",
    "view_consents"
  ],
  operations_manager: [
    "manage_consents",
    "view_consents",
    "handle_requests",
    "view_dashboard"
  ],
  auditor_compliance: [
    "view_consents",
    "view_audit_logs",
    "export_reports",
    "view_compliance"
  ]
};

export const hasPermission = (userRole: string | undefined, permission: string): boolean => {
  if (!userRole) return false;
  const rolePermissions = ROLE_PERMISSIONS[userRole as Role];
  if (!rolePermissions) return false;
  return rolePermissions.includes("*") || rolePermissions.includes(permission);
};

// Legacy helpers for compatibility with existing components
export const canViewPlatformLevel = (role?: string) => hasPermission(role, 'disable_org');
export const canManageOrgRoles = (role?: string) => hasPermission(role, 'manage_roles');
export const canManageDataCatalog = (role?: string) => hasPermission(role, 'manage_templates');
export const canManagePurposes = (role?: string) => hasPermission(role, 'manage_purposes');
export const canManageCredentials = (role?: string) => hasPermission(role, 'manage_api');
export const canManageConsentState = (role?: string) => hasPermission(role, 'manage_consents');
export const canViewAudit = (role?: string) => hasPermission(role, 'view_audit_logs');
export const canExportCompliance = (role?: string) => hasPermission(role, 'export_reports');
export const canViewManageApps = (role?: string) => hasPermission(role, 'manage_api');
export const canManagePolicies = (role?: string) => hasPermission(role, 'manage_templates');
export const canManageDSR = (role?: string) => hasPermission(role, 'handle_requests');
export const canManageTenantProfile = (role?: string) => hasPermission(role, 'manage_api');
export const canViewOrgData = (role?: string) => !!role;
export const canViewSensitiveConfig = (role?: string) => hasPermission(role, 'manage_api');

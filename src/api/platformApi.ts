import apiClient from './apiClient';

export interface PlatformDashboardSummary {
    total_organizations: number;
    total_consents: number;
    active_consents: number;
    total_users: number;
    total_apps: number;
    total_webhooks: number;
}

export interface PlatformDashboardOrg {
    id: string;
    organization_name: string;
    status: string;
    consent_flow_split: {
        embedded_apps: number;
        redirect_apps: number;
    };
    metrics: {
        total_consents: number;
        active_consents: number;
        total_users: number;
        total_clients: number;
        total_apps: number;
        total_webhooks: number;
    };
}

export interface PlatformDashboardResponse {
    summary: PlatformDashboardSummary;
    organizations: PlatformDashboardOrg[];
}

export interface PlatformOrg {
    id: string;
    name: string;
    domain: string;
    status: string;
    created_at: string;
    metrics: {
        total_apps: number;
        total_consents: number;
    };
}

export const platformApi = {
    listOrganizations: async () => {
        const response = await apiClient.get<{ organizations: PlatformOrg[] }>('/platform/orgs');
        return response.data;
    },
    getDashboardData: async (params?: { status?: string; search?: string; startDate?: string; endDate?: string }) => {
        const response = await apiClient.get<PlatformDashboardResponse>('/platform/dashboard', { params });
        return response.data;
    },
    listOrganizationConsents: async (tenantId: string) => {
        const response = await apiClient.get(`/platform/orgs/${tenantId}/consents`);
        return response.data;
    },
    listOrganizationAuditLogs: async (tenantId: string) => {
        const response = await apiClient.get(`/platform/orgs/${tenantId}/audit-logs`);
        return response.data;
    },
    disableOrganization: async (tenantId: string) => {
        const response = await apiClient.patch(`/platform/orgs/${tenantId}/disable`);
        return response.data;
    }
};

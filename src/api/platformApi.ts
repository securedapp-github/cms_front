import apiClient from './apiClient';

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

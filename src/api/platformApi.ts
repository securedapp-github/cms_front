import apiClient from './apiClient';

export interface PlatformDashboardSummary {
    total_organizations: number;
    total_consents: number;
    active_consents: number;
    total_users: number;
    total_apps: number;
    total_webhooks: number;
    total_data_principals: number;
    total_grievances: number;
    pending_grievances: number;
    resolved_grievances: number;
    average_rating: number;
    total_feedback: number;
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
        total_consents: number;
        active_consents: number;
        total_users: number;
        total_clients: number;
        total_apps: number;
        total_webhooks: number;
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
    },
    listPlatformGrievances: async (params?: { status?: string; tenant_id?: string; startDate?: string; endDate?: string }) => {
        const response = await apiClient.get('/platform/grievances', { params });
        return response.data;
    },
    listPlatformFeedback: async (params?: { 
        category?: string; 
        tenant_id?: string; 
        startDate?: string; 
        endDate?: string;
        rating?: number;
        principal_id?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await apiClient.get('/platform/feedback', { params });
        return response.data;
    },
    replyToGrievance: async (grievanceId: string, data: { reply: string; status?: string }) => {
        const response = await apiClient.patch(`/platform/grievances/${grievanceId}/reply`, data);
        return response.data;
    },
    createSuperAdmin: async (data: { email: string; name?: string }) => {
        const response = await apiClient.post('/platform/super-admins', data);
        return response.data;
    },
    pauseOrganization: async (tenantId: string) => {
        const response = await apiClient.patch(`/platform/orgs/${tenantId}/pause`);
        return response.data;
    },
    resumeOrganization: async (tenantId: string) => {
        const response = await apiClient.patch(`/platform/orgs/${tenantId}/resume`);
        return response.data;
    }
};

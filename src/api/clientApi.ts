import apiClient from './apiClient';

export interface Client {
    id: string;
    name: string;
    email?: string;
    role?: string;
    status?: string;
}

export interface InviteClientRequest {
    email: string;
    role: string;
}

export const clientApi = {
    getClients: async () => {
        const response = await apiClient.get<{ clients: Client[] }>('/clients');
        return response.data.clients;
    },
    inviteClient: async (data: InviteClientRequest) => {
        const response = await apiClient.post('/clients/invite', data);
        return response.data;
    },
    updateClientRole: async (id: string, role: string) => {
        const response = await apiClient.patch(`/clients/${id}/role`, { role });
        return response.data;
    },
    updateClientStatus: async (id: string, status: 'active' | 'suspended') => {
        const response = await apiClient.patch(`/clients/${id}/status`, { status });
        return response.data;
    },
    deleteClient: async (id: string) => {
        const response = await apiClient.delete(`/clients/${id}`);
        return response.data;
    }
};

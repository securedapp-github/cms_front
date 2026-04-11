import apiClient from './apiClient';

export interface GoogleLoginRequest {
    googleToken: string;
}

export interface LoginResponse {
    token: string;
    tenant_id: string;
    client_id: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface AuthMeResponse {
    client: User;
    tenant: any;
    permissions: string[];
}

export const authApi = {
    loginWithGoogle: async (data: GoogleLoginRequest) => {
        const response = await apiClient.post<LoginResponse>('/auth/google-login', data);
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await apiClient.get<AuthMeResponse>('/auth/me');
        return response.data;
    },
};

import apiClient from './apiClient';

export interface Certificate {
    id: string;
    tenant_id: string;
    csr: string;
    certificate: string;
    serial_number: string | null;
    active: boolean;
    expires_at: string | null;
    created_at: string;
}

export const mtlsApi = {
    getCaCertificate: async () => {
        const response = await apiClient.get<{ success: boolean; ca_certificate: string }>('/tenant/mtls/ca');
        return response.data.ca_certificate;
    },
    listCertificates: async () => {
        const response = await apiClient.get<{ success: boolean; data: Certificate[] }>('/tenant/mtls/certs');
        return response.data.data;
    },
    signCsr: async (csr: string) => {
        const response = await apiClient.post<{ success: boolean; data: Certificate }>('/tenant/mtls/sign', { csr });
        return response.data.data;
    },
    deactivateCertificate: async (id: string) => {
        const response = await apiClient.post<{ success: boolean; data: Certificate }>(`/tenant/mtls/certs/${id}/deactivate`);
        return response.data.data;
    }
};

import apiClient from './apiClient';

export interface DataCatalogEntry {
    id: string;
    data_id: string;
    display_name?: string;
    description: string;
    category: string;
    sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'RESTRICTED';
    status: 'active' | 'inactive';
}

export const dataCatalogApi = {

    // List all active data catalog entries
    listCatalog: async (include_inactive: boolean = false): Promise<{ data: DataCatalogEntry[] }> => {
        const response = await apiClient.get('/data-catalog', { params: { include_inactive } });
        return { data: response.data.data_catalog };
    },

    // Get a specific data catalog entry by data_id
    getEntry: async (dataId: string): Promise<DataCatalogEntry> => {
        const response = await apiClient.get(`/data-catalog/${dataId}`);
        return response.data;
    },

    // Add a new data catalog entry
    addEntry: async (payload: { data_id: string, display_name?: string, category: string, description: string, sensitivity: string, max_validity_days: number }): Promise<DataCatalogEntry> => {
        const response = await apiClient.post('/data-catalog', payload);
        return response.data;
    },

    // Remove a data catalog entry
    deleteEntry: async (dataId: string): Promise<{ message: string, data_id: string, status: string }> => {
        const response = await apiClient.delete(`/data-catalog/${dataId}`);
        return response.data;
    }
};
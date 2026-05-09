import type { RevenueData } from '../types/Report';
import { api } from './apiClient';

const ENDPOINT = '/revenue';

export const getRevenueData = async (): Promise<RevenueData[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/monthly`);

        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        throw error;
    }
};
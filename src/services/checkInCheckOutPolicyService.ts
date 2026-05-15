import { checkinCheckoutPoliciesApi } from './apiClient';
import type { CheckInCheckOutPolicy } from '@/types/CheckInCheckOutPolicy';

export const getAllPolicies = async (): Promise<CheckInCheckOutPolicy[]> => {
    try {
        const response = await checkinCheckoutPoliciesApi.get('');
        return response.data;
    } catch (error) {
        console.error('Error fetching policies:', error);
        throw error;
    }
};

export const savePolicy = async (policy: Partial<CheckInCheckOutPolicy>): Promise<CheckInCheckOutPolicy> => {
    try {
        const response = await checkinCheckoutPoliciesApi.post('', policy);
        return response.data;
    } catch (error) {
        console.error('Error saving policy:', error);
        throw error;
    }
};

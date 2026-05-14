import { api } from './apiClient';
import axios from 'axios';

import type { HourlyRatePolicy } from '../types/HourlyRatePolicy';

const ENDPOINT = '/principle/hourly-rate-policies';

// GET /hourly-rate-policies/base-rates
export async function getAllPolicyBaseRates(): Promise<HourlyRatePolicy[]> {
    try {
        const res = await api.get(`${ENDPOINT}`);
        return res.data as HourlyRatePolicy[];
    } catch (err: unknown) {
        throw formatAxiosError(err);
    }
}

// POST /hourly-rate-policies/save
export async function saveHourlyRatePolicy(
    policy: Partial<HourlyRatePolicy>,
): Promise<HourlyRatePolicy> {
    try {
        console.log('API POST', `${ENDPOINT}/save`, policy);
        const res = await api.post(`${ENDPOINT}/save`, policy);
        return res.data as HourlyRatePolicy;
    } catch (err: unknown) {
        // Try to extract server message
        if (axios.isAxiosError(err)) {
            const resp = err.response;
            const data = resp?.data;
            const msg =
                data && (data.message || data.error || typeof data === 'string')
                    ? data.message || data.error || data
                    : err.message;
            const e = new Error(String(msg));
            // attach full response for debug
            (e as any).response = resp;
            throw e;
        }
        throw formatAxiosError(err);
    }
}

// Normalize axios/server errors (same pattern as other services)
function formatAxiosError(err: unknown): Error {
    if (axios.isAxiosError(err)) {
        const resp = err.response;
        if (resp && resp.data) {
            const data = resp.data as any;
            const msg =
                typeof data === 'string'
                    ? data
                    : data.message ?? JSON.stringify(data);
            return new Error(msg);
        }
        return new Error(err.message || 'Network error');
    }
    return err instanceof Error ? err : new Error(String(err));
}

export default {
    getAllPolicyBaseRates,
    saveHourlyRatePolicy,
};

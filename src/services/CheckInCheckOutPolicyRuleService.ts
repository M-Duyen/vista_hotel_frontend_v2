import { api } from './apiClient';
import axios from 'axios';
import type { CheckInCheckOutPolicyRule } from '../types/CheckInCheckOutPolicyRule';

const ENDPOINT = '/checkin-checkout-policy-rules';

/**
 * Fetch all check-in/check-out policy rules
 * GET /checkin-checkout-policy-rules
 */
export async function getAllRules(): Promise<CheckInCheckOutPolicyRule[]> {
    try {
        const res = await api.get(ENDPOINT);
        return res.data as CheckInCheckOutPolicyRule[];
    } catch (err: unknown) {
        throw formatAxiosError(err);
    }
}

/**
 * Fetch a single rule by id
 * GET /checkin-checkout-policy-rules/{id}
 */
export async function getRuleById(
    id: number | string,
): Promise<CheckInCheckOutPolicyRule> {
    try {
        const res = await api.get(`${ENDPOINT}/${id}`);
        return res.data as CheckInCheckOutPolicyRule;
    } catch (err: unknown) {
        throw formatAxiosError(err);
    }
}

/**
 * Create or update a rule
 * POST /checkin-checkout-policy-rules/save
 */
export async function saveRule(
    rule: Partial<CheckInCheckOutPolicyRule>,
): Promise<CheckInCheckOutPolicyRule> {
    try {
        const res = await api.post(`${ENDPOINT}/save`, rule);
        return res.data as CheckInCheckOutPolicyRule;
    } catch (err: unknown) {
        throw formatAxiosError(err);
    }
}

// helper to normalize axios/server errors
function formatAxiosError(err: unknown): Error {
    if (axios.isAxiosError(err)) {
        const resp = err.response;
        if (resp && resp.data) {
            const data = resp.data;
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
    getAllRules,
    getRuleById,
    saveRule,
};

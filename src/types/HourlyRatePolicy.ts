export type BaseRateItem = {
    id?: number;
    baseHours: number;
    baseRate: number;
};


export type BaseRateMap = Record<string, number>;

export interface HourlyRatePolicy {
    id?: number;
    policyName?: string;
    weekendSurcharge?: number;
    weekendDays?: string[];
    baseRates?: BaseRateItem[] | BaseRateMap;
}

export type RuleType = 'EARLY_CHECKIN' | 'LATE_CHECKOUT';

export interface CheckInCheckOutPolicyRule {
    id?: number;
    type?: RuleType;
    startTime?: string;
    endTime?: string;
    surchargePercentage?: number;
    isDayCharge?: boolean;
    freeForMinRankLevel?: number;
    policyId?: number;
}

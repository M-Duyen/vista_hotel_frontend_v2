import type { Customer } from "./Customer";
import type { Voucher } from "./Voucher";

export interface CustomerVoucher {
  customer: Customer;
  voucher: Voucher;
  state: boolean;
}

export interface DistributionCriteria {
  membershipLevel?: string[];
  gender?: string[];
  birthMonth?: number[];
  minLoyaltyPoints?: number;
}

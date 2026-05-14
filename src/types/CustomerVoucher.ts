import type { Customer } from "./Customer";
import type { Voucher } from "./Voucher";

export interface CustomerVoucherId {
  customerId: string;
  voucherId: string;
}

export interface CustomerVoucher {
  id?: CustomerVoucherId;
  customer?: Customer;
  voucher: Voucher;
  state: boolean;
}

export interface CustomerVoucherRequest {
  customerId: string;
  voucherId: string;
  state?: boolean;
}

export interface DistributionCriteria {
  membershipLevel?: string[];
  gender?: string[];
  birthMonth?: number[];
  minLoyaltyPoints?: number;
}

export interface Voucher {
  voucherId: string;
  voucherName: string;
  discountPercentage: number;
  discountValue: number;
  startDate: Date | string;
  endDate: Date | string;
  discountType: "PERCENT" | "FIXED" | string;
  isActive: boolean;
  active?: boolean;
  usedCount?: number;
}

export interface Voucher {
  voucherID: string;
  voucherName: string;
  discountPercentage: number;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  discountType: string;
  isActive: boolean;
}

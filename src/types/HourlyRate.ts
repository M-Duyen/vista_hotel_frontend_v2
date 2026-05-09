export interface HourlyRatePolicy {
  hours: number;
  percentage: number;
}

export interface HourlyRateCalculation {
  basePrice: number;
  hours: number;
  basePercentage: number;
  isWeekend: boolean;
  weekendSurcharge: number;
  totalPercentage: number;
  totalAmount: number;
  breakdown: string[];
}

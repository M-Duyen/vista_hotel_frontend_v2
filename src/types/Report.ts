// ====================== INTERFACES ======================
export interface RevenueData {
  label: string;
  totalRevenue: number;
  roomRevenue?: number;
  serviceRevenue?: number;
  bookingCount?: number;
  day?: number;
  month?: number;
  year?: number;
  week?: number;
  quarter?: number;
  date?: string;
}

export interface OccupancyData {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  roomType?: string;
}

export interface LoyaltyData {
  month: string;
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
  totalPoints: number;
}

export interface ReviewData {
  date: string;
  averageRating: number;
  totalReviews: number;
  roomQuality: number;
  service: number;
  location: number;
  value: number;
  sentimentScore: number;
}

export interface BookingData {
  period: string; // Match backend field name
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  averageBookingValue: number;
  totalRevenue: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

// ====================== ReportPeriod ======================
export type ReportPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

// ====================== ServiceData ======================
export interface ServiceData {
  date: string;
  foodBeverage: number;
  laundry: number;
  spa: number;
  transport: number;
  tour: number;
  others: number;
  totalOrders: number;
  avgOrderValue: number;
  services?: ServiceRevenueItem[];
}

export interface ServiceRevenueItem {
  serviceId?: string;
  serviceName: string;
  serviceCategory?: string;
  orders: number;
  revenue: number;
}

export interface RoomOccupancyData {
  period: string;
  totalRooms: number;
  bookedRooms: number;
  occupancyRate: number;
  averageRate: number;
  totalRevenue: number;
}

// ====================== ReportTab ======================
export type ReportTab =
  | "revenue"
  | "occupancy"
  | "loyalty"
  | "reviews"
  | "bookings"
  | "services"
  | "room-occupancy";

import { api } from "./apiClient";

import type {
  OccupancyData,
  LoyaltyData,
  ReviewData,
  BookingData,
  ServiceData,
  RoomOccupancyData,
} from "../types/Report";

const ENDPOINT = "/api/reports";

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  occupancyRate: number;
  occupancyChange: number;
  totalGuests: number;
  guestsChange: number;
  availableRooms: number;
  bookedRooms: number;
  maintenanceRooms: number;
  cleaningRooms: number;
  avgRating: number;
  totalReviews: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  revenueData: RevenueData[];
  roomTypeData: RoomTypeData[];
  bookingStatusData: BookingStatusData[];
  dailyOccupancy: DailyOccupancy[];
  popularServices: PopularService[];
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
}

export interface RoomTypeData {
  name: string;
  count: number;
}

export interface BookingStatusData {
  status: string;
  count: number;
}

export interface DailyOccupancy {
  day: string;
  rate: number;
}

export interface PopularService {
  name: string;
  orders: number;
  revenue: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get(`${ENDPOINT}/dashboard`);
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

// =======================
// SERVICE REPORT (DẠNG BIỂU ĐỒ)
/// =======================

export interface ServiceReportData {
  date: string;
  foodBeverage: number;
  laundry: number;
  spa: number;
  transport: number;
  tour: number;
  others: number;
  totalOrders: number;
  avgOrderValue: number;
}

export const reportService = {
  // Revenue Report
  getRevenueReport: async (
    startDate: string,
    endDate: string
  ): Promise<RevenueData[]> => {
    const response = await api.get(`${ENDPOINT}/revenue/by-date-range`, {
      params: { fromDate: startDate, toDate: endDate },
    });
    return response.data;
  },

  // Occupancy Report
  getOccupancyReport: async (
    startDate: string,
    endDate: string
  ): Promise<OccupancyData[]> => {
    const response = await api.get(`${ENDPOINT}/occupancy`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Loyalty Report
  getLoyaltyReport: async (
    startDate: string,
    endDate: string,
    period: string = "MONTHLY"
  ): Promise<LoyaltyData[]> => {
    const response = await api.get(`${ENDPOINT}/loyalty`, {
      params: { startDate, endDate, period },
    });
    return response.data;
  },

  // Review Report
  getReviewReport: async (
    startDate: string,
    endDate: string
  ): Promise<ReviewData[]> => {
    const response = await api.get(`${ENDPOINT}/reviews`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Booking Report
  getBookingReport: async (
    startDate: string,
    endDate: string,
    period: string = "MONTHLY"
  ): Promise<BookingData[]> => {
    const response = await api.get(`${ENDPOINT}/booking`, {
      params: { startDate, endDate, period },
    });
    return response.data;
  },

  getServiceReportTable: async (
    startDate: string,
    endDate: string
  ): Promise<ServiceData[]> => {
    const response = await api.get(`${ENDPOINT}/services`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getServiceReportChart: async (
    startDate: string,
    endDate: string,
    period: string = "monthly"
  ): Promise<ServiceReportData[]> => {
    const response = await api.get(`${ENDPOINT}/services/chart`, {
      params: { startDate, endDate, period },
    });
    return response.data;
  },

  /**
   * Lấy báo cáo dịch vụ
   * @param startDate ngày bắt đầu (format: yyyy-MM-dd)
   * @param endDate ngày kết thúc (format: yyyy-MM-dd)
   * @param period loại báo cáo: daily, weekly, monthly, quarterly, yearly
   */
  getServiceReport: async (
    startDate: string,
    endDate: string,
    period: string = "monthly"
  ): Promise<ServiceReportData[]> => {
    const response = await api.get<ServiceReportData[]>(`${ENDPOINT}/services`, {
      params: {
        startDate,
        endDate,
        period,
      },
    });
    return response.data;
  },
  getRoomOccupancyReport: async (
    startDate: string,
    endDate: string,
    period: string = "MONTHLY"
  ): Promise<RoomOccupancyData[]> => {
    const response = await api.get<RoomOccupancyData[]>(
      `${ENDPOINT}/room-occupancy`,
      {
        params: {
          startDate,
          endDate,
          period,
        },
      }
    );
    return response.data;
  },
};

//EXPORT DUY NHẤT
export default reportService;

import type { RevenueData, ReportPeriod } from '../types/Report';
import { api } from './apiClient';

const ENDPOINT = '/revenue';

// Map frontend period → backend type
const periodToType: Record<ReportPeriod, string> = {
    daily: 'DAILY',
    weekly: 'WEEKLY',
    monthly: 'MONTHLY',
    quarterly: 'QUARTERLY',
    yearly: 'YEARLY',
};

interface RevenueReportProjection {
    year: number;
    month?: number;
    day?: number;
    week?: number;
    quarter?: number;
    bookingCount: number;
    roomRevenue: number;
    serviceRevenue: number;
    totalRevenue: number;
}

const formatDateLabel = (
    item: RevenueReportProjection,
    type: string,
): string => {
    const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    switch (type) {
        case 'DAILY':
            // Format: "15 Jan 2024"
            return `${item.day} ${monthNames[(item.month ?? 1) - 1]} ${
                item.year
            }`;
        case 'WEEKLY':
            // Format: "Week 15, 2024"
            return `Week ${item.week}, ${item.year}`;
        case 'MONTHLY':
            // Format: "Jan 2024"
            return `${monthNames[(item.month ?? 1) - 1]} ${item.year}`;
        case 'QUARTERLY':
            // Format: "Q1 2024"
            return `Q${item.quarter} ${item.year}`;
        case 'YEARLY':
            // Format: "2024"
            return `${item.year}`;
        default:
            return `${item.year}`;
    }
};

// Chuyển đổi projection array sang RevenueData array
const transformProjectionToRevenueData = (
    projections: RevenueReportProjection[],
    type: string,
): RevenueData[] => {
    return projections.map((item) => ({
        date: formatDateLabel(item, type),
        roomRevenue: item.roomRevenue ?? 0,
        serviceRevenue: item.serviceRevenue ?? 0,
        totalRevenue: item.totalRevenue ?? 0,
        bookingCount: item.bookingCount ?? 0,
    }));
};

// Helper function to transform API response to RevenueData format
const transformRevenueData = (data: any[]): RevenueData[] => {
    return data.map((item) => ({
        // Map fields from backend projection to frontend RevenueData
        // Adjust field names based on your RevenueReportProjection
        label: item.label || item.date || item.period || '',
        totalRevenue: item.totalRevenue ?? item.revenue ?? item.total ?? 0,
        bookingCount: item.bookingCount ?? item.count ?? 0,
        // Add other fields as needed based on your RevenueData type
        ...item,
    }));
};

/**
 * Lấy dữ liệu revenue theo khoảng thời gian và period
 * @param fromDate Ngày bắt đầu (format: yyyy-MM-dd)
 * @param toDate Ngày kết thúc (format: yyyy-MM-dd)
 * @param period Chu kỳ thống kê: daily, weekly, monthly, quarterly, yearly
 */
export const getRevenueByDateRange = async (
    fromDate: string,
    toDate: string,
): Promise<RevenueData[]> => {
    const response = await api.get(`${ENDPOINT}/by-date-range`, {
        params: { fromDate, toDate },
    });
    return transformRevenueData(response.data);
};

/**
 * Lấy dữ liệu revenue mặc định (12 tháng gần nhất)
 */
export const getRevenueData = async (): Promise<RevenueData[]> => {
    try {
        const today = new Date();
        const toDate = today.toISOString().split('T')[0];

        const fromDateObj = new Date(today);
        fromDateObj.setFullYear(fromDateObj.getFullYear() - 1);
        const fromDate = fromDateObj.toISOString().split('T')[0];

        return await getRevenueByDateRange(fromDate, toDate, 'MONTHLY');
    } catch (error) {
        console.error('Error fetching default revenue data:', error);
        throw error;
    }
};

/**
 * Lấy dữ liệu revenue theo ngày trong tháng hiện tại
 */
export const getDailyCurrentMonth = async (): Promise<RevenueData[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/daily-current-month`);

        const projections: RevenueReportProjection[] = Array.isArray(
            response.data,
        )
            ? response.data
            : [];

        return transformProjectionToRevenueData(projections, 'DAILY');
    } catch (error) {
        console.error('Error fetching daily current month revenue:', error);
        throw error;
    }
};

/**
 * Lấy dữ liệu revenue theo tuần trong tháng hiện tại
 */
export const getWeeklyCurrentMonth = async (): Promise<RevenueData[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/weekly-current-month`);

        const projections: RevenueReportProjection[] = Array.isArray(
            response.data,
        )
            ? response.data
            : [];

        return transformProjectionToRevenueData(projections, 'WEEKLY');
    } catch (error) {
        console.error('Error fetching weekly current month revenue:', error);
        throw error;
    }
};

/**
 * Lấy dữ liệu revenue theo tháng trong năm
 */
export const getMonthlyInYear = async (
    year: number,
): Promise<RevenueData[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/monthly`, {
            params: { year },
        });

        const projections: RevenueReportProjection[] = Array.isArray(
            response.data,
        )
            ? response.data
            : [];

        return transformProjectionToRevenueData(projections, 'MONTHLY');
    } catch (error) {
        console.error('Error fetching monthly revenue in year:', error);
        throw error;
    }
};

/**
 * Lấy dữ liệu revenue theo quý trong năm
 */
export const getQuarterlyInYear = async (
    year: number,
): Promise<RevenueData[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/quarterly`, {
            params: { year },
        });

        const projections: RevenueReportProjection[] = Array.isArray(
            response.data,
        )
            ? response.data
            : [];

        return transformProjectionToRevenueData(projections, 'QUARTERLY');
    } catch (error) {
        console.error('Error fetching quarterly revenue in year:', error);
        throw error;
    }
};

/**
 * Lấy dữ liệu revenue theo năm
 */
export const getYearlyRevenue = async (): Promise<RevenueData[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/yearly`);

        const projections: RevenueReportProjection[] = Array.isArray(
            response.data,
        )
            ? response.data
            : [];

        return transformProjectionToRevenueData(projections, 'YEARLY');
    } catch (error) {
        console.error('Error fetching yearly revenue:', error);
        throw error;
    }
};

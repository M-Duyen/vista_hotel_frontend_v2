const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

import type { Holiday } from "../types/Holiday";

/**
* Lấy ngày nghỉ từ API Google Calendar
* @param startDate - Ngày bắt đầu lấy ngày nghỉ
* @param endDate - Ngày kết thúc lấy ngày nghỉ
* @returns Mảng ngày nghỉ
*/
export const fetchHolidays = async (
  startDate: Date,
  endDate: Date
): Promise<Holiday[]> => {
  try {
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?key=${GOOGLE_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id,
      summary: item.summary,
      description: item.description || "",
      start: item.start.date || item.start.dateTime,
      end: item.end.date || item.end.dateTime,
      date: new Date(item.start.date || item.start.dateTime),
    }));
  } catch (error) {
    console.error("Error fetching holidays:", error);
    throw error;
  }
};

/**
* Lấy các ngày nghỉ lễ sắp tới trong N tháng tới
* @param months - Số tháng để xem trước
* @returns Mảng các ngày nghỉ lễ sắp tới
*/
export const getUpcomingHolidays = async (
  months: number = 12
): Promise<Holiday[]> => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + months);

  return await fetchHolidays(now, endDate);
};

/**
* Lấy ngày nghỉ của một năm cụ thể
* @param year - Năm cần lấy ngày nghỉ
* @returns Mảng ngày nghỉ trong năm đó
*/
export const getHolidaysForYear = async (year: number): Promise<Holiday[]> => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  return await fetchHolidays(startDate, endDate);
};

/**
* Kiểm tra xem một ngày cụ thể có phải là ngày lễ hay không
* @param date - Ngày cần kiểm tra
* @returns đối tượng Holiday nếu ngày đó là ngày lễ, nếu không thì trả về null
*/
export const isHoliday = async (date: Date): Promise<Holiday | null> => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const holidays = await fetchHolidays(startDate, endDate);
  return holidays.length > 0 ? holidays[0] : null;
};

/**
* Lấy ngày nghỉ được nhóm theo tháng
* @param year - Năm cần lấy ngày nghỉ
* @returns Đối tượng với tháng là khóa và mảng ngày nghỉ là giá trị
*/
export const getHolidaysByMonth = async (
  year: number
): Promise<Record<string, Holiday[]>> => {
  const holidays = await getHolidaysForYear(year);

  return holidays.reduce((acc, holiday) => {
    const month = holiday.date.toLocaleString("vi-VN", { month: "long" });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(holiday);
    return acc;
  }, {} as Record<string, Holiday[]>);
};

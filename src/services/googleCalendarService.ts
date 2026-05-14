import type { Holiday } from "../types/Holiday";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
const USE_GOOGLE_CALENDAR =
  import.meta.env.VITE_USE_GOOGLE_CALENDAR === "true";
const DEFAULT_CALENDAR_ID = "vi.vietnam#holiday@group.v.calendar.google.com";
const CALENDAR_ID =
  (import.meta.env.VITE_GOOGLE_CALENDAR_ID as string | undefined) ||
  DEFAULT_CALENDAR_ID;

const getRuntimeApiKey = (): string | undefined => {
  const windowKey = (window as any).__VITE_GOOGLE_API_KEY__;
  return (
    GOOGLE_API_KEY ||
    (windowKey ? String(windowKey) : undefined) ||
    localStorage.getItem("VITE_GOOGLE_API_KEY") ||
    undefined
  );
};

const getRuntimeCalendarId = (): string => {
  return (
    localStorage.getItem("VITE_GOOGLE_CALENDAR_ID") ||
    CALENDAR_ID ||
    DEFAULT_CALENDAR_ID
  );
};

const mapGoogleEvent = (item: any): Holiday => {
  const start = item.start?.date || item.start?.dateTime;
  const end = item.end?.date || item.end?.dateTime || start;

  return {
    id: item.id,
    summary: item.summary || "Holiday",
    description: item.description || "",
    start,
    end,
    date: new Date(start),
  };
};

const fixedVietnamHolidays = (startDate: Date, endDate: Date): Holiday[] => {
  const fixedDates = [
    { month: 1, day: 1, summary: "Tet Duong lich" },
    { month: 2, day: 3, summary: "Ngay thanh lap Dang Cong san Viet Nam" },
    { month: 2, day: 14, summary: "Valentine" },
    { month: 2, day: 27, summary: "Ngay Thay thuoc Viet Nam" },
    { month: 3, day: 8, summary: "Ngay Quoc te Phu nu" },
    { month: 3, day: 26, summary: "Ngay thanh lap Doan TNCS Ho Chi Minh" },
    { month: 4, day: 30, summary: "Ngay Giai phong mien Nam" },
    { month: 5, day: 1, summary: "Ngay Quoc te Lao dong" },
    { month: 5, day: 7, summary: "Ngay chien thang Dien Bien Phu" },
    { month: 5, day: 19, summary: "Ngay sinh Chu tich Ho Chi Minh" },
    { month: 6, day: 1, summary: "Ngay Quoc te Thieu nhi" },
    { month: 6, day: 28, summary: "Ngay Gia dinh Viet Nam" },
    { month: 7, day: 27, summary: "Ngay Thuong binh Liet si" },
    { month: 8, day: 19, summary: "Ngay Cach mang thang Tam" },
    { month: 9, day: 2, summary: "Quoc khanh Viet Nam" },
    { month: 10, day: 10, summary: "Ngay Giai phong Thu do" },
    { month: 10, day: 13, summary: "Ngay Doanh nhan Viet Nam" },
    { month: 10, day: 20, summary: "Ngay Phu nu Viet Nam" },
    { month: 11, day: 20, summary: "Ngay Nha giao Viet Nam" },
    { month: 12, day: 22, summary: "Ngay thanh lap Quan doi Nhan dan Viet Nam" },
    { month: 12, day: 24, summary: "Dem Giang sinh" },
    { month: 12, day: 25, summary: "Giang sinh" },
  ];

  const lunarDates: Record<number, Array<{ month: number; day: number; summary: string }>> = {
    2025: [
      { month: 1, day: 28, summary: "Tet Nguyen dan - Giao thua" },
      { month: 1, day: 29, summary: "Tet Nguyen dan - Mung 1" },
      { month: 1, day: 30, summary: "Tet Nguyen dan - Mung 2" },
      { month: 1, day: 31, summary: "Tet Nguyen dan - Mung 3" },
      { month: 2, day: 12, summary: "Tet Nguyen tieu" },
      { month: 4, day: 7, summary: "Gio To Hung Vuong" },
      { month: 5, day: 5, summary: "Le Phat Dan" },
      { month: 5, day: 31, summary: "Tet Doan Ngo" },
      { month: 9, day: 6, summary: "Le Vu Lan" },
      { month: 10, day: 6, summary: "Tet Trung thu" },
    ],
    2026: [
      { month: 2, day: 16, summary: "Tet Nguyen dan - Giao thua" },
      { month: 2, day: 17, summary: "Tet Nguyen dan - Mung 1" },
      { month: 2, day: 18, summary: "Tet Nguyen dan - Mung 2" },
      { month: 2, day: 19, summary: "Tet Nguyen dan - Mung 3" },
      { month: 3, day: 3, summary: "Tet Nguyen tieu" },
      { month: 4, day: 26, summary: "Gio To Hung Vuong" },
      { month: 5, day: 24, summary: "Le Phat Dan" },
      { month: 6, day: 19, summary: "Tet Doan Ngo" },
      { month: 8, day: 27, summary: "Le Vu Lan" },
      { month: 9, day: 25, summary: "Tet Trung thu" },
    ],
    2027: [
      { month: 2, day: 5, summary: "Tet Nguyen dan - Giao thua" },
      { month: 2, day: 6, summary: "Tet Nguyen dan - Mung 1" },
      { month: 2, day: 7, summary: "Tet Nguyen dan - Mung 2" },
      { month: 2, day: 8, summary: "Tet Nguyen dan - Mung 3" },
      { month: 2, day: 20, summary: "Tet Nguyen tieu" },
      { month: 4, day: 15, summary: "Gio To Hung Vuong" },
      { month: 5, day: 13, summary: "Le Phat Dan" },
      { month: 6, day: 9, summary: "Tet Doan Ngo" },
      { month: 8, day: 16, summary: "Le Vu Lan" },
      { month: 9, day: 15, summary: "Tet Trung thu" },
    ],
  };

  const holidays: Holiday[] = [];

  const addHoliday = (
    year: number,
    month: number,
    day: number,
    summary: string,
    prefix: string,
  ) => {
    const date = new Date(year, month - 1, day);
    if (date < startDate || date > endDate) {
      return;
    }

    const isoDate = date.toISOString().split("T")[0];
    holidays.push({
      id: `${prefix}-${year}-${month}-${day}`,
      summary,
      description: "Fallback holiday generated locally",
      start: isoDate,
      end: isoDate,
      date,
    });
  };

  for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
    for (const holiday of fixedDates) {
      addHoliday(year, holiday.month, holiday.day, holiday.summary, "vn-fixed");
    }

    for (const holiday of lunarDates[year] || []) {
      addHoliday(year, holiday.month, holiday.day, holiday.summary, "vn-lunar");
    }
  }

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const fetchHolidays = async (
  startDate: Date,
  endDate: Date,
): Promise<Holiday[]> => {
  if (!USE_GOOGLE_CALENDAR) {
    return fixedVietnamHolidays(startDate, endDate);
  }

  const apiKey = getRuntimeApiKey();
  const calendarId = getRuntimeCalendarId();

  if (!apiKey) {
    console.warn(
      "Google Calendar API key is missing. Using local Vietnam holiday fallback.",
    );
    return fixedVietnamHolidays(startDate, endDate);
  }

  const params = new URLSearchParams({
    key: apiKey,
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "2500",
  });

  const urls = [
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId,
    )}/events?${params.toString()}`,
  ];

  if (calendarId !== DEFAULT_CALENDAR_ID) {
    urls.push(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        DEFAULT_CALENDAR_ID,
      )}/events?${params.toString()}`,
    );
  }

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(
          `Google Calendar API error: ${response.status} ${response.statusText}`,
          errorText,
        );
        continue;
      }

      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : [];
      return items.map(mapGoogleEvent);
    } catch (error) {
      console.warn("Error fetching holidays from Google Calendar:", error);
    }
  }

  console.warn("Using local Vietnam holiday fallback after Google Calendar failed.");
  return fixedVietnamHolidays(startDate, endDate);
};

export const getUpcomingHolidays = async (
  months: number = 12,
): Promise<Holiday[]> => {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + months);

  return fetchHolidays(now, endDate);
};

export const getHolidaysForYear = async (year: number): Promise<Holiday[]> => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  return fetchHolidays(startDate, endDate);
};

export const isHoliday = async (date: Date): Promise<Holiday | null> => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const holidays = await fetchHolidays(startDate, endDate);
  return holidays.length > 0 ? holidays[0] : null;
};

export const getHolidaysByMonth = async (
  year: number,
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

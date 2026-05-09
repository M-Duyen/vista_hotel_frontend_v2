/*eslint-disable */
type HolidayEvent = {
    id: string;
    title: string;
    start: string; // ISO
    end?: string; // ISO
    description?: string;
    location?: string;
};

export class HolidayService {
    private apiKey: string | undefined;
    private defaultCalendarId: string | undefined;
    private baseUrl = 'https://www.googleapis.com/calendar/v3/calendars';

    constructor(apiKey?: string, defaultCalendarId?: string) {
        // Vite env vars
        this.apiKey =
            apiKey ??
            (import.meta.env.VITE_GOOGLE_API_KEY as string | undefined);
        this.defaultCalendarId =
            defaultCalendarId ??
            (import.meta.env.VITE_GOOGLE_CALENDAR_ID as string | undefined);
    }

    // Allow setting api key at runtime (useful for development/testing)
    setApiKey(key: string) {
        this.apiKey = key;
    }

    // Optional helper to inspect vite env keys in console (dev only)
    debugEnv() {
        console.info('import.meta.env snapshot:', {
            VITE_GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,
            VITE_GOOGLE_CALENDAR_ID: import.meta.env.VITE_GOOGLE_CALENDAR_ID,
        });
    }

    // year: numeric year; optional calendarId to override default
    async getHolidaysForYear(
        year: number,
        calendarId?: string,
    ): Promise<HolidayEvent[]> {
        // attempt runtime fallbacks before failing
        let key = this.apiKey;
        if (!key) {
            // try window injection (e.g. for debugging) or localStorage fallback
            // (window as any).__VITE_GOOGLE_API_KEY__ can be set from console
            const winKey = (window as any).__VITE_GOOGLE_API_KEY__;
            const lsKey = localStorage.getItem('VITE_GOOGLE_API_KEY');
            if (winKey) {
                key = String(winKey);
                this.apiKey = key;

                console.warn(
                    'HolidayService: using API key from window.__VITE_GOOGLE_API_KEY__',
                );
            } else if (lsKey) {
                key = lsKey;
                this.apiKey = key;

                console.warn(
                    'HolidayService: using API key from localStorage.VITE_GOOGLE_API_KEY',
                );
            }
        }
        const calId = calendarId ?? this.defaultCalendarId;
        if (!key) {
            // provide actionable guidance
            const msg =
                'Google API key not set (VITE_GOOGLE_API_KEY). ' +
                'Ensure you added VITE_GOOGLE_API_KEY=your_key in frontend .env and restarted the dev server. ' +
                'For quick dev override you can run in browser console: localStorage.setItem("VITE_GOOGLE_API_KEY", "your_key"); window.location.reload();';
            throw new Error(msg);
        }
        if (!calId)
            throw new Error(
                'Google Calendar ID not set (VITE_GOOGLE_CALENDAR_ID)',
            );

        const timeMin = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
        const timeMax = new Date(
            Date.UTC(year, 11, 31, 23, 59, 59),
        ).toISOString();

        const params = new URLSearchParams({
            key,
            timeMin,
            timeMax,
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: '2500',
        });

        const url = `${this.baseUrl}/${encodeURIComponent(
            calId,
        )}/events?${params.toString()}`;

        const res = await fetch(url, { method: 'GET' });

        // Improved 404 handling with actionable guidance
        if (!res.ok) {
            const text = await res.text().catch(() => '');

            if (res.status === 404) {
                const encodedId = encodeURIComponent(calId);
                const diagnostic = [
                    'Google Calendar API returned 404 Not Found.',
                    'Possible causes:',
                    '- calendarId is incorrect or uses the wrong value.',
                    '- the calendar is not public (private calendars return 404 when accessed with an API key).',
                    '- the API key does not have Calendar API enabled or is restricted.',
                    'Checks / quick fixes:',
                    `1) Verify calendar id value (raw): ${calId}`,
                    `2) Verify encoded calendar id (used in request): ${encodedId}`,
                    `3) Paste this URL in your browser (should return JSON or a readable error):`,
                    `   ${url}`,
                    '4) Ensure the calendar is public: open it in Google Calendar > Settings > Access permissions > Make available to public.',
                    '5) In Google Cloud Console enable "Google Calendar API" for your API key and remove restrictive referrer/IP rules for testing.',
                    '6) Example public holiday calendar ids you can try for testing:',
                    '   - vi.vietnam#holiday@group.v.calendar.google.com',
                    '   - en.uk#holiday@group.v.calendar.google.com',
                    '   - en.usa#holiday@group.v.calendar.google.com',
                ].join('\n');

                throw new Error(diagnostic);
            }

            throw new Error(
                `Google Calendar API error: ${res.status} ${res.statusText} ${text}`,
            );
        }

        const data = await res.json().catch(() => ({}));
        const items = Array.isArray(data.items) ? data.items : [];

        const mapped: HolidayEvent[] = items.map((it: any) => {
            const start = it.start?.dateTime ?? it.start?.date ?? null;
            const end = it.end?.dateTime ?? it.end?.date ?? null;
            return {
                id: it.id,
                title: it.summary ?? it.description ?? 'Untitled',
                start,
                end,
                description: it.description,
                location: it.location,
            };
        });

        return mapped;
    }
}

// default singleton instance
const holidayService = new HolidayService();
export default holidayService;

import React from 'react';

interface CheckinTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    counts?: {
        today: number;
        tomorrow: number;
        early: number;
        hourly: number;
    };
    selectedDate?: Date;
}

const CheckinTabs: React.FC<CheckinTabsProps> = ({
    activeTab,
    onTabChange,
    counts,
    selectedDate,
}) => {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isTomorrow = (date: Date) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return (
            date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear()
        );
    };

    const currentDate = selectedDate || new Date();
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Only show hourly tab on today's date
    const showHourlyTab = isToday(currentDate);

    const tabs = [
        {
            id: 'today',
            label: isToday(currentDate)
                ? "Today's Check-ins"
                : formatDate(currentDate),
            count: counts?.today,
        },
        {
            id: 'tomorrow',
            label: isTomorrow(nextDate)
                ? "Tomorrow's Check-ins"
                : formatDate(nextDate),
            count: counts?.tomorrow,
        },
        { id: 'early', label: 'Early Check-in Requests', count: counts?.early },
        ...(showHourlyTab
            ? [
                  {
                      id: 'hourly',
                      label: 'Hourly Bookings',
                      count: counts?.hourly,
                  },
              ]
            : []),
    ];

    return (
        <div className="flex flex-wrap border-b border-[#EBE3D7]">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`py-3 px-4 font-medium text-sm transition-colors focus:outline-none flex items-center gap-2
            ${
                activeTab === tab.id
                    ? 'text-[#CCBDA3] border-b-2 border-[#CCBDA3]'
                    : 'text-gray-600 hover:text-gray-900'
            }`}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                activeTab === tab.id
                                    ? 'bg-[#CCBDA3] text-white'
                                    : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default CheckinTabs;

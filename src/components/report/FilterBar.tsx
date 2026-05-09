import React from 'react';
import type { ReportPeriod } from '../../types/Report';

interface FilterBarProps {
    period: ReportPeriod;
    onPeriodChange: (period: ReportPeriod) => void;
    showDateFilter?: boolean;
    onToggleDateFilter?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    period,
    onPeriodChange,
    showDateFilter = false,
    onToggleDateFilter,
}) => {
    const periods: { value: ReportPeriod; label: string }[] = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'yearly', label: 'Yearly' },
    ];

    return (
        <div className="flex gap-2">
            {periods.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onPeriodChange(p.value)}
                    className={`px-4 py-2 rounded-md font-medium transition ${
                        period === p.value
                            ? 'bg-[#c7a160] text-white'
                            : 'bg-white text-gray-700 border border-[#EBE3D7] hover:bg-[#F5F0EB]'
                    }`}
                >
                    {p.label}
                </button>
            ))}
            {onToggleDateFilter && (
                <button
                    onClick={onToggleDateFilter}
                    className={`px-4 py-2 rounded-md font-medium transition flex items-center gap-2 ${
                        showDateFilter
                            ? 'bg-[#B8935F] text-white hover:bg-[#9A7A4D]'
                            : 'bg-white text-gray-700 border border-[#EBE3D7] hover:bg-[#F5F0EB]'
                    }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    {showDateFilter ? 'Hide Date' : 'Date Filter'}
                </button>
            )}
        </div>
    );
};

export default FilterBar;

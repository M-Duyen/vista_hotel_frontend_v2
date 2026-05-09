import React from 'react';
import { FaAngleRight } from 'react-icons/fa';

export interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    completedTabs?: string[];
}

/**
 * Reusable Tab Navigation Component
 * Tab flow: completed (dark) -> active (beige) -> inactive (white)
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
    tabs,
    activeTab,
    onTabChange,
    completedTabs = [],
}) => {
    return (
        <div className="flex items-center justify-center bg-white px-6 py-4 border-b border-gray-200">
            {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                const isCompleted = completedTabs.includes(tab.id);

                return (
                    <React.Fragment key={tab.id}>
                        {/* Tab Button */}
                        <button
                            onClick={() => onTabChange(tab.id)}
                            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer min-w-[125px] whitespace-nowrap ${
                                isCompleted
                                    ? 'bg-[#4a4a4a] text-white'
                                    : isActive
                                    ? 'bg-[#c9b896] text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>

                        {/* AngleRight Icon between tabs */}
                        {index < tabs.length - 1 && (
                            <div className="flex items-center justify-center mx-3">
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                        isCompleted
                                            ? 'bg-[#4a4a4a] text-white'
                                            : 'bg-white border border-gray-300 text-gray-400'
                                    }`}
                                >
                                    <FaAngleRight className="w-3 h-3" />
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default TabNavigation;

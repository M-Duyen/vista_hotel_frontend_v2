export default function CheckoutTabs({
    activeTab,
    setActiveTab,
}: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}) {
    const tabs = [
        { id: 'today', label: "Today's Check-outs" },
        { id: 'tomorrow', label: "Tomorrow's Check-outs" },
        { id: 'late', label: 'Late Check-out Requests' },
        { id: 'completed', label: 'Recently Completed' },
    ];

    return (
        <div className="border-b border-cream mb-6">
            <div className="flex flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                                ? 'border-b-2 border-gold text-black'
                                : 'text-gray-500 hover:text-black'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

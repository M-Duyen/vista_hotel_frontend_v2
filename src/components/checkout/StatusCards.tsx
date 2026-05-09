import {
    FaCalendarCheck,
    FaCheckCircle,
    FaClock,
    FaCalendarDay,
} from 'react-icons/fa';
import type { Booking } from '../../types/Booking';

interface StatusCardsProps {
    bookings: Booking[];
    currentDate: Date;
}

export default function StatusCards({
    bookings,
    currentDate,
}: StatusCardsProps) {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Today's checkouts (selected date)
    const todayCheckouts = bookings.filter((b) => {
        const checkOutDate = new Date(b.checkOutDate);
        checkOutDate.setHours(0, 0, 0, 0);
        return checkOutDate.getTime() === today.getTime();
    }).length;

    // Completed checkouts (all checked out)
    const completedCheckouts = bookings.filter(
        (b) => b.status === 'CHECKED_OUT',
    ).length;

    // Pending checkouts (checked in, should checkout today or tomorrow)
    const pendingCheckouts = bookings.filter((b) => {
        if (b.status !== 'CHECKED_IN') return false;
        const checkOutDate = new Date(b.checkOutDate);
        checkOutDate.setHours(0, 0, 0, 0);
        return (
            checkOutDate.getTime() === today.getTime() ||
            checkOutDate.getTime() === tomorrow.getTime()
        );
    }).length;

    // Late checkout requests (checked in but past checkout date)
    const lateCheckoutRequests = bookings.filter((b) => {
        if (b.status !== 'CHECKED_IN') return false;
        const checkOutDate = new Date(b.checkOutDate);
        checkOutDate.setHours(0, 0, 0, 0);
        return checkOutDate < today;
    }).length;

    const statusItems = [
        {
            icon: <FaCalendarCheck />,
            color: '#EC407A',
            bgColor: 'rgba(236, 64, 122, 0.1)',
            count: todayCheckouts.toString(),
            label: "Today's Check-outs",
        },
        {
            icon: <FaCheckCircle />,
            color: '#2196F3',
            bgColor: 'rgba(33, 150, 243, 0.1)',
            count: completedCheckouts.toString(),
            label: 'Completed Check-outs',
        },
        {
            icon: <FaClock />,
            color: '#FF9800',
            bgColor: 'rgba(255, 152, 0, 0.1)',
            count: pendingCheckouts.toString(),
            label: 'Pending Check-outs',
        },
        {
            icon: <FaCalendarDay />,
            color: '#CCBDA3',
            bgColor: 'rgba(204, 189, 163, 0.1)',
            count: lateCheckoutRequests.toString(),
            label: 'Late Check-out Requests',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {statusItems.map((item, index) => (
                <div
                    key={index}
                    className="bg-white p-5 rounded-md flex items-center gap-4 shadow-sm hover:translate-y-[-3px] transition-all"
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: item.bgColor }}
                    >
                        <span style={{ color: item.color, fontSize: '1.5rem' }}>
                            {item.icon}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold mb-1">
                            {item.count}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

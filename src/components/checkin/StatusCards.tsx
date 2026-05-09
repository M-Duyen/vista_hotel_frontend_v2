import React, { useMemo } from "react";
import { FaCalendarCheck, FaKey, FaClock, FaCalendarDay } from "react-icons/fa";
import type { Booking } from "../../types/Booking";

interface StatusCardsProps {
  bookings: Booking[];
}

const StatusCards: React.FC<StatusCardsProps> = ({ bookings = [] }) => {
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (dateString: string) => {
      const checkInDate = new Date(dateString);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    };

    // totalToday: checkInDate là hôm nay và status là CHECKED_IN
    const totalToday = bookings.filter((booking) =>
      isToday(booking.checkInDate)
    ).length;

    // completedCheckins: status = CHECKED_OUT và checkInDate là hôm nay
    const completedCheckins = bookings.filter(
      (booking) =>
        isToday(booking.checkInDate) && booking.status === "CHECKED_IN"
    ).length;

    // pendingCheckins: status = CONFIRMED và checkInDate là hôm nay
    const pendingCheckins = bookings.filter(
      (booking) => isToday(booking.checkInDate) && booking.status === "PENDING"
    ).length;

    // earlyRequests: status = CHECKED_IN, checkInDate là hôm nay,
    // earlyCheckin khác null và approvalStatus = APPROVED
    const earlyRequests = bookings.filter(
      (booking) =>
        isToday(booking.checkInDate) &&
        booking.status === "CHECKED_IN" &&
        booking.earlyCheckin !== null &&
        booking.earlyCheckin?.approvalStatus === "APPROVED"
    ).length;

    return {
      totalToday,
      completedCheckins,
      pendingCheckins,
      earlyRequests,
    };
  }, [bookings]);

  const cards = [
    {
      icon: <FaCalendarCheck />,
      iconColor: "#00C853",
      bgColor: "rgba(0, 200, 83, 0.1)",
      count: stats.totalToday,
      title: "Today's Check-ins",
    },
    {
      icon: <FaKey />,
      iconColor: "#2196F3",
      bgColor: "rgba(33, 150, 243, 0.1)",
      count: stats.completedCheckins,
      title: "Completed Check-ins",
    },
    {
      icon: <FaClock />,
      iconColor: "#FF9800",
      bgColor: "rgba(255, 152, 0, 0.1)",
      count: stats.pendingCheckins,
      title: "Pending Check-ins",
    },
    {
      icon: <FaCalendarDay />,
      iconColor: "#CCBDA3",
      bgColor: "rgba(204, 189, 163, 0.1)",
      count: stats.earlyRequests,
      title: "Early Check-in Requests",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-lg shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: card.bgColor }}
          >
            <span style={{ color: card.iconColor }}>{card.icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-1">{card.count}</h3>
            <p className="text-gray-600 text-sm">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;

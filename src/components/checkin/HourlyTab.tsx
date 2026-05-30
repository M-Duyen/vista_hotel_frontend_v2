/* eslint-disable */
import { FaCheck, FaEye, FaClock } from "react-icons/fa";
import type { Booking } from "../../types/Booking";

const formatTime = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const isHourlyBooking = (booking: Booking) =>
  booking?.type === "HOURLY" || booking?.packageType === "HOURLY";

const formatCurrency = (amount?: number | null) =>
  `${Number(amount || 0).toLocaleString("vi-VN")} VND`;

type HourlyTabProps = {
  onViewDetails: (booking: Booking) => void;
  bookings?: Booking[];
};

const HourlyTab = ({ onViewDetails, bookings = [] }: HourlyTabProps) => {
  const hourlyBookings = bookings.filter((booking: Booking) =>
    isHourlyBooking(booking),
  );

  if (hourlyBookings.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">No hourly bookings found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-[#EBE3D7]/30 text-left">
            <th className="py-4 px-4 font-semibold">Booking ID</th>
            <th className="py-4 px-4 font-semibold">Guest Name</th>
            <th className="py-4 px-4 font-semibold">Room</th>
            <th className="py-4 px-4 font-semibold">Duration</th>
            <th className="py-4 px-4 font-semibold">Check-in Time</th>
            <th className="py-4 px-4 font-semibold">Check-out Time</th>
            <th className="py-4 px-4 font-semibold">Rate</th>
            <th className="py-4 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hourlyBookings.map((booking: Booking) => {
            const room = `${booking.bookingDetails?.[0]?.room?.roomNumber || "N/A"} - ${
              booking.bookingDetails?.[0]?.room?.roomType?.typeName || "Standard"
            }`;

            return (
              <tr
                key={booking.bookingID}
                className="border-b border-[#EBE3D7]/50 hover:bg-[#EBE3D7]/10"
              >
                <td className="py-4 px-4">{booking.bookingID}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        booking.customer?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${booking.customer?.fullName || "Guest"}`
                      }
                      alt={booking.customer?.fullName || "Guest"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {booking.customer?.fullName || "Guest"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {booking.customer?.email || "No email"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">{room}</td>
                <td className="py-4 px-4">{booking.duration || 0} hours</td>
                <td className="py-4 px-4">{formatTime(booking.checkInDate)}</td>
                <td className="py-4 px-4">{formatTime(booking.checkOutDate)}</td>
                <td className="py-4 px-4">{formatCurrency(booking.totalAmount)}</td>
                <td className="py-4 px-4">
                  <div className="flex gap-1">
                    {booking.status === "PENDING" && (
                      <button
                        title="Check In"
                        className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center text-green-600"
                        onClick={() => onViewDetails(booking)}
                      >
                        <FaCheck size={14} />
                      </button>
                    )}
                    {booking.status === "CHECKED_IN" && (
                      <button
                        title="Checked In"
                        className="w-8 h-8 rounded-full bg-[#F5F0EB] text-blue-600 flex items-center justify-center"
                      >
                        <FaClock size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => onViewDetails(booking)}
                      title="View Details"
                      className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center"
                    >
                      <FaEye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HourlyTab;

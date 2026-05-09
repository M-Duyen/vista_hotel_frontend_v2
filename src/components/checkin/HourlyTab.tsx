/* eslint-disable */
import React from "react";
import { FaCheck, FaEye, FaClock } from "react-icons/fa";
import type { Booking } from "../../types/Booking";

const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const calculateDuration = (startDate: String, endDate: String) => {
  if (!startDate || !endDate) return "N/A";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffHrs = Math.round(diffMs / (1000 * 60 * 60));

  return diffHrs + " hours";
};

const isHourlyBooking = (booking: Booking) => {
  if (!booking) return false;
  return booking.type === "HOURLY" && booking.duration < 24;
};

const HourlyTab = ({ onViewDetails, bookings = [] }) => {
  const hourlyBookings = bookings
    .filter((booking: Booking) => isHourlyBooking(booking))
    .map((booking: Booking) => ({
      id: booking.bookingID,
      guest: {
        name: booking.customer?.fullName || "Guest",
        email: booking.customer?.email || "No email",
        image: "https://randomuser.me/api/portraits/men/52.jpg",
      },
      room: `${booking.bookingDetails?.[0]?.room?.roomNumber || "N/A"} - ${
        booking.bookingDetails?.[0]?.room?.roomType?.typeName || "Standard"
      }`,
      type: booking.type,
      duration: booking.duration + " hours",
      checkInTime: formatTime(booking.checkInDate),
      checkOutTime: formatTime(booking.checkOutDate),
      rate: `$${booking.hourlyRate || "45"} (${
        booking.duration * 15 || "45"
      }%)`,
    }));

  const displayBookings = hourlyBookings.length > 0 ? hourlyBookings : [];

  if (hourlyBookings.length === 0 && bookings.length > 0) {
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
          {displayBookings.map((booking, index) => (
            <tr
              key={booking.id}
              className="border-b border-[#EBE3D7]/50 hover:bg-[#EBE3D7]/10"
            >
              <td className="py-4 px-4">{booking.id}</td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <img
                    src={booking.guest.image}
                    alt={booking.guest.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{booking.guest.name}</span>
                    <span className="text-sm text-gray-500">
                      {booking.guest.email}
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">{booking.room}</td>
              <td className="py-4 px-4">{booking.duration}</td>
              <td className="py-4 px-4">{booking.checkInTime}</td>
              <td className="py-4 px-4">{booking.checkOutTime}</td>
              <td className="py-4 px-4">{booking.rate}</td>
              <td className="py-4 px-4">
                <div className="flex gap-1">
                  {index === 0 && (
                    <button
                      title="Check In"
                      className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center text-green-600"
                    >
                      <FaCheck size={14} />
                    </button>
                  )}
                  {index === 1 && (
                    <button
                      title="Check Out"
                      className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center text-blue-600"
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HourlyTab;

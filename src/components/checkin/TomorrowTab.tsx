/* eslint-disable */
import { FaEye, FaComment } from "react-icons/fa";
import type { Booking } from "../../types/Booking";

const formatCheckInTime = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getTrustScore = (loyaltyPoints: any) => {
  if (!loyaltyPoints) return { value: 50, level: "medium" };
  if (loyaltyPoints >= 10000) return { value: 85, level: "high" };
  if (loyaltyPoints >= 5000) return { value: 65, level: "medium" };
  return { value: 40, level: "low" };
};

const getPaymentStatus = (status: any) => {
  switch (status) {
    case "PAID":
    case "COMPLETED":
      return { type: "complete", label: "Paid in Full" };
    case "PERCENTAGE_50":
      return { type: "partial", label: "Partial (50%)" };
    case "PERCENTAGE_30":
    case "PARTIAL":
      return { type: "partial", label: "Partial (30%)" };
    case "PENDING":
      return { type: "checkout", label: "Pay at Checkout" };
    default:
      return { type: "checkout", label: "Not Paid" };
  }
};

type TomorrowTabProps = {
  onViewDetails?: (booking: Booking) => void;
  bookings?: Booking[];
};

const TomorrowTab = ({
  onViewDetails = () => {},
  bookings = [],
}: TomorrowTabProps) => {
  if (bookings.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">No check-ins scheduled for this date.</p>
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
            <th className="py-4 px-4 font-semibold">Check-in Time</th>
            <th className="py-4 px-4 font-semibold">Status</th>
            <th className="py-4 px-4 font-semibold">Trust Score</th>
            <th className="py-4 px-4 font-semibold">Payment Status</th>
            <th className="py-4 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const trustScore = getTrustScore(booking.customer?.loyaltyPoints);
            const paymentStatus = getPaymentStatus(booking.paymentStatus);
            const room = `${booking.bookingDetails?.[0]?.room?.roomNumber || "N/A"} - ${
              booking.bookingDetails?.[0]?.room?.roomType?.typeName || "Standard"
            }`;
            const tone =
              trustScore.level === "high"
                ? "bg-green-100"
                : trustScore.level === "medium"
                  ? "bg-yellow-100"
                  : "bg-red-100";
            const paymentTone =
              paymentStatus.type === "complete"
                ? "bg-green-100 text-green-600"
                : paymentStatus.type === "partial"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-purple-100 text-purple-600";

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
                <td className="py-4 px-4">{formatCheckInTime(booking.checkInDate)}</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                    Upcoming
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${tone}`}
                  >
                    <span className="text-sm font-semibold">{trustScore.value}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${paymentTone}`}
                  >
                    {paymentStatus.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onViewDetails(booking)}
                      className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center"
                      title="View Details"
                    >
                      <FaEye size={14} />
                    </button>
                    <button
                      className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center"
                      title="Send Message"
                    >
                      <FaComment size={14} />
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

export default TomorrowTab;

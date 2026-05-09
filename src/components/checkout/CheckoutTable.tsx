/* eslint-disable */
import { FaCheck, FaEye, FaReceipt } from "react-icons/fa";
import type { Booking } from "../../types/Booking";

export default function CheckoutTable({
  data,
  onProcessCheckout,
  onViewDetails,
}: {
  data: Booking[];
  onProcessCheckout: (booking: Booking) => void;
  onViewDetails: (booking: Booking) => void;
}) {
  const renderTrustScore = (score: number, level: string) => {
    const bgColors = {
      high: "bg-green-50 text-success",
      medium: "bg-amber-50 text-amber-600",
      low: "bg-red-50 text-danger",
    };
    const color = bgColors[level as keyof typeof bgColors] || bgColors.medium;

    return (
      <div className={`rounded-md py-1 px-2 text-center ${color}`}>
        <span className="block font-semibold">{score}</span>
        <div className="text-xs">{level[0].toUpperCase() + level.slice(1)}</div>
      </div>
    );
  };

  const statusColors = {
    PENDING: "bg-gray-50 text-gray-600",
    CONFIRMED: "bg-blue-50 text-blue-600",
    CHECKED_IN: "bg-amber-50 text-amber-600",
    CHECKED_OUT: "bg-green-50 text-success",
    CANCELLED: "bg-red-50 text-danger",
  };

  const calculateBalanceDue = (booking: Booking): number => {
    const totalAmount = booking.totalAmount;

    switch (booking.paymentStatus) {
      case "PAID":
        return 0;

      case "PERCENTAGE_30":
        return totalAmount * 0.7;

      case "PERCENTAGE_50":
        return totalAmount * 0.5;

      case "PARTIAL":
        return totalAmount * 0.5;

      case "PENDING":
        return totalAmount;

      case "COMPLETED":
        return 0;

      case "REFUNDED":
        return 0;

      case "CANCELLED":
        return 0;

      case "FAILED":
        return totalAmount;
      default:
        return totalAmount;
    }
  };

  const getRoomInfo = (booking: Booking): string => {
    return (booking.bookingDetails ?? [])
      .map(
        (detail) =>
          `${detail.room.roomNumber} - ${
            detail.room.roomType?.roomTypeName || ""
          }`
      )
      .join(", ");
  };

  const getTrustScore = (score: number) => {
    return {
      score,
      level:
        score >= 80
          ? "high"
          : score >= 60
          ? "medium"
          : ("low" as "high" | "medium" | "low"),
    };
  };

  const isLateCheckout = (booking: Booking): boolean => {
    const checkoutDate = new Date(booking.checkOutDate);
    const now = new Date();
    // Reset time to compare only dates
    checkoutDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return booking.status === "CHECKED_IN" && checkoutDate < now;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-md p-8 text-center text-gray-500">
        <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
        <p>No checkouts found for this period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-cream">
            <tr>
              <th className="text-left py-4 px-4 font-semibold">Booking ID</th>
              <th className="text-left py-4 px-4 font-semibold">Guest Name</th>
              <th className="text-left py-4 px-4 font-semibold">Room</th>
              <th className="text-left py-4 px-4 font-semibold">
                Check-out Time
              </th>
              <th className="text-left py-4 px-4 font-semibold">Status</th>
              <th className="text-left py-4 px-4 font-semibold">Trust Score</th>
              <th className="text-left py-4 px-4 font-semibold">Balance Due</th>
              <th className="text-left py-4 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((booking) => {
              const trustScore = getTrustScore(
                booking.customer.reputationPoint
              );
              const balanceDue = calculateBalanceDue(booking);
              const roomInfo = getRoomInfo(booking);
              const isLate = isLateCheckout(booking);
              const checkoutTime = new Date(
                booking.checkOutDate
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <tr
                  key={booking.bookingID}
                  className="hover:bg-light/50 border-b border-light transition"
                >
                  <td className="py-4 px-4 font-medium">{booking.bookingID}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          booking.customer?.avatartUrl ||
                          "https://ui-avatars.com/api/?name=" +
                            (booking.customer?.fullName || "Guest")
                        }
                        alt={booking.customer?.fullName || "N/A"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <span className="block font-medium">
                          {booking.customer?.fullName || "N/A"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {booking.customer?.email || "N/A"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">{roomInfo}</td>
                  <td className="py-4 px-4">
                    <div>
                      {checkoutTime}
                      {isLate && (
                        <div className="flex items-center gap-1 text-xs text-danger mt-1">
                          <i className="fas fa-exclamation-circle"></i>
                          <span>Late</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[
                          booking.status as keyof typeof statusColors
                        ]
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {renderTrustScore(trustScore.score, trustScore.level)}
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-semibold">
                        {balanceDue.toLocaleString("vi-VN")} VND
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: {booking.totalAmount.toLocaleString("vi-VN")} VND
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {booking.status === "CHECKED_IN" && (
                        <button
                          title="Process Check-out"
                          onClick={() => onProcessCheckout(booking)}
                          className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition flex items-center justify-center"
                        >
                          <FaCheck size={14} />
                        </button>
                      )}

                      <button
                        title="View Details"
                        className="w-8 h-8 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7] transition flex items-center justify-center"
                        onClick={() => onViewDetails(booking)}
                      >
                        <FaEye size={14} />
                      </button>

                      {booking.status === "CHECKED_OUT" && (
                        <button
                          title="Print Receipt"
                          className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition flex items-center justify-center"
                          onClick={() => {
                            console.log(
                              "Print receipt for:",
                              booking.bookingID
                            );
                          }}
                        >
                          <FaReceipt size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

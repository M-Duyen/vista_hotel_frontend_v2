import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaHistory,
  FaCalendarAlt,
  FaDoorOpen,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
} from "react-icons/fa";
import type { Booking } from "../../types/Booking";
import BookingDetailDialog from "./BookingDetailDialog";

interface BookingHistorySectionProps {
  bookings: Booking[];
  loading: boolean;
}

const BookingHistorySection: React.FC<BookingHistorySectionProps> = ({
  bookings,
  loading,
}) => {
  const [filter, setFilter] = useState<
    "all" | "PENDING" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"
  >("all");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleViewDetails = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedBookingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CHECKED_IN":
        return "bg-blue-100 text-blue-800";
      case "CHECKED_OUT":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "CHECKED_IN":
        return "Checked In";
      case "CHECKED_OUT":
        return "Checked Out";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <FaClock />;
      case "CHECKED_IN":
        return <FaDoorOpen />;
      case "CHECKED_OUT":
        return <FaCheckCircle />;
      case "CANCELLED":
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Paid";
      case "PENDING":
        return "Pending Payment";
      case "REFUNDED":
        return "Refunded";
      case "PARTIAL":
        return "Partially Paid";
      default:
        return status;
    }
  };

  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const sortedBookings = [...filteredBookings].sort(
    (a, b) =>
      new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-cream p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <FaHistory className="text-[#ccbda3] text-2xl" />
        <h2 className="text-2xl font-bold text-[#ccbda3]">Booking History</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "all"
              ? "bg-[#ccbda3] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-cream"
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "PENDING"
              ? "bg-[#ccbda3] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-cream"
          }`}
        >
          Pending ({bookings.filter((b) => b.status === "PENDING").length})
        </button>

        <button
          onClick={() => setFilter("CHECKED_IN")}
          className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "CHECKED_IN"
              ? "bg-[#ccbda3] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-cream"
          }`}
        >
          Checked In ({bookings.filter((b) => b.status === "CHECKED_IN").length}
          )
        </button>
        <button
          onClick={() => setFilter("CHECKED_OUT")}
          className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "CHECKED_OUT"
              ? "bg-[#ccbda3] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-cream"
          }`}
        >
          Checked Out (
          {bookings.filter((b) => b.status === "CHECKED_OUT").length})
        </button>
        <button
          onClick={() => setFilter("CANCELLED")}
          className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "CANCELLED"
              ? "bg-[#ccbda3] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-cream"
          }`}
        >
          Cancelled ({bookings.filter((b) => b.status === "CANCELLED").length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : sortedBookings.length === 0 ? (
        <div className="text-center py-12">
          <FaHistory className="text-gray-400 text-5xl mx-auto mb-4" />
          <p className="text-gray-600">No booking history yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBookings.map((booking) => (
            <motion.div
              key={booking.bookingID}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-cream rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    Booking #{booking.bookingID}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Booked on:{" "}
                    {new Date(booking.bookingDate).toLocaleDateString("en-US")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusIcon(booking.status)}
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-[#6b5e4c] text-lg mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.checkInDate).toLocaleDateString(
                        "en-US"
                      )}{" "}
                      -{" "}
                      {new Date(booking.checkOutDate).toLocaleDateString(
                        "en-US"
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      ({booking.duration}{" "}
                      {booking.type === "HOURLY" ? "hours" : "days"})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaDoorOpen className="text-[#6b5e4c] text-lg mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Guests</p>
                    <p className="font-medium text-gray-900">
                      {booking.numberOfGuests} people
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-cream">
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-[#6b5e4c]" />
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-[#6b5e4c]">
                      {booking.totalAmount.toLocaleString("en-US")}đ
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Payment</p>
                    <p
                      className={`font-semibold ${
                        booking.paymentStatus === "PAID"
                          ? "text-green-600"
                          : "text-[#6b5e4c]"
                      }`}
                    >
                      {getPaymentStatusLabel(booking.paymentStatus)}
                    </p>
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="flex items-center gap-3 justify-between mt-4 pt-4 border-t border-cream">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Special Requests
                    </p>
                    <p className="text-sm text-gray-900">
                      {booking.specialRequests}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(booking.bookingID)}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#CCBDA3] hover:bg-[#C3923C] text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
                  >
                    <FaEye />
                    <span>View Details</span>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Detail Dialog */}
      {selectedBookingId && (
        <BookingDetailDialog
          bookingId={selectedBookingId}
          isOpen={isDetailDialogOpen}
          onClose={handleCloseDialog}
        />
      )}
    </motion.div>
  );
};

export default BookingHistorySection;

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaCalendarAlt,
  FaDoorOpen,
  FaMoneyBillWave,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBed,
  FaClock,
  FaReceipt,
  FaClipboardList,
} from "react-icons/fa";
import type { Booking } from "../../types/Booking";
import { getBookingById } from "../../services/bookingService";
import { getBookingDetailsById } from "../../services/bookingDetailService";
import type { BookingDetail } from "../../types/BookingDetail";

interface BookingDetailDialogProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailDialog: React.FC<BookingDetailDialogProps> = ({
  bookingId,
  isOpen,
  onClose,
}) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && bookingId) {
      loadBookingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, bookingId]);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      const [bookingData, detailsData] = await Promise.all([
        getBookingById(bookingId),
        getBookingDetailsById(bookingId),
      ]);
      setBooking(bookingData);
      setBookingDetails(detailsData);
    } catch (error) {
      console.error("Error loading booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CHECKED_IN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CHECKED_OUT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Paid";
      case "COMPLETED":
        return "Completed";
      case "PENDING":
        return "Pending Payment";
      case "PERCENTAGE_30":
        return "30% Paid";
      case "PERCENTAGE_50":
        return "50% Paid";
      case "REFUNDED":
        return "Refunded";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 "
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#F5F0EB] text-gray-500 p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <FaReceipt className="text-2xl" />
                <div>
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                  {booking && (
                    <p className="text-sm text-gray-600">
                      #{booking.bookingID}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-176px)] p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#CCBDA3] border-t-transparent"></div>
                </div>
              ) : booking ? (
                <div className="space-y-6">
                  {/* Status & Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F5F0EB] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="text-[#C3923C]" />
                        <h3 className="font-semibold text-gray-800">
                          Booking Information
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Booking Date:</span>
                          <p className="font-medium">
                            {new Date(booking.bookingDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F5F0EB] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClock className="text-[#C3923C]" />
                        <h3 className="font-semibold text-gray-800">
                          Check-in & Check-out
                        </h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Check-in:</span>
                          <p className="font-medium">
                            {new Date(booking.checkInDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Check-out:</span>
                          <p className="font-medium">
                            {new Date(booking.checkOutDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">
                            {booking.duration}{" "}
                            {booking.type === "HOURLY" ? "hours" : "nights"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-[#F5F0EB] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FaUser className="text-[#C3923C]" />
                      <h3 className="font-semibold text-gray-800">
                        Customer Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start gap-3">
                        <FaUser className="text-[#C3923C] mt-1" />
                        <div>
                          <p className="text-gray-600">Full Name</p>
                          <p className="font-medium">
                            {booking.customer.fullName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaEnvelope className="text-[#C3923C] mt-1" />
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-medium">
                            {booking.customer.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaPhone className="text-[#C3923C] mt-1" />
                        <div>
                          <p className="text-gray-600">Phone Number</p>
                          <p className="font-medium">
                            {booking.customer.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaDoorOpen className="text-[#C3923C] mt-1" />
                        <div>
                          <p className="text-gray-600">Number of Guests</p>
                          <p className="font-medium">
                            {booking.numberOfGuests} people
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Room Details */}
                  {bookingDetails.length > 0 && (
                    <div className="bg-[#F5F0EB] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FaBed className="text-[#C3923C]" />
                        <h3 className="font-semibold text-gray-800">
                          Room Details
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {bookingDetails.map((detail, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 border border-[#CCBDA3]/30"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  Room {detail.room.roomNumber}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {detail.room.roomType?.typeName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Floor: {detail.room.floor || "N/A"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#C3923C]">
                                  {detail.roomPrice?.toLocaleString("en-US")}đ
                                </p>
                                <p className="text-xs text-gray-600">
                                  per{" "}
                                  {booking.type === "HOURLY" ? "hour" : "night"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="bg-[#F5F0EB] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FaMoneyBillWave className="text-[#C3923C]" />
                      <h3 className="font-semibold text-gray-800">
                        Payment Information
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Booking Type</span>
                        <span className="font-medium">
                          {booking.type === "HOURLY" ? "Hourly" : "Daily"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">
                          {booking.duration}{" "}
                          {booking.type === "HOURLY" ? "hours" : "nights"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Package Type</span>
                        <span className="font-medium">
                          {booking.packageType}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-[#CCBDA3]/30 flex justify-between items-center">
                        <span className="font-semibold text-gray-800">
                          Total Amount
                        </span>
                        <span className="text-2xl font-bold text-[#C3923C]">
                          {booking.totalAmount?.toLocaleString("en-US")}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Payment Status</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.paymentStatus === "PAID" ||
                            booking.paymentStatus === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : booking.paymentStatus === "PERCENTAGE_30" ||
                                booking.paymentStatus === "PERCENTAGE_50"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {getPaymentStatusLabel(booking.paymentStatus)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="bg-[#F5F0EB] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FaClipboardList className="text-[#C3923C]" />
                        <h3 className="font-semibold text-gray-800">
                          Special Requests
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No booking details found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 sticky bottom-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailDialog;

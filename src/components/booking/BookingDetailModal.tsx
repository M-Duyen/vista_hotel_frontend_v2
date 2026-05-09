import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  FileText,
  Clock,
} from "lucide-react";
import type { Booking } from "../../types/Booking";

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      CHECKED_IN: "bg-purple-100 text-purple-800 border-purple-200",
      CHECKED_OUT: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      COMPLETED: "bg-green-100 text-green-800",
      REFUNDED: "bg-blue-100 text-blue-800",
      PARTIAL: "bg-orange-100 text-orange-800",
      PERCENTAGE_30: "bg-orange-100 text-orange-800",
      PERCENTAGE_50: "bg-orange-100 text-orange-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/40 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#CCBDA3] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-semibold text-white">
            Booking Details - #{booking.bookingID}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Status Section */}
          <div className="mb-6 flex items-center gap-4">
            <div>
              <span className="text-sm text-gray-600">Booking Status:</span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Payment Status:</span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                    booking.paymentStatus
                  )}`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-[#CCBDA3]" />
              Customer Information
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">Name:</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {booking.customer?.fullName || "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {booking.customer?.email || "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {booking.customer?.phone || "N/A"}
                </span>
              </div>
              {booking.customer?.address && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Address:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {booking.customer.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#CCBDA3]" />
              Booking Information
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Check-in Date:</span>
                  <div className="mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(booking.checkInDate)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Check-out Date:</span>
                  <div className="mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(booking.checkOutDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Booking Date:</span>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {formatDateTime(booking.bookingDate)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    Number of Guests:
                  </span>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {booking.numberOfGuests} guests
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Booking Type:</span>
                  <div className="mt-1 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {booking.type}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Duration:</span>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {booking.duration}{" "}
                    {booking.type === "HOURLY" ? "hours" : "days"}
                  </div>
                </div>
              </div>

              {booking.packageType && (
                <div>
                  <span className="text-sm text-gray-600">Package Type:</span>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {booking.packageType}
                  </div>
                </div>
              )}

              {booking.specialRequests && (
                <div>
                  <span className="text-sm text-gray-600">
                    Special Requests:
                  </span>
                  <div className="mt-1 text-sm font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                    {booking.specialRequests}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Room Details */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-[#CCBDA3]" />
              Room Details
            </h4>
            <div className="space-y-3">
              {booking.bookingDetails && booking.bookingDetails.length > 0 ? (
                booking.bookingDetails.map((detail, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">
                          {detail.room?.roomType?.typeName || "N/A"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Room Number: {detail.room?.roomNumber || "N/A"}
                        </div>
                        {detail.room?.floor && (
                          <div className="text-sm text-gray-600">
                            Floor: {detail.room.floor}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Price per{" "}
                          {booking.type === "HOURLY" ? "hour" : "night"}
                        </div>
                        <div className="text-lg font-semibold text-[#CCBDA3]">
                          {formatCurrency(detail.roomPrice || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  No room details available
                </div>
              )}
            </div>
          </div>

          {/* Additional Services */}
          {booking.earlyCheckin && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Early Check-in
              </h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  Time: {booking.earlyCheckin.requestTime}
                </div>
                {booking.earlyCheckin.additionalFee > 0 && (
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    Fee: {formatCurrency(booking.earlyCheckin.additionalFee)}
                  </div>
                )}
              </div>
            </div>
          )}

          {booking.lateCheckout && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Late Check-out
              </h4>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  Time: {booking.lateCheckout.requestTime}
                </div>
                {booking.lateCheckout.additionalFee > 0 && (
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    Fee: {formatCurrency(booking.lateCheckout.additionalFee)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-[#CCBDA3]" />
              Payment Summary
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(booking.totalAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(booking.totalCost || 0)}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">
                    Final Total:
                  </span>
                  <span className="text-xl font-bold text-[#CCBDA3]">
                    {formatCurrency(
                      booking.totalCost || booking.totalAmount || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Information */}
          {booking.employee && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                Handled By
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900">
                  {booking.employee.fullName}
                </div>
                <div className="text-sm text-gray-600">
                  {booking.employee.email}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end flex-shrink-0 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;

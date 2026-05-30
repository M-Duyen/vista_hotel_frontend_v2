import { useEffect, useState } from "react";
import type { Booking } from "../../types/Booking";
import { getCheckoutBalance } from "../../services/bookingService";

export default function CheckoutDetailsModal({
  booking,
  onClose,
  onProceedToPayment,
}: {
  booking: Booking;
  onClose: () => void;
  onProceedToPayment?: () => void;
}) {
  const roomInfo = (booking.bookingDetails ?? [])
    .map((detail: any) => {
      const roomNumber = detail.room?.roomNumber ?? detail.roomNumber ?? "N/A";
      const roomType =
        detail.room?.roomType?.typeName ??
        detail.room?.roomType?.roomTypeName ??
        "N/A";

      return `Room ${roomNumber} - ${roomType}`;
    })
    .join(", ") || "N/A";

  const [balanceDue, setBalanceDue] = useState<number>(booking.totalAmount || 0);
  const [totalAmount, setTotalAmount] = useState<number>(booking.totalAmount || 0);

  useEffect(() => {
    let cancelled = false;

    getCheckoutBalance(booking.bookingID)
      .then((balance) => {
        if (!cancelled) {
          setBalanceDue(balance.remainingAmount);
          setTotalAmount(balance.totalAmount);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBalanceDue(booking.totalAmount || 0);
          setTotalAmount(booking.totalAmount || 0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [booking.bookingID, booking.totalAmount]);

  const isCheckedOut = booking.status === "CHECKED_OUT";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {isCheckedOut ? "Checkout Receipt" : "Checkout Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Guest Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-user text-gold"></i>
              Guest Information
            </h3>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <img
                src={
                  booking.customer?.avatartUrl ||
                  "https://ui-avatars.com/api/?name=" +
                    (booking.customer?.fullName || "Guest")
                }
                alt={
                  booking.customer?.fullName ? booking.customer?.fullName : ""
                }
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow"
              />
              <div>
                <p className="font-medium text-lg">
                  {booking.customer?.fullName}
                </p>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <i className="fas fa-envelope"></i>
                  {booking.customer?.email}
                </p>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <i className="fas fa-phone"></i>
                  {booking.customer?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-calendar-check text-gold"></i>
              Booking Information
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-gray-600 text-sm">Booking ID</p>
                <p className="font-medium">{booking.bookingID}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Room(s)</p>
                <p className="font-medium">{roomInfo}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Check-in Date</p>
                <p className="font-medium">
                  {new Date(booking.checkInDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Check-out Date</p>
                <p className="font-medium">
                  {new Date(booking.checkOutDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Number of Guests</p>
                <p className="font-medium">{booking.numberOfGuests}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Package Type</p>
                <p className="font-medium">{booking.packageType}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Booking Type</p>
                <p className="font-medium">{booking.type}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Duration</p>
                <p className="font-medium">
                  {booking.duration}{" "}
                  {booking.type === "HOURLY" ? "hours" : "nights"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <i className="fas fa-credit-card text-gold"></i>
              Payment Information
            </h3>
            <div className="bg-gradient-to-r from-gold/10 to-amber-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  {totalAmount.toLocaleString("vi-VN")} VND
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Status:</span>
                <span
                  className={`font-medium ${
                    booking.paymentStatus === "PAID"
                      ? "text-green-600"
                      : booking.paymentStatus === "PARTIAL"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>
              {booking.specialRequests && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Special Requests:</span>
                  <span className="font-medium text-sm">
                    {booking.specialRequests}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gold/20 pt-2 mt-2">
                <span className="font-semibold">Balance Due:</span>
                <span className="font-semibold text-lg text-gold">
                  {balanceDue.toLocaleString("vi-VN")} VND
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Time */}
          {isCheckedOut && (
            <div className="mb-6 bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <i className="fas fa-check-circle text-xl"></i>
                <div>
                  <p className="font-semibold">Checkout Completed</p>
                  <p className="text-sm">
                    {new Date(booking.checkOutDate).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
            {booking.status === "CHECKED_IN" && onProceedToPayment && (
              <button
                onClick={onProceedToPayment}
                className="flex-1 px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold/90 transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-arrow-right"></i>
                Proceed to Payment
              </button>
            )}
            {booking.status === "CHECKED_OUT" && (
              <button
                onClick={() => {
                  // TODO: Implement print receipt
                  console.log("Print receipt for:", booking.bookingID);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <i className="fas fa-print"></i>
                Print Receipt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

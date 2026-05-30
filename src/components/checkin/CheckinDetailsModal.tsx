/* eslint-disable */
import { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaBookmark,
  FaHotel,
  FaCreditCard,
  FaClipboardList,
  FaWifi,
  FaTv,
  FaSnowflake,
  FaGlassMartini,
  FaBath,
  FaUser,
} from "react-icons/fa";
import type { Booking } from "../../types/Booking";
import { checkIn } from "../../services/bookingService";
import { useToastContext } from "../../hooks/useToastContext";
const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateNights = (checkIn: string, checkOut: string) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getTrustScoreColor = (score: number) => {
  if (score >= 81)
    return {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    };
  if (score >= 41)
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    };
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
};

const getMembershipColor = (level: string) => {
  switch (level) {
    case "PLATINUM":
      return "bg-slate-800";
    case "GOLD":
      return "bg-yellow-500";
    case "SILVER":
      return "bg-gray-400";
    case "BRONZE":
    default:
      return "bg-amber-700";
  }
};

const calculatePaymentInfo = (booking: Booking) => {
  const totalAmount = booking.totalAmount || 0;
  const paymentStatus = booking.paymentStatus;

  let amountPaid = 0;
  switch (paymentStatus) {
    case "PAID":
      amountPaid = totalAmount;
      break;
    case "PERCENTAGE_50":
      amountPaid = totalAmount * 0.5;
      break;
    case "PERCENTAGE_30":
      amountPaid = totalAmount * 0.3;
      break;
    default:
      amountPaid = 0;
  }

  const balanceDue = totalAmount - amountPaid;
  const roomRate = booking.bookingDetails?.[0]?.roomPrice || 0;
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const taxesAndFees = totalAmount - roomRate * nights;

  return {
    roomRate,
    totalAmount,
    taxesAndFees: taxesAndFees > 0 ? taxesAndFees : 0,
    amountPaid,
    balanceDue: balanceDue > 0 ? balanceDue : 0,
  };
};

interface CheckinDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Booking | null;
  onCheckInSuccess?: () => void;
}

function CheckinDetailsModal({
  isOpen,
  onClose,
  guest,
  onCheckInSuccess,
}: CheckinDetailsModalProps) {
  const [checklistItems, setChecklistItems] = useState({
    roomKey: false,
    wifiInfo: false,
    welcomeDrink: false,
    facilities: false,
  });
  const toast = useToastContext();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setChecklistItems({
      roomKey: false,
      wifiInfo: false,
      welcomeDrink: false,
      facilities: false,
    });
  }, [guest]);

  const handleCheckboxChange = (itemId: keyof typeof checklistItems) => {
    setChecklistItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleCompleteCheckin = async () => {
    if (!guest) return;

    const allChecked = Object.values(checklistItems).every(
      (value) => value === true
    );

    if (!allChecked) {
      toast.error("Please complete all check-in tasks before proceeding.", {
        duration: 2000,
      });
      return;
    }

    const confirmCheckin = window.confirm(
      `Are you sure you want to complete check-in for ${
        guest.customer?.fullName || "this guest"
      }?`
    );

    if (!confirmCheckin) return;

    setIsProcessing(true);

    try {
      await checkIn(guest.bookingID);
      toast.success(
        `Check-in completed successfully for ${guest.customer?.fullName}!`,
        {
          duration: 2000,
        }
      );
      if (onCheckInSuccess) {
        onCheckInSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to check in. Please try again.";

      toast.error(`Check-in failed: ${errorMessage}`, {
        duration: 2000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !guest) return null;

  const booking = guest;
  const customer = booking.customer;
  const room = booking.bookingDetails?.[0]?.room;
  const roomNumber = room?.roomNumber || "N/A";
  const roomType = room?.roomType?.typeName || "Standard Room";
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const trustScore = customer?.reputationPoint ?? 0;
  const trustScoreColors = getTrustScoreColor(trustScore);
  const paymentInfo = calculatePaymentInfo(booking);
  const isPending = booking.status === "PENDING" || booking.status === "WAITING";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-[modalFadeIn_0.3s]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="p-5 border-b border-[#EBE3D7] sticky top-0 bg-white z-10 flex justify-between items-center">
            <h2 className="text-2xl font-playfair font-semibold">
              Check-in Details
            </h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 hover:text-black"
              disabled={isProcessing}
            >
              &times;
            </button>
          </div>

          {/* Modal body */}
          <div className="p-6">
            {/* Guest detail header */}
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6 pb-6 border-b border-[#EBE3D7]">
              <div className="flex items-center gap-4">
                {customer?.avatarUrl ? (
                  <img
                    src={customer.avatarUrl}
                    alt={customer.fullName || "Guest"}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#CCBDA3] flex items-center justify-center text-white text-2xl">
                    <FaUser />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {customer?.fullName || "Guest"}
                  </h3>
                  <p className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <FaEnvelope />
                    {customer?.email || "No email"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <FaPhone />
                    {customer?.phone || "No phone"}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-center">
                  <span className="text-sm text-gray-500">Trust Score</span>
                  <div
                    className={`w-14 h-14 ${trustScoreColors.bg} ${trustScoreColors.text} border ${trustScoreColors.border} rounded-full flex items-center justify-center text-xl font-bold mt-2`}
                  >
                    {trustScore}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500">Membership</span>
                  <div
                    className={`${getMembershipColor(
                      customer?.memberShipLevel || "BRONZE"
                    )} text-white px-3 py-1 rounded-full text-sm mt-2`}
                  >
                    {customer?.memberShipLevel || "BRONZE"}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail sections */}
            <div className="space-y-8">
              {/* Booking Information */}
              <div className="border-b border-[#EBE3D7] pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaBookmark className="text-[#CCBDA3]" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Booking ID</span>
                    <p className="font-medium">{booking.bookingID}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Booking Date</span>
                    <p className="font-medium">
                      {formatDateTime(booking.bookingDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Check-in Date</span>
                    <p className="font-medium">
                      {formatDateTime(booking.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Check-out Date
                    </span>
                    <p className="font-medium">
                      {formatDateTime(booking.checkOutDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nights</span>
                    <p className="font-medium">{nights}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Guests</span>
                    <p className="font-medium">
                      {booking.numberOfGuests}{" "}
                      {booking.numberOfGuests > 1 ? "Guests" : "Guest"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Booking Type</span>
                    <p className="font-medium">
                      {booking.type === "DAILY"
                        ? "Daily Booking"
                        : "Hourly Booking"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Package Type</span>
                    <p className="font-medium">{booking.packageType}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <span className="text-sm text-gray-500">
                      Special Requests
                    </span>
                    <p className="font-medium">
                      {booking.specialRequests || "None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Information */}
              <div className="border-b border-[#EBE3D7] pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaHotel className="text-[#CCBDA3]" />
                  Room Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Room Number</span>
                    <p className="font-medium">{roomNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Room Type</span>
                    <p className="font-medium">{roomType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Floor</span>
                    <p className="font-medium">{room?.floor || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Room Status</span>
                    <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                      {room?.status || "Ready"}
                    </span>
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <span className="text-sm text-gray-500 block mb-2">
                      Amenities
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5F0EB] rounded-full text-sm">
                        <FaWifi /> WiFi
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5F0EB] rounded-full text-sm">
                        <FaTv /> Smart TV
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5F0EB] rounded-full text-sm">
                        <FaSnowflake /> AC
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5F0EB] rounded-full text-sm">
                        <FaGlassMartini /> Minibar
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F5F0EB] rounded-full text-sm">
                        <FaBath /> Bathtub
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-b border-[#EBE3D7] pb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaCreditCard className="text-[#CCBDA3]" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      Payment Status
                    </span>
                    <p className="font-medium">{booking.paymentStatus}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Room Rate</span>
                    <p className="font-medium">
                      {paymentInfo.roomRate.toLocaleString("vi-VN")} VND/night
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <p className="font-medium text-lg">
                      {paymentInfo.totalAmount.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Taxes & Fees</span>
                    <p className="font-medium">
                      {paymentInfo.taxesAndFees.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Amount Paid</span>
                    <p className="font-medium text-green-600">
                      {paymentInfo.amountPaid.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Balance Due</span>
                    <p
                      className={`font-medium ${
                        paymentInfo.balanceDue > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {paymentInfo.balanceDue.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                </div>
              </div>

              {/* Check-in Checklist - chỉ hiển thị nếu chưa check-in */}
              {isPending && (
                <div className="border-b border-[#EBE3D7] pb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaClipboardList className="text-[#CCBDA3]" />
                    Check-in Checklist
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 rounded bg-green-50">
                      <input
                        type="checkbox"
                        id="id-verification"
                        checked
                        disabled
                      />
                      <label
                        htmlFor="id-verification"
                        className="text-green-700"
                      >
                        ID Verification
                      </label>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-green-50">
                      <input
                        type="checkbox"
                        id="payment-confirmation"
                        checked
                        disabled
                      />
                      <label
                        htmlFor="payment-confirmation"
                        className="text-green-700"
                      >
                        Payment Confirmation
                      </label>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded">
                      <input
                        type="checkbox"
                        id="room-key-issued"
                        checked={checklistItems.roomKey}
                        onChange={() => handleCheckboxChange("roomKey")}
                        disabled={isProcessing}
                      />
                      <label htmlFor="room-key-issued">Room Key Issued</label>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded">
                      <input
                        type="checkbox"
                        id="wifi-info"
                        checked={checklistItems.wifiInfo}
                        onChange={() => handleCheckboxChange("wifiInfo")}
                        disabled={isProcessing}
                      />
                      <label htmlFor="wifi-info">
                        WiFi Information Provided
                      </label>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded">
                      <input
                        type="checkbox"
                        id="welcome-drink"
                        checked={checklistItems.welcomeDrink}
                        onChange={() => handleCheckboxChange("welcomeDrink")}
                        disabled={isProcessing}
                      />
                      <label htmlFor="welcome-drink">
                        Welcome Drink Offered
                      </label>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded">
                      <input
                        type="checkbox"
                        id="facilities-explained"
                        checked={checklistItems.facilities}
                        onChange={() => handleCheckboxChange("facilities")}
                        disabled={isProcessing}
                      />
                      <label htmlFor="facilities-explained">
                        Facilities Explained
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Staff Notes</h3>
                <textarea
                  placeholder="Add notes about this check-in..."
                  className="w-full border border-[#EBE3D7] rounded-md p-3 min-h-[100px]"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-5 border-t border-[#EBE3D7] bg-[#F5F0EB]/30 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-[#EBE3D7] rounded-md hover:bg-[#EBE3D7]/50 transition font-medium"
              disabled={isProcessing}
            >
              Cancel
            </button>
            {isPending && (
              <button
                onClick={handleCompleteCheckin}
                className="px-6 py-2.5 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Complete Check-in"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckinDetailsModal;

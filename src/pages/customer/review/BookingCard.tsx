/* eslint-disable*/
import { Badge, Star } from "lucide-react";
import type { Review } from "../../../types/Review";
import type { Booking } from "../../../types/Booking";
import type { BookingDetail } from "../../../types/BookingDetail";
import { Card } from "../../../components/my-card/components/ui/card";
import { formatNumber } from "../../../utils/formatters";

interface BookingCardProps {
  booking: Booking;
  reviews: Record<string, Review>;
  onReviewClick: (bookingDetail: BookingDetail) => void;
}

export default function BookingCard({
  booking,
  reviews,
  onReviewClick,
}: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CHECKED_OUT":
        return "bg-green-100 text-green-800";
      case "CHECKED_IN":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasReview = (bookingDetail: BookingDetail) => {
    if (!reviews || typeof reviews !== "object") return null;
    return reviews[`${booking.bookingID}-${bookingDetail.room.roomNumber}`];
  };

  return (
    <Card className="p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking #{booking.bookingID}
          </h2>
          <p className="text-gray-600">Guest: {booking.customer.fullName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Check-in</p>
          <p className="font-semibold text-gray-900">
            {new Date(booking.checkInDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Check-out</p>
          <p className="font-semibold text-gray-900">
            {new Date(booking.checkOutDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Guests</p>
          <p className="font-semibold text-gray-900">
            {booking.numberOfGuests}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="font-semibold text-gray-900">
            {formatNumber(booking.totalAmount)}
            {" VND"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Rooms</h3>
        {booking.bookingDetails.map((bookingDetail) => {
          const hasReviewForRoom = hasReview(bookingDetail);
          return (
            <div
              key={bookingDetail.room.roomNumber}
              className="flex items-center justify-between p-4 bg-[#f5f1ed] rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-lg">
                  Room {bookingDetail.room.roomNumber}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {bookingDetail.room.roomType?.typeName} • Capacity:{" "}
                  {bookingDetail.room.roomType?.maxOccupancy}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {bookingDetail.room.roomType?.amenties
                    ?.slice(0, 3)
                    .map((facility) => (
                      <span
                        key={facility}
                        className="text-xs bg-white text-gray-700 px-3 py-1.5 rounded-full border border-gray-200"
                      >
                        {facility}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                {hasReviewForRoom ? (
                  <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-50 px-3 py-1.5 rounded-full">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-semibold">
                      {hasReviewForRoom.rating}/5
                    </span>
                  </div>
                ) : null}
                <button
                  onClick={() => onReviewClick(bookingDetail)}
                  disabled={!!hasReviewForRoom}
                  className={`${
                    hasReviewForRoom
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : "bg-[#d4c5b9] hover:bg-[#c9b8a8]"
                  } text-white px-6 py-2.5 rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md disabled:hover:shadow-sm`}
                >
                  {hasReviewForRoom ? "Reviewed" : "Write Review"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

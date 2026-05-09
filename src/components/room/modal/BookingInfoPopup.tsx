import React from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaCalendarCheck,
  FaCalendarTimes,
  FaMoon,
  FaDollarSign,
} from "react-icons/fa";
import type { Room } from "../view/RoomTableView";
import type { RoomBooking } from "../../../types/Booking";
import { formatVND } from "../../../utils/formatters";

interface BookingInfoPopupProps {
  booking: RoomBooking;
  room: Room;
  position: { x: number; y: number };
}

/**
 * Popup hiển thị thông tin chi tiết đơn đặt phòng
 */
const BookingInfoPopup: React.FC<BookingInfoPopupProps> = ({
  booking,
  room,
  position,
}) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      bg: "bg-amber-500",
      text: "text-amber-50",
    },
    "checked-in": {
      label: "Checked In",
      bg: "bg-emerald-500",
      text: "text-emerald-50",
    },
    "checked-out": {
      label: "Checked Out",
      bg: "bg-rose-500",
      text: "text-rose-50",
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-gray-400",
      text: "text-gray-900",
    },
    confirmed: {
      label: "Confirmed",
      bg: "bg-blue-500",
      text: "text-blue-50",
    },
  };

  const nights =
    Math.ceil(
      (new Date(booking.checkOut).getTime() -
        new Date(booking.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 1;

  const totalPrice = room.price * nights;

  // Tính toán vị trí popup để không bị tràn ra ngoài màn hình
  const popupWidth = 280;
  const popupHeight = 320; // Ước tính chiều cao popup (tăng lên do có thêm giờ)
  const offset = 16;

  let finalX = position.x;
  let finalY = position.y;
  let transformX = "-50%"; // Center theo X mặc định
  let transformY = "-100%"; // Đặt phía trên mặc định

  // Kiểm tra tràn bên phải
  if (finalX + popupWidth / 2 + offset > window.innerWidth) {
    // Đặt popup căn phải
    finalX = window.innerWidth - popupWidth - offset;
    transformX = "0%";
  }
  // Kiểm tra tràn bên trái
  else if (finalX - popupWidth / 2 < offset) {
    // Đặt popup căn trái
    finalX = offset;
    transformX = "0%";
  }

  // Kiểm tra tràn phía trên
  if (finalY - popupHeight - 20 < 0) {
    transformY = "0%"; // Đặt phía dưới chuột
    finalY = position.y + 20;
  } else {
    finalY = finalY - 20; // Offset phía trên
  }

  return (
    <>
      {/* Popup compact */}
      <motion.div
        className="fixed z-50 bg-white rounded-lg shadow-2xl border-2 border-gray-200 w-[280px]"
        style={{
          left: `${finalX}px`,
          top: `${finalY}px`,
          transform: `translate(${transformX}, ${transformY})`,
        }}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 5 }}
        transition={{
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        onClick={(e) => e.stopPropagation()} // Ngăn click vào popup đóng popup
      >
        {/* Header compact */}
        <div className="bg-gradient-to-r from-[#6b5e4c] to-[#8b7355] px-3 py-2 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                Room {booking.roomNumber}
              </h3>
              <p className="text-xs text-gray-100">
                {typeof room.roomType === "string"
                  ? room.roomType
                  : room.roomType.typeName}
              </p>
            </div>
            <div
              className={`${statusConfig[booking.status].bg} ${
                statusConfig[booking.status].text
              } px-2 py-1 rounded text-xs font-semibold`}
            >
              {statusConfig[booking.status].label}
            </div>
          </div>
        </div>

        {/* Content compact */}
        <div className="p-3 space-y-2">
          {/* Guest */}
          <div className="flex items-center gap-2">
            <FaUser className="text-[#6b5e4c] text-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Guest</p>
              <p className="font-semibold text-sm text-gray-800 truncate">
                {booking.guestName}
              </p>
            </div>
          </div>

          {/* Check-in */}
          <div className="flex items-center gap-2">
            <FaCalendarCheck className="text-green-600 text-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Check-in</p>
              <p className="font-semibold text-sm text-gray-800">
                {new Date(booking.checkIn).toLocaleString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Check-out */}
          <div className="flex items-center gap-2">
            <FaCalendarTimes className="text-red-600 text-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Check-out</p>
              <p className="font-semibold text-sm text-gray-800">
                {new Date(booking.checkOut).toLocaleString("vi-VN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Nights & Price */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaMoon className="text-blue-600 text-sm" />
                <span className="text-sm font-semibold text-gray-800">
                  {nights} {nights > 1 ? "nights" : "night"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FaDollarSign className="text-amber-600 text-xs" />
                <span className="text-sm font-bold text-[#6b5e4c]">
                  {formatVND(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow pointing down */}
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-200" />
      </motion.div>
    </>
  );
};

export default BookingInfoPopup;

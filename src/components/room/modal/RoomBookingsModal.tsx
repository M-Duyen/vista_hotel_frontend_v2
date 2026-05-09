import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCalendarAlt, FaUser, FaMoneyBill } from "react-icons/fa";
import bookingService from "../../../services/bookingService";

interface RoomBookingsModalProps {
  roomNumber: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RoomBookingItem {
  bookingID: string;
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  status: string;
}

const RoomBookingsModal: React.FC<RoomBookingsModalProps> = ({
  roomNumber,
  isOpen,
  onClose,
}) => {
  const [bookings, setBookings] = useState<RoomBookingItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !roomNumber) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await bookingService.getByRoom(roomNumber);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = response.map((b: any) => ({
          bookingID: b.bookingID,
          customerName: b.customer?.fullName ?? "Unknown",
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
          numberOfGuests: b.numberOfGuests,
          totalAmount: b.totalAmount,
          status: b.status,
        }));

        setBookings(mapped);
      } catch (e) {
        console.error("Lỗi load bookings:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isOpen, roomNumber]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-[200]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div
          className="bg-white max-w-3xl w-full rounded-2xl shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">
              Bookings for Room {roomNumber}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <FaTimes className="text-gray-600 text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                No bookings found for this room.
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.bookingID}
                    className="p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="font-semibold text-lg">
                      Booking #{b.bookingID}
                    </div>

                    <div className="mt-1 text-gray-700 flex items-center gap-2">
                      <FaUser />
                      {b.customerName}
                    </div>

                    <div className="mt-2 flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt />
                        <span>
                          Check-in:{" "}
                          {new Date(b.checkInDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span>
                          Check-out:{" "}
                          {new Date(b.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span>Guests: {b.numberOfGuests}</span>
                      <span className="flex items-center gap-1 text-green-700 font-semibold">
                        <FaMoneyBill />
                        {b.totalAmount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    <div className="mt-2">
                      <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoomBookingsModal;

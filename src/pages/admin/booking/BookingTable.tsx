/* eslint-disable */
import { useEffect, useState } from "react";
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getAll } from "../../../services/bookingService";
import type { Booking } from "../../../types/Booking";

export default function BookingTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(25 / itemsPerPage);

  const fetchedBookings = async () => {
    try {
      setLoading(true);
      const data = await getAll();
      setBookings(data);
      setLoading(false);
      setError("");
    } catch (err) {
      setError("Failed to fetch bookings: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchedBookings();
  }, []);

  return (
    <div className="flex-1 bg-[#d4c5b9] p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Booking / Booking Management
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-400 rounded-lg text-gray-900 hover:bg-white/50 transition text-sm font-medium">
            Filter
          </button>
          <button className="px-4 py-2 border border-gray-400 rounded-lg text-gray-900 hover:bg-white/50 transition text-sm font-medium">
            Export
          </button>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
            Add Booking
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Booking ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Customer Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Check-in Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Check-out Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Booking Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Payment Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Number of Guests
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.bookingID}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {booking.bookingID}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {booking.customer?.fullName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking.checkInDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking.checkOutDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking.bookingDate}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === "CHECKED_OUT"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking.paymentStatus}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking.numberOfGuests}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-lg transition text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          className="p-2 hover:bg-white/50 rounded-lg transition disabled:opacity-50"
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} className="text-gray-900" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded-lg transition ${
              currentPage === page
                ? "bg-[#c4b5a9] text-gray-900 font-semibold"
                : "hover:bg-white/50 text-gray-900"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          className="p-2 hover:bg-white/50 rounded-lg transition disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={18} className="text-gray-900" />
        </button>
      </div>
    </div>
  );
}

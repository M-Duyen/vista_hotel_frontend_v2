import { useEffect, useState } from "react";
import { Check, X, Calendar, Clock } from "lucide-react";
import { CiShoppingCart } from "react-icons/ci";
import Header from "../../../components/Header";
import Breadcrumb from "../../../components/common/Breadcrumb";
import type { Room } from "../../../types/Room";
import {
  getCartBeanByCustomerId,
  removeRoomFromCart,
} from "../../../services/cartBeanService";
import { getById } from "../../../services/customerService";
import type { Customer } from "../../../types/Customer";
import { useNavigate } from "react-router-dom";

type BookingType = "DAILY" | "HOURLY";

export default function RoomCart() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [customer, setCustomer] = useState<Customer[]>();
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<BookingType>("DAILY");

  const fetchData = async () => {
    const userDataStr = localStorage.getItem("user");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const customerId = userData?.data?.id || userData?.id;

    if (customerId) {
      const customerData = await getById(customerId);
      setCustomer(customerData);
    } else {
      setError("User not logged in. Please log in to continue.");
    }

    const cartBeans = await getCartBeanByCustomerId(customerId);
    setRooms(cartBeans?.items || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const selectedRoomDetails = (rooms || []).filter((room) =>
    selectedRooms.includes(room.roomNumber?.toString() || "")
  );

  const handleRemoveFromCart = async (roomNumber: string) => {
    const userDataStr = localStorage.getItem("user");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const customerId = userData?.data?.id || userData?.id;

    if (!customerId) {
      alert("Please log in to remove items from cart");
      return;
    }

    try {
      setRemoving(roomNumber);
      await removeRoomFromCart(customerId, roomNumber);
      await fetchData();
      setSelectedRooms((prev) => prev.filter((id) => id !== roomNumber));
    } catch (error) {
      console.error("Failed to remove room from cart:", error);
      alert("Failed to remove room from cart");
    } finally {
      setRemoving(null);
    }
  };

  const handleContinueBooking = () => {
    if (selectedRooms.length === 0) {
      alert("Please select at least one room to continue");
      return;
    }

    // Navigate với bookingType
    navigate("/customer/bookingPage", {
      state: {
        selectedRooms,
        bookingType,
      },
    });
  };

  console.log("Rooms:", rooms);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F5F0EB] shadow-md">
        <Header />
      </div>
      <div className="min-h-screen bg-[#f5f1ed] p-8 pt-20">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Home", path: "/home" },
                { label: "Accommodation", path: "/customer/room" },
                { label: "Cart" },
              ]}
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-[#2a2a2a]">
                Select Rooms
              </h1>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Selected Rooms: {selectedRooms.length}
                </p>
                <p className="text-2xl font-bold text-[#d4c5b9]">
                  {selectedRooms.length} room(s)
                </p>
              </div>
            </div>
            <p className="text-gray-600">
              Choose your preferred rooms and booking type
            </p>
          </div>

          {/* Booking Type Selection */}
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-[#2a2a2a] mb-4">
              Select Booking Type
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setBookingType("DAILY")}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                  bookingType === "DAILY"
                    ? "border-[#d4c5b9] bg-[#d4c5b9] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#d4c5b9]"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Daily Booking</p>
                  <p className="text-sm opacity-90">
                    Book by check-in and check-out dates
                  </p>
                </div>
              </button>

              <button
                onClick={() => setBookingType("HOURLY")}
                className={`cursor-pointer flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                  bookingType === "HOURLY"
                    ? "border-[#d4c5b9] bg-[#d4c5b9] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#d4c5b9]"
                }`}
              >
                <Clock className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Hourly Booking</p>
                  <p className="text-sm opacity-90">
                    Book by hours with flexible time slots
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rooms Grid */}
            <div className="lg:col-span-2">
              {rooms && rooms.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-500 text-lg mb-2">
                    Your cart is empty
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    Add rooms to your cart to start booking
                  </p>
                  <button
                    onClick={() => navigate("/customer/room")}
                    className="px-6 py-2 bg-[#d4c5b9] text-white rounded-lg hover:bg-opacity-90 transition"
                  >
                    Browse Rooms
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(rooms || []).map((room) => (
                    <div
                      key={room.roomNumber}
                      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                        selectedRooms.includes(
                          room.roomNumber?.toString() || ""
                        )
                          ? "ring-2 ring-[#d4c5b9] scale-105 hover:shadow-lg cursor-pointer"
                          : ""
                      }`}
                    >
                      {/* Room Image */}
                      <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={room.images?.at(0) || "/placeholder.svg"}
                          alt={room.roomNumber}
                          className="w-full h-full object-cover"
                        />
                        {/* Remove Button */}
                        <button
                          onClick={() =>
                            handleRemoveFromCart(
                              room.roomNumber?.toString() || ""
                            )
                          }
                          disabled={removing === room.roomNumber?.toString()}
                          className="absolute top-3 left-3 w-8 h-8 bg-white text-gray-700 hover:bg-[#CCBDA3] hover:text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 group-hover:opacity-100 hover:scale-110"
                          title="Remove from cart"
                        >
                          {removing === room.roomNumber?.toString() ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <X className="w-5 h-5" />
                          )}
                        </button>

                        {/* Status Badge */}
                        {/* <div
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                          room.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {room.status === "AVAILABLE" ? "Available" : "Booked"}
                      </div> */}

                        {/* Checkbox Overlay */}
                        <button
                          onClick={() =>
                            toggleRoomSelection(
                              room.roomNumber?.toString() || ""
                            )
                          }
                          className={`absolute bottom-3 right-3 w-6 h-6 rounded border-2 transition-all ${
                            selectedRooms.includes(
                              room.roomNumber?.toString() || ""
                            )
                              ? "bg-[#d4c5b9] border-[#d4c5b9]"
                              : "bg-white border-gray-300 hover:border-[#d4c5b9]"
                          }`}
                        >
                          {selectedRooms.includes(
                            room.roomNumber?.toString() || ""
                          ) && <Check className="w-4 h-4 text-white m-auto" />}
                        </button>
                      </div>

                      {/* Room Details */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-[#2a2a2a]">
                              {room.roomNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {room.roomType?.typeName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#d4c5b9]">
                              {room.roomType?.basePrice?.toLocaleString(
                                "vi-VN"
                              )}{" "}
                              VND
                            </p>
                            <p className="text-xs text-gray-500">
                              {bookingType === "HOURLY"
                                ? "per hour"
                                : "per night"}
                            </p>
                          </div>
                        </div>

                        {/* Capacity */}
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Capacity:
                          </span>
                          <span className="inline-block bg-[#f5f1ed] px-2 py-1 rounded text-sm font-semibold text-[#2a2a2a]">
                            {room.roomType?.maxOccupancy}{" "}
                            {room.roomType?.maxOccupancy === 1
                              ? "guest"
                              : "guests"}
                          </span>
                        </div>

                        {/* Amenities */}
                        {room.roomType?.amenties &&
                          room.roomType.amenties.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                Amenities:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {room.roomType.amenties
                                  .slice(0, 3)
                                  .map((amenity, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                {room.roomType.amenties.length > 3 && (
                                  <span className="text-xs text-gray-500 px-2 py-1">
                                    +{room.roomType.amenties.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Selection Button */}
                        <button
                          onClick={() =>
                            toggleRoomSelection(
                              room.roomNumber?.toString() || ""
                            )
                          }
                          className={`cursor-pointer w-full py-2 rounded font-semibold transition-all ${
                            selectedRooms.includes(
                              room.roomNumber?.toString() || ""
                            )
                              ? "bg-[#d4c5b9] text-white"
                              : "bg-gray-100 text-[#2a2a2a] hover:bg-[#d4c5b9] hover:text-white"
                          }`}
                        >
                          {selectedRooms.includes(
                            room.roomNumber?.toString() || ""
                          )
                            ? "Selected"
                            : "Select Room"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-[#2a2a2a] mb-6 flex items-center gap-2">
                  <span className="bg-[#d4c5b9] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                    <CiShoppingCart />
                  </span>
                  Booking Summary
                </h2>

                {/* Booking Type Display */}
                <div className="mb-4 p-3 bg-[#f5f1ed] rounded-lg">
                  <div className="flex items-center gap-2">
                    {bookingType === "DAILY" ? (
                      <Calendar className="w-4 h-4 text-[#d4c5b9]" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#d4c5b9]" />
                    )}
                    <span className="text-sm font-semibold text-[#2a2a2a]">
                      {bookingType === "DAILY"
                        ? "Daily Booking"
                        : "Hourly Booking"}
                    </span>
                  </div>
                </div>

                {selectedRoomDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      No rooms selected yet
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Select rooms to continue
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Selected Rooms List */}
                    <div className="mb-6 max-h-96 overflow-y-auto">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Selected Rooms:
                      </p>
                      <div className="space-y-3">
                        {selectedRoomDetails.map((room) => (
                          <div
                            key={room.roomNumber}
                            className="flex justify-between items-start p-3 bg-[#f5f1ed] rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-[#2a2a2a]">
                                {room.roomNumber}
                              </p>
                              <p className="text-xs text-gray-600">
                                {room.roomType?.typeName}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 mb-4"></div>

                    {/* Cost Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          Subtotal ({selectedRoomDetails.length} room
                          {selectedRoomDetails.length > 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleContinueBooking}
                        className="cursor-pointer w-full bg-[#d4c5b9] text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all"
                      >
                        Continue Booking
                      </button>
                      <button
                        onClick={() => setSelectedRooms([])}
                        className="cursor-pointer w-full bg-gray-100 text-[#2a2a2a] font-bold py-2 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/*eslint-disable*/
import React, { useState, useEffect, useRef } from "react";
import { FaCalendarCheck, FaWalking, FaClock, FaSearch } from "react-icons/fa";
import { searchBookings } from "../../services/bookingService";
import IDScannerModal from "./IDScannerModal";
import type { IDCardInfo } from "../../types/IDCardInfo";
import type { Booking } from "../../types/Booking";
import type { RoomType } from "../../types/RoomType";
import type { Room } from "../../types/Room";
import { findByEmail, findByPhone } from "../../services/customerService";
import type { Customer } from "../../types/Customer";
import WalkInService, {
  getAvailableRooms,
  getAvailableRoomsForHourly,
  getRoomTypes,
  type HourlyBookingRequest,
  type WalkInBookingRequest,
} from "../../services/WalkInService";
import { calculateHourlyRate } from "../../services/hourlyRate";
import type { HourlyRateCalculation } from "../../types/HourlyRate";

type ManualCheckinModalProps = { isOpen: boolean; onClose: () => void };

function ManualCheckinModal({ isOpen, onClose }: ManualCheckinModalProps) {
  const [activeOption, setActiveOption] = useState("booking");

  // Walk-in states
  const [walkInData, setWalkInData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "Select Gender" as "Select Gender" | "MALE" | "FEMALE",
    roomNumber: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 2,
    specialRequests: "",
  });

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hourly booking states
  const [hourlyData, setHourlyData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: "Select Gender" as "Select Gender" | "MALE" | "FEMALE",
    roomType: "",
    roomNumber: "",
    numberOfGuests: 1,
  });
  const [checkInTime, setCheckInTime] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [duration, setDuration] = useState("1");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [hourlyRate, setHourlyRate] = useState({ rate: 15, percentage: 15 });
  const [hourlyAvailableRooms, setHourlyAvailableRooms] = useState<Room[]>([]);
  const [loadingHourlyRooms, setLoadingHourlyRooms] = useState(false);

  const [hourlyRateCalculation, setHourlyRateCalculation] =
    useState<HourlyRateCalculation | null>(null);
  const [roomTypePrice, setRoomTypePrice] = useState<number>(0);

  // Booking search states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showIDScanner, setShowIDScanner] = useState(false);

  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isCalculatingRate, setIsCalculatingRate] = useState(false);

  useEffect(() => {
    if (activeOption === "walkin") {
      loadRoomTypes();
    }
  }, [activeOption]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (checkInDate && checkInTime && duration && hourlyData.roomType) {
      calculateHourlyRateForBooking();
    }
  }, [checkInDate, checkInTime, duration, hourlyData.roomType]);

  useEffect(() => {
    if (activeOption === "hourly") {
      loadRoomTypes();
    }
  }, [activeOption]);

  useEffect(() => {
    if (
      activeOption === "hourly" &&
      hourlyData.roomType &&
      checkInDate &&
      checkInTime &&
      duration
    ) {
      loadHourlyAvailableRooms();
    }
  }, [hourlyData.roomType, checkInDate, checkInTime, duration]);

  const loadHourlyAvailableRooms = async () => {
    setLoadingHourlyRooms(true);
    try {
      const dateTimeString = `${checkInDate}T${checkInTime}:00`;
      const rooms = await getAvailableRoomsForHourly(
        hourlyData.roomType,
        dateTimeString,
        parseInt(duration)
      );

      setHourlyAvailableRooms(rooms);

      if (rooms.length === 0) {
        alert("No rooms available for selected time and duration");
      }
    } catch (error) {
      console.error("Error loading hourly available rooms:", error);
      alert("Failed to load available rooms");
      setHourlyAvailableRooms([]);
    } finally {
      setLoadingHourlyRooms(false);
    }
  };

  const validateHourlyForm = (): string | null => {
    if (!hourlyData.firstName.trim()) return "First name is required";
    if (!hourlyData.lastName.trim()) return "Last name is required";
    if (!hourlyData.phone.trim()) return "Phone number is required";
    if (!hourlyData.roomNumber) return "Please select a room";
    if (!checkInDate) return "Check-in date is required";
    if (!checkInTime) return "Check-in time is required";
    if (!duration) return "Duration is required";
    if (!hourlyRateCalculation || !hourlyRateCalculation.totalAmount) {
      return "Please wait for rate calculation to complete";
    }

    return null;
  };

  const handleHourlySubmit = async () => {
    const validationError = validateHourlyForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const checkInDateTime = `${checkInDate}T${checkInTime}:00`;

      const request: HourlyBookingRequest = {
        firstName: hourlyData.firstName,
        lastName: hourlyData.lastName,
        email: hourlyData.email || undefined,
        phone: hourlyData.phone,
        address: hourlyData.address || undefined,
        birthDate: hourlyData.birthDate || undefined,
        gender:
          hourlyData.gender === "Select Gender" ? undefined : hourlyData.gender,
        roomNumber: hourlyData.roomNumber,
        checkInTime: checkInDateTime,
        duration: parseInt(duration),
        numberOfGuests: hourlyData.numberOfGuests,
        totalAmount: hourlyRateCalculation?.totalAmount || 0,
      };

      const booking = await WalkInService.createHourlyBooking(request);

      alert(
        `Hourly booking created successfully!\nBooking ID: ${booking.bookingID}\nDuration: ${duration} hour(s)`
      );

      // Reset form
      setHourlyData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        birthDate: "",
        gender: "Select Gender",
        roomType: "",
        roomNumber: "",
        numberOfGuests: 1,
      });
      setCheckInDate("");
      setCheckInTime("");
      setDuration("1");
      setCheckOutTime("");
      setHourlyAvailableRooms([]);
      setHourlyRateCalculation(null);

      onClose();
    } catch (error: any) {
      console.error("Error creating hourly booking:", error);
      alert(error.message || "Failed to create hourly booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessCheckIn = () => {
    if (activeOption === "booking") {
      if (!selectedBooking) {
        alert("Please select a booking first");
        return;
      }
      setShowIDScanner(true);
    } else if (activeOption === "walkin") {
      handleWalkInSubmit();
    } else if (activeOption === "hourly") {
      handleHourlySubmit();
    }
  };

  const searchCustomerByPhone = async (phone: string) => {
    if (!phone || phone.length < 8) {
      setFoundCustomer(null);
      return;
    }

    setIsSearchingCustomer(true);
    try {
      const customer = await findByPhone(phone);

      if (customer) {
        setFoundCustomer(customer);
        fillCustomerData(customer);
      } else {
        setFoundCustomer(null);
      }
    } catch (error) {
      console.error("Error searching customer by phone:", error);
      setFoundCustomer(null);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  /**
   * Tìm kiếm khách hàng theo email với debounce
   */
  const searchCustomerByEmail = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setFoundCustomer(null);
      return;
    }

    setIsSearchingCustomer(true);
    try {
      const customer = await findByEmail(email);
      if (customer) {
        setFoundCustomer(customer);
        fillCustomerData(customer);
      } else {
        setFoundCustomer(null);
      }
    } catch (error) {
      console.error("Error searching customer by email:", error);
      setFoundCustomer(null);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const fillCustomerData = (customer: Customer) => {
    const nameParts = customer.fullName?.split(" ") || [];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    let validGender: "Select Gender" | "MALE" | "FEMALE" = "Select Gender";
    if (customer.gender === "MALE" || customer.gender === "FEMALE") {
      validGender = customer.gender;
    }

    let formattedBirthDate = "";
    if (customer.birthDate) {
      try {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (datePattern.test(customer.birthDate)) {
          formattedBirthDate = customer.birthDate;
        } else {
          const date = new Date(customer.birthDate);
          if (!isNaN(date.getTime())) {
            formattedBirthDate = date.toISOString().split("T")[0];
          }
        }
      } catch (error) {
        console.error("Error formatting birthDate:", error);
      }
    }

    if (activeOption === "walkin") {
      setWalkInData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        birthDate: formattedBirthDate,
        gender: validGender,
      }));
    } else if (activeOption === "hourly") {
      setHourlyData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        birthDate: formattedBirthDate,
        gender: validGender,
      }));
    }
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;

    if (activeOption === "walkin") {
      setWalkInData((prev) => ({
        ...prev,
        phone,
      }));
    } else if (activeOption === "hourly") {
      setHourlyData((prev) => ({
        ...prev,
        phone,
      }));
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCustomerByPhone(phone);
    }, 800);
  };

  const calculateHourlyRateForBooking = async () => {
    if (!checkInDate || !checkInTime || !duration || !hourlyData.roomType) {
      setHourlyRateCalculation(null);
      return;
    }

    setIsCalculatingRate(true);
    try {
      const checkInDateTime = `${checkInDate}T${checkInTime}:00`;

      const calculation = await calculateHourlyRate({
        roomTypeId: hourlyData.roomType,
        hours: parseInt(duration),
        checkInDateTime: checkInDateTime,
      });

      setHourlyRateCalculation(calculation);
    } catch (error) {
      console.error("Error calculating hourly rate:", error);
      setHourlyRateCalculation(null);
      alert("Failed to calculate hourly rate. Please try again.");
    } finally {
      setIsCalculatingRate(false);
    }
  };

  const handleHourlyInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setHourlyData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "roomType") {
      setHourlyData((prev) => ({ ...prev, roomNumber: "" }));
      setHourlyAvailableRooms([]);
    }
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;

    if (activeOption === "walkin") {
      setWalkInData((prev) => ({
        ...prev,
        email,
      }));
    } else if (activeOption === "hourly") {
      setHourlyData((prev) => ({
        ...prev,
        email,
      }));
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCustomerByEmail(email);
    }, 800);
  };

  useEffect(() => {
    if (
      activeOption === "walkin" &&
      walkInData.checkInDate &&
      walkInData.checkOutDate &&
      selectedRoomType
    ) {
      loadAvailableRooms();
    }
  }, [walkInData.checkInDate, walkInData.checkOutDate, selectedRoomType]);

  useEffect(() => {
    if (checkInTime && duration) {
      calculateCheckOutTime();
      updateHourlyRate(parseInt(duration));
    }
  }, [checkInTime, duration]);

  const loadRoomTypes = async () => {
    try {
      const types = await getRoomTypes();
      setRoomTypes(types);
    } catch (error) {
      console.error("Error loading room types:", error);
      alert("Failed to load room types");
    }
  };

  const toLocalDateTime = (date: string) => {
    return new Date(date).toISOString().split(".")[0];
  };
  const loadAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      const checkIn = toLocalDateTime(walkInData.checkInDate);
      const checkOut = toLocalDateTime(walkInData.checkOutDate);

      const rooms = await getAvailableRooms(
        selectedRoomType,
        checkIn,
        checkOut
      );

      setAvailableRooms(rooms);

      if (rooms.length === 0) {
        alert("No rooms available for selected dates and room type");
      }
    } catch (error) {
      console.error("Error loading available rooms:", error);
      alert("Failed to load available rooms");
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const calculateCheckOutTime = () => {
    if (!checkInTime || !duration) return;

    const [hours, minutes] = checkInTime.split(":").map(Number);
    const checkInDate = new Date();
    checkInDate.setHours(hours, minutes, 0);

    const durationHours = parseInt(duration);
    checkInDate.setHours(checkInDate.getHours() + durationHours);

    const checkOutHours = checkInDate.getHours().toString().padStart(2, "0");
    const checkOutMinutes = checkInDate
      .getMinutes()
      .toString()
      .padStart(2, "0");
    setCheckOutTime(`${checkOutHours}:${checkOutMinutes}`);
  };

  const updateHourlyRate = (hours: number) => {
    const baseRate = 100;
    let percentage;

    switch (hours) {
      case 1:
        percentage = 15;
        break;
      case 2:
        percentage = 25;
        break;
      case 3:
        percentage = 35;
        break;
      case 4:
        percentage = 45;
        break;
      case 5:
        percentage = 55;
        break;
      case 6:
        percentage = 65;
        break;
      case 7:
        percentage = 75;
        break;
      case 8:
        percentage = 85;
        break;
      default:
        percentage = 100;
    }

    const rate = baseRate * (percentage / 100);
    setHourlyRate({ rate, percentage });
  };

  const validateWalkInForm = (): string | null => {
    if (!walkInData.firstName.trim()) return "First name is required";
    if (!walkInData.lastName.trim()) return "Last name is required";
    if (!walkInData.phone.trim()) return "Phone number is required";
    if (!walkInData.roomNumber) return "Please select a room";
    if (!walkInData.checkInDate) return "Check-in date is required";
    if (!walkInData.checkOutDate) return "Check-out date is required";
    if (walkInData.numberOfGuests < 1)
      return "Number of guests must be at least 1";

    const checkIn = new Date(walkInData.checkInDate);
    const checkOut = new Date(walkInData.checkOutDate);

    if (checkOut <= checkIn) {
      return "Check-out date must be after check-in date";
    }

    return null;
  };

  const handleWalkInSubmit = async () => {
    const validationError = validateWalkInForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const request: WalkInBookingRequest = {
        firstName: walkInData.firstName,
        lastName: walkInData.lastName,
        email: walkInData.email || undefined,
        phone: walkInData.phone,
        address: walkInData.address || undefined,
        birthDate: walkInData.birthDate || undefined,
        gender: walkInData.gender,
        roomNumber: walkInData.roomNumber,
        checkInDate: toLocalDateTime(walkInData.checkInDate),
        checkOutDate: toLocalDateTime(walkInData.checkOutDate),
        numberOfGuests: walkInData.numberOfGuests,
        specialRequests: walkInData.specialRequests || undefined,
        packageType: "STANDARD",
      };

      const booking = await WalkInService.createWalkInBooking(request);

      alert(
        `Walk-in booking created successfully!\nBooking ID: ${booking.bookingID}`
      );

      // Reset form
      setWalkInData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        birthDate: "",
        gender: "Select Gender",
        roomNumber: "",
        checkInDate: "",
        checkOutDate: "",
        numberOfGuests: 2,
        specialRequests: "",
      });
      setSelectedRoomType("");
      setAvailableRooms([]);

      onClose();
    } catch (error: any) {
      console.error("Error creating walk-in booking:", error);
      alert(error.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalkInInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "Gender" && value === "Select Gender") {
      alert("Vui lòng chọn Gender");
      return;
    }
    setWalkInData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoomTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomType(e.target.value);
    setWalkInData((prev) => ({ ...prev, roomNumber: "" }));
    setAvailableRooms([]);
  };

  //   const handleHourlyInputChange = (
  //     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  //   ) => {
  //     const { name, value } = e.target;
  //     setHourlyData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   };

  // Xử lý tìm booking
  const handleSearchBookings = async () => {
    if (!searchKeyword.trim()) {
      alert("Please enter a search keyword");
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchBookings(searchKeyword);
      setSearchResults(results);

      if (results.length === 0) {
        alert("Không tìm thấy booking");
      }
    } catch (error) {
      console.error("Error searching bookings:", error);
      alert("Failed to search bookings. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchBookings();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-50 text-amber-700";
      case "CONFIRMED":
        return "bg-green-50 text-green-700";
      case "CANCELLED":
        return "bg-red-50 text-red-700";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleIDScanComplete = (idInfo: IDCardInfo) => {
    console.log("Check-in completed with data:", {
      booking: selectedBooking,
      idCardInfo: idInfo,
    });

    alert("Check-in completed successfully!");
    setShowIDScanner(false);
    onClose();
  };

  const handleCloseIDScanner = () => {
    setShowIDScanner(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-[modalFadeIn_0.3s]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-[#EBE3D7] sticky top-0 bg-white z-10 flex justify-between items-center">
            <h2 className="text-2xl font-playfair font-semibold">
              Manual Check-in
            </h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>

          <div className="p-6">
            {/* Check-in Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Check-in Method</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  className={`flex items-center gap-2 px-4 py-3 border rounded-md ${
                    activeOption === "booking"
                      ? "border-[#CCBDA3] bg-[#CCBDA3]/10"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveOption("booking")}
                >
                  <FaCalendarCheck
                    className={
                      activeOption === "booking" ? "text-[#CCBDA3]" : ""
                    }
                  />
                  <span>Existing Booking</span>
                </button>

                <button
                  className={`flex items-center gap-2 px-4 py-3 border rounded-md ${
                    activeOption === "walkin"
                      ? "border-[#CCBDA3] bg-[#CCBDA3]/10"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveOption("walkin")}
                >
                  <FaWalking
                    className={
                      activeOption === "walkin" ? "text-[#CCBDA3]" : ""
                    }
                  />
                  <span>Walk-in Guest</span>
                </button>

                <button
                  className={`flex items-center gap-2 px-4 py-3 border rounded-md ${
                    activeOption === "hourly"
                      ? "border-[#CCBDA3] bg-[#CCBDA3]/10"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveOption("hourly")}
                >
                  <FaClock
                    className={
                      activeOption === "hourly" ? "text-[#CCBDA3]" : ""
                    }
                  />
                  <span>Hourly Booking</span>
                </button>
              </div>
            </div>

            {/* Existing Booking Section */}
            {activeOption === "booking" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Find Booking</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter booking ID, guest name or phone number"
                      className="flex-1 p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                    />
                    <button
                      onClick={handleSearchBookings}
                      disabled={isSearching}
                      className="px-4 py-2.5 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSearching ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Searching...
                        </>
                      ) : (
                        <>
                          <FaSearch />
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Search Results ({searchResults.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#F5F0EB] text-left">
                            <th className="py-3 px-4 font-semibold">
                              Booking ID
                            </th>
                            <th className="py-3 px-4 font-semibold">
                              Guest Name
                            </th>
                            <th className="py-3 px-4 font-semibold">Phone</th>
                            <th className="py-3 px-4 font-semibold">
                              Check-in Date
                            </th>
                            <th className="py-3 px-4 font-semibold">Room(s)</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                            <th className="py-3 px-4 font-semibold"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((booking) => (
                            <tr
                              key={booking.bookingID}
                              className={`border-b hover:bg-[#F5F0EB]/50 cursor-pointer transition ${
                                selectedBooking?.bookingID === booking.bookingID
                                  ? "bg-[#CCBDA3]/10"
                                  : ""
                              }`}
                            >
                              <td className="py-3 px-4 font-medium">
                                {booking.bookingID}
                              </td>
                              <td className="py-3 px-4">
                                {booking.customer.fullName}
                              </td>
                              <td className="py-3 px-4">
                                {booking.customer.phone}
                              </td>
                              <td className="py-3 px-4">
                                {formatDate(booking.checkInDate)}
                              </td>
                              <td className="py-3 px-4">
                                {Array.isArray(booking.bookingDetails) &&
                                booking.bookingDetails.length > 0
                                  ? booking.bookingDetails
                                      .map((detail) => detail?.room?.roomNumber)
                                      .filter(Boolean)
                                      .join(", ")
                                  : "-"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(
                                    booking.status
                                  )}`}
                                >
                                  {booking.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleSelectBooking(booking)}
                                  disabled={
                                    booking.status.toUpperCase() !== "PENDING"
                                  }
                                  className={`px-3 py-1 text-sm rounded-md transition ${
                                    selectedBooking?.bookingID ===
                                    booking.bookingID
                                      ? "bg-green-600 text-white"
                                      : booking.status.toUpperCase() ===
                                        "PENDING"
                                      ? "bg-[#CCBDA3] text-white hover:bg-[#b8ac94]"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  {selectedBooking?.bookingID ===
                                  booking.bookingID
                                    ? "Selected"
                                    : booking.status.toUpperCase() === "PENDING"
                                    ? "Select"
                                    : "Not Available"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {selectedBooking && (
                      <div className="mt-4 p-4 bg-[#F5F0EB] rounded-lg">
                        <h4 className="font-semibold mb-2">Booking Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Guest:</span>{" "}
                            <span className="font-medium">
                              {selectedBooking.customer.fullName}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email:</span>{" "}
                            <span className="font-medium">
                              {selectedBooking.customer.email}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Check-out:</span>{" "}
                            <span className="font-medium">
                              {formatDate(selectedBooking.checkOutDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Guests:</span>{" "}
                            <span className="font-medium">
                              {selectedBooking.numberOfGuests}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Package:</span>{" "}
                            <span className="font-medium">
                              {selectedBooking.packageType}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Amount:</span>{" "}
                            <span className="font-medium">
                              {selectedBooking.totalAmount.toLocaleString()} VND
                            </span>
                          </div>
                          {selectedBooking.specialRequests && (
                            <div className="col-span-2">
                              <span className="text-gray-600">
                                Special Requests:
                              </span>{" "}
                              <span className="font-medium">
                                {selectedBooking.specialRequests}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Walk-in Guest Form */}
            {activeOption === "walkin" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  New Walk-in Guest
                </h3>

                {/* Customer Found Indicator */}
                {foundCustomer && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-800 font-medium">
                      Existing customer found! Information auto-filled.
                    </span>
                  </div>
                )}

                {isSearchingCustomer && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span className="text-blue-800">
                      Searching for customer...
                    </span>
                  </div>
                )}

                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Guest Information */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium mb-1"
                    >
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={walkInData.phone}
                      onChange={handlePhoneInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      placeholder="Enter phone to search customer"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={walkInData.email}
                      onChange={handleEmailInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      placeholder="Enter email to search customer"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium mb-1"
                    >
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={walkInData.firstName}
                      onChange={handleWalkInInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium mb-1"
                    >
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={walkInData.lastName}
                      onChange={handleWalkInInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium mb-1"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={walkInData.gender}
                      onChange={handleWalkInInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    >
                      <option value="Select Gender">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="birthDate"
                      className="block text-sm font-medium mb-1"
                    >
                      Birth Date
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={walkInData.birthDate}
                      onChange={handleWalkInInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={walkInData.address}
                      onChange={handleWalkInInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  {/* Booking Dates */}
                  <div>
                    <label
                      htmlFor="checkInDate"
                      className="block text-sm font-medium mb-1"
                    >
                      Check-in Date*
                    </label>
                    <input
                      type="date"
                      id="checkInDate"
                      name="checkInDate"
                      required
                      value={walkInData.checkInDate}
                      onChange={handleWalkInInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkOutDate"
                      className="block text-sm font-medium mb-1"
                    >
                      Check-out Date*
                    </label>
                    <input
                      type="date"
                      id="checkOutDate"
                      name="checkOutDate"
                      required
                      value={walkInData.checkOutDate}
                      onChange={handleWalkInInputChange}
                      min={
                        walkInData.checkInDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  {/* Room Selection */}
                  <div>
                    <label
                      htmlFor="roomType"
                      className="block text-sm font-medium mb-1"
                    >
                      Room Type*
                    </label>
                    <select
                      id="roomType"
                      name="roomType"
                      required
                      value={selectedRoomType}
                      onChange={handleRoomTypeChange}
                      disabled={
                        !walkInData.checkInDate || !walkInData.checkOutDate
                      }
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3] disabled:bg-gray-100"
                    >
                      <option value="">
                        {!walkInData.checkInDate || !walkInData.checkOutDate
                          ? "Select dates first"
                          : "Select Room Type"}
                      </option>
                      {roomTypes.map((type) => (
                        <option key={type.roomTypeID} value={type.roomTypeID}>
                          {type.typeName} - {type.basePrice?.toLocaleString()}{" "}
                          VND/night
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="roomNumber"
                      className="block text-sm font-medium mb-1"
                    >
                      Available Rooms*
                    </label>
                    <select
                      id="roomNumber"
                      name="roomNumber"
                      required
                      value={walkInData.roomNumber}
                      onChange={handleWalkInInputChange}
                      disabled={!selectedRoomType || loadingRooms}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3] disabled:bg-gray-100"
                    >
                      <option value="">
                        {loadingRooms
                          ? "Loading rooms..."
                          : !selectedRoomType
                          ? "Select room type first"
                          : availableRooms.length === 0
                          ? "No rooms available"
                          : "Select Room"}
                      </option>
                      {availableRooms.map((room) => (
                        <option key={room.roomNumber} value={room.roomNumber}>
                          {room.roomNumber} - Floor {room.floor}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label
                      htmlFor="numberOfGuests"
                      className="block text-sm font-medium mb-1"
                    >
                      Number of Guests*
                    </label>
                    <input
                      type="number"
                      id="numberOfGuests"
                      name="numberOfGuests"
                      required
                      min="1"
                      max="10"
                      value={walkInData.numberOfGuests}
                      onChange={handleWalkInInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  {/* Special Requests */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="specialRequests"
                      className="block text-sm font-medium mb-1"
                    >
                      Special Requests
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      rows={3}
                      value={walkInData.specialRequests}
                      onChange={handleWalkInInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      placeholder="Any special requirements or preferences..."
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Hourly Booking Section */}
            {activeOption === "hourly" && (
              <div>
                {/* Customer Found Indicator */}
                {foundCustomer && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-800 font-medium">
                      Existing customer found! Information auto-filled.
                    </span>
                  </div>
                )}

                {isSearchingCustomer && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span className="text-blue-800">
                      Searching for customer...
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold mb-4">Hourly Booking</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Information */}
                  <div>
                    <label
                      htmlFor="hourlyPhone"
                      className="block text-sm font-medium mb-1"
                    >
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="hourlyPhone"
                      name="phone"
                      required
                      value={hourlyData.phone}
                      onChange={(e) => {
                        handleHourlyInputChange(e);
                        handlePhoneInputChange(e);
                      }}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      placeholder="Enter phone to search customer"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="hourlyEmail"
                      className="block text-sm font-medium mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="hourlyEmail"
                      name="email"
                      value={hourlyData.email}
                      onChange={(e) => {
                        handleHourlyInputChange(e);
                        handleEmailInputChange(e);
                      }}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      placeholder="Enter email to search customer"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="hourlyFirstName"
                      className="block text-sm font-medium mb-1"
                    >
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="hourlyFirstName"
                      name="firstName"
                      required
                      value={hourlyData.firstName}
                      onChange={handleHourlyInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="hourlyLastName"
                      className="block text-sm font-medium mb-1"
                    >
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="hourlyLastName"
                      name="lastName"
                      required
                      value={hourlyData.lastName}
                      onChange={handleHourlyInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="hourlyGender"
                      className="block text-sm font-medium mb-1"
                    >
                      Gender
                    </label>
                    <select
                      id="hourlyGender"
                      name="gender"
                      value={hourlyData.gender}
                      onChange={handleHourlyInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    >
                      <option value="Select Gender">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="hourlyBirthDate"
                      className="block text-sm font-medium mb-1"
                    >
                      Birth Date
                    </label>
                    <input
                      type="date"
                      id="hourlyBirthDate"
                      name="birthDate"
                      value={hourlyData.birthDate}
                      onChange={handleHourlyInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="hourlyAddress"
                      className="block text-sm font-medium mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="hourlyAddress"
                      name="address"
                      value={hourlyData.address}
                      onChange={handleHourlyInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  {/* Booking Date & Time */}
                  <div>
                    <label
                      htmlFor="checkInDate"
                      className="block text-sm font-medium mb-1"
                    >
                      Check-in Date*
                    </label>
                    <input
                      type="date"
                      id="checkInDate"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkInTime"
                      className="block text-sm font-medium mb-1"
                    >
                      Check-in Time*
                    </label>
                    <input
                      type="time"
                      id="checkInTime"
                      required
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="duration"
                      className="block text-sm font-medium mb-1"
                    >
                      Duration (hours)*
                    </label>
                    <select
                      id="duration"
                      required
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <option value="">Select Duration</option>
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                      <option value="5">5 hours</option>
                      <option value="6">6 hours</option>
                      <option value="7">7 hours</option>
                      <option value="8">8 hours</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="checkOutTime"
                      className="block text-sm font-medium mb-1"
                    >
                      Check-out Time (Auto)
                    </label>
                    <input
                      type="time"
                      id="checkOutTime"
                      disabled
                      className="w-full p-2.5 border border-[#EBE3D7] bg-gray-50 rounded-md"
                      value={checkOutTime}
                    />
                  </div>

                  {/* Room Selection */}
                  <div>
                    <label
                      htmlFor="hourlyRoomType"
                      className="block text-sm font-medium mb-1"
                    >
                      Room Type*
                    </label>
                    <select
                      id="hourlyRoomType"
                      name="roomType"
                      required
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                      value={hourlyData.roomType}
                      onChange={handleHourlyInputChange}
                      disabled={!checkInDate || !checkInTime || !duration}
                    >
                      <option value="">
                        {!checkInDate || !checkInTime || !duration
                          ? "Select date, time & duration first"
                          : "Select Room Type"}
                      </option>
                      {roomTypes.map((type) => (
                        <option key={type.roomTypeID} value={type.roomTypeID}>
                          {type.typeName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="hourlyRoomNumber"
                      className="block text-sm font-medium mb-1"
                    >
                      Available Rooms*
                    </label>
                    <select
                      id="hourlyRoomNumber"
                      name="roomNumber"
                      disabled={!hourlyData.roomType || loadingHourlyRooms}
                      value={hourlyData.roomNumber}
                      onChange={handleHourlyInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3] disabled:bg-gray-100"
                    >
                      <option value="">
                        {loadingHourlyRooms
                          ? "Loading rooms..."
                          : !hourlyData.roomType
                          ? "Select room type first"
                          : hourlyAvailableRooms.length === 0
                          ? "No rooms available"
                          : "Select Room"}
                      </option>
                      {hourlyAvailableRooms.map((room) => (
                        <option key={room.roomNumber} value={room.roomNumber}>
                          {room.roomNumber} - Floor {room.floor}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label
                      htmlFor="hourlyNumberOfGuests"
                      className="block text-sm font-medium mb-1"
                    >
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      id="hourlyNumberOfGuests"
                      name="numberOfGuests"
                      min="1"
                      max="10"
                      value={hourlyData.numberOfGuests}
                      onChange={handleHourlyInputChange}
                      className="w-full p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                    />
                  </div>

                  {/* Rate Calculation */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rate Calculation
                    </label>
                    <div className="p-4 bg-[#F5F0EB] rounded-md space-y-3">
                      {isCalculatingRate ? (
                        <div className="text-center text-gray-500 py-4">
                          <span className="animate-spin inline-block">⏳</span>
                          <p className="text-sm mt-2">Calculating rate...</p>
                        </div>
                      ) : hourlyRateCalculation ? (
                        <>
                          {/* Base Price */}
                          <div className="flex justify-between items-center pb-2 border-b border-[#EBE3D7]">
                            <span className="text-sm text-gray-600">
                              Base Price (per night):
                            </span>
                            <span className="font-semibold">
                              {hourlyRateCalculation.basePrice?.toLocaleString()}{" "}
                              VNĐ
                            </span>
                          </div>

                          {/* Duration */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Duration:
                            </span>
                            <span className="font-medium">
                              {hourlyRateCalculation.hours} hour(s)
                            </span>
                          </div>

                          {/* Base Percentage */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Hourly Rate:
                            </span>
                            <span className="font-medium text-[#CCBDA3]">
                              {hourlyRateCalculation.basePercentage}%
                            </span>
                          </div>

                          {/* Weekend Surcharge */}
                          {hourlyRateCalculation.isWeekend && (
                            <div className="flex justify-between items-center bg-amber-50 -mx-2 px-2 py-2 rounded">
                              <span className="text-sm text-amber-800 flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Weekend Surcharge:
                              </span>
                              <span className="font-medium text-amber-800">
                                +{hourlyRateCalculation.weekendSurcharge}%
                              </span>
                            </div>
                          )}

                          {/* Total Percentage */}
                          <div className="flex justify-between items-center pt-2 border-t border-[#EBE3D7]">
                            <span className="text-sm font-semibold text-gray-700">
                              Total Percentage:
                            </span>
                            <span className="font-semibold text-[#CCBDA3]">
                              {hourlyRateCalculation.totalPercentage}%
                            </span>
                          </div>

                          {/* Total Amount */}
                          <div className="flex justify-between items-center bg-[#CCBDA3]/10 -mx-2 px-2 py-3 rounded mt-2">
                            <span className="font-semibold text-gray-800">
                              Total Amount:
                            </span>
                            <span className="text-lg font-bold text-[#CCBDA3]">
                              {hourlyRateCalculation.totalAmount?.toLocaleString()}{" "}
                              VNĐ
                            </span>
                          </div>

                          {/* Breakdown Details */}
                          <details className="mt-3">
                            <summary className="text-sm text-gray-600 cursor-pointer hover:text-[#CCBDA3] transition">
                              View calculation breakdown
                            </summary>
                            <div className="mt-2 p-3 bg-white rounded border border-[#EBE3D7] text-xs space-y-1">
                              {hourlyRateCalculation.breakdown?.map(
                                (line, index) => (
                                  <p key={index} className="text-gray-600">
                                    {line}
                                  </p>
                                )
                              )}
                            </div>
                          </details>
                        </>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          <p className="text-sm">
                            Select room type, date, time and duration to see
                            pricing
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[#EBE3D7] bg-[#F5F0EB]/30 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-[#EBE3D7] rounded-md hover:bg-[#EBE3D7]/50 transition font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleProcessCheckIn}
              className="px-6 py-2.5 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Processing..."
                : isCalculatingRate
                ? "Calculating..."
                : activeOption === "walkin"
                ? "Create Booking"
                : activeOption === "hourly"
                ? "Create Hourly Booking"
                : "Process Check-in"}
            </button>
          </div>
        </div>
      </div>

      {/* ID Card Scanner Modal Component */}
      <IDScannerModal
        isOpen={showIDScanner}
        onClose={handleCloseIDScanner}
        onComplete={handleIDScanComplete}
        bookingID={selectedBooking?.bookingID}
        customerID={selectedBooking?.customer.id}
      />
    </>
  );
}

export default ManualCheckinModal;

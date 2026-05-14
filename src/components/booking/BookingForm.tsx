/* eslint-disable */
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";
import BookingCalendar from "../common/Calendar";
import HourlyBookingSelector from "./HourlyBookingSelector";
import { TfiUser, TfiMore } from "react-icons/tfi";
import { MdOutlineRoomService, MdRoomService } from "react-icons/md";
import { getAll } from "../../services/serviceService";
import { CiSquareQuestion } from "react-icons/ci";
import {
  saveBookingWithDetails,
  getBookingById,
  overlapBookingExists,
  checkRoomAvailability,
} from "../../services/bookingService";
import { getById } from "../../services/customerService";

import {
  getByCustomerIdAndStateTrue,
  saveCustomerVoucher,
} from "../../services/customerVoucherService";
import type { Customer } from "../../types/Customer";
import type { Service } from "../../types/Service";
import type { CustomerVoucher } from "../../types/CustomerVoucher";
import type { Room } from "../../types/Room";
import { getRoomById } from "../../services/roomService";
import { getCartBeanByCustomerId } from "../../services/cartBeanService";
import CustomerVoucherModal from "./CustomerVoucherModal";
import { RiHotelLine } from "react-icons/ri";
import { TbHotelService } from "react-icons/tb";
import { getAllPolicyBaseRates } from "../../services/HourlyRatePolicyService";
import type {
  HourlyRatePolicy,
  BaseRateItem,
} from "../../types/HourlyRatePolicy";
import { useToastContext } from "../../hooks/useToastContext";
import { calculateDiscountedPrice } from "../../services/roomTypeService";

interface BookingFormProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export type PaymentMethod =
  | "VNPAY_QR"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "CASH";

export type OrderStatus =
  | "PLACE"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

type BookingType = "DAILY" | "HOURLY";

const PAYMENT_METHODS: PaymentMethod[] = [
  "VNPAY_QR",
  "CREDIT_CARD",
  "BANK_TRANSFER",
  "CASH",
];

export default function BookingForm({
  currentStep,
  setCurrentStep,
}: BookingFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { error: showErrorToast } = useToastContext();

  // Get booking type from route state
  const bookingType: BookingType =
    (location.state as any)?.bookingType || "DAILY";

  // Daily booking states
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  // Hourly booking states
  const [hourlyCheckInDate, setHourlyCheckInDate] = useState<Date | null>(null);
  const [checkInTime, setCheckInTime] = useState<string>("14:00");
  const [duration, setDuration] = useState<number>(3);

  // Special requests text (was missing — required by booking payload)
  const [specialRequests, setSpecialRequests] = useState<string>("");

  // Services and vouchers state
  const [services, setServices] = useState<Service[]>([]);
  const [customerVouchers, setCustomerVouchers] = useState<CustomerVoucher[]>(
    [],
  );
  const [customer, setCustomer] = useState<Customer>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // selected services (ids) and per-service targets (roomNumbers array or 'ALL')
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedServiceTargets, setSelectedServiceTargets] = useState<
    Record<string, string[] | "ALL">
  >({}); // e.g. { serviceId: "ALL" } or { serviceId: ["101","102"] }

  // Thêm state cho số lượng dịch vụ
  const [serviceQuantities, setServiceQuantities] = useState<
    Record<string, number>
  >({});

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string[]>([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<CustomerVoucher[]>([]);

  // Lưu danh sách policies từ DB, dùng lấy baseRates, weekendSurcharge, weekkendDays
  const [hourlyRatePolicies, setHourlyRatePolicies] = useState<
    HourlyRatePolicy[]
  >([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  // State để lưu các giá trị đã tính toán
  const [roomCosts, setRoomCosts] = useState<number>(0);
  const [serviceCosts, setServiceCosts] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [roomPrices, setRoomPrices] = useState<Record<string, number>>({});

  const fetchedData = async () => {
    try {
      setLoading(true);

      const service = await getAll();
      setServices(service);

      // Fetch hourlyRate policies
      if (bookingType === "HOURLY") {
        try {
          const policies = await getAllPolicyBaseRates();
          setHourlyRatePolicies(policies);
          console.log("Hourly rate policies loaded:", policies);
        } catch (error) {
          console.error("Failed to fetch hourly rate policies:", error);
        }
      }

      const userDataStr = localStorage.getItem("user");
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const customerId = userData?.data?.id || userData?.id;

      const selectedFromCart = (location.state as any)?.selectedRooms;
      let roomsToUse: string[] = [];

      if (
        selectedFromCart &&
        Array.isArray(selectedFromCart) &&
        selectedFromCart.length > 0
      ) {
        roomsToUse = selectedFromCart;
        console.log("Using selected rooms from cart:", roomsToUse);
      } else if (customerId) {
        // Fetch all cart items from CartBean API
        try {
          const cart = await getCartBeanByCustomerId(customerId);
          if (cart?.items && cart.items.length > 0) {
            roomsToUse = cart.items
              .map((room) => room.roomNumber)
              .filter((num): num is string => num !== undefined);
          }
          console.log("Using all cart items:", roomsToUse);
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        }
      }

      // Update selected room state
      setSelectedRoom(roomsToUse);

      const roomPromises = roomsToUse.map((roomId) => getRoomById(roomId));
      const roomsData = await Promise.all(roomPromises);
      setRooms(roomsData);

      // Fetch booked dates for all selected rooms (for daily booking calendar)
      if (roomsToUse.length > 0) {
        try {
          const bookedDatesPromises = roomsToUse.map((roomId) =>
            overlapBookingExists(roomId),
          );
          const bookedDatesArrays = await Promise.all(bookedDatesPromises);

          // Flatten and convert to Date objects
          const allBookedDates = bookedDatesArrays
            .flat()
            .map((dateStr: any) => new Date(dateStr));

          setBookedDates(allBookedDates);
          console.log("Booked dates:", allBookedDates);
        } catch (error) {
          console.error("Failed to fetch booked dates:", error);
        }
      }

      if (customerId) {
        const customerData = await getById(customerId);
        setCustomer(customerData);

        const custVoucher = await getByCustomerIdAndStateTrue(customerId);
        setCustomerVouchers(custVoucher);
      } else {
        setError("User not logged in. Please log in to continue.");
      }

      setLoading(false);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data: " + err);
    } finally {
      setLoading(false);
    }
  };

  const [booking] = useState({
    bookingID: "",
    checkInDate: checkInDate ? checkInDate.toISOString() : "",
    checkOutDate: checkOutDate ? checkOutDate.toISOString() : "",
    numberOfGuests: 0,
    status: "PENDING",
    specialRequests: specialRequests || "",
    bookingDate: new Date().toISOString(),
    cancellationDate: null,
    hourlyRate: null,
    duration: 0,
    packageType: "Standard",
    totalAmount: 0,
    paymentStatus: "",
    invoiceType: "ROOM_BOOKING",
    totalCost: 0,
    customer: customer || null,
    employee: null,
  });

  useEffect(() => {
    fetchedData();
  }, []);

  // Effect để tính toán lại giá khi có thay đổi
  useEffect(() => {
    const updateCosts = async () => {
      const roomCost = await calculateRoomCosts();
      const serviceCost = calculateServiceCosts();
      const sub = await calculateSubTotal();
      const disc = await calculateDiscount();
      const total = await calculatedTotalAmount();

      setRoomCosts(roomCost);
      setServiceCosts(serviceCost);
      setSubTotal(sub);
      setDiscount(disc);
      setTotalAmount(total);

      // Tính giá từng phòng
      const prices: Record<string, number> = {};
      for (const room of rooms) {
        const roomTypeId = room.roomType?.roomTypeID;
        if (roomTypeId) {
          const price = await calculateRoomPriceAfterApplyPromotion(roomTypeId);
          prices[room.roomNumber!] = price;
        }
      }
      setRoomPrices(prices);
    };

    if (rooms.length > 0) {
      updateCosts();
    }
  }, [
    rooms,
    selectedServices,
    selectedVoucher,
    checkInDate,
    checkOutDate,
    hourlyCheckInDate,
    duration,
    bookingType,
  ]);

  const handleNextStep = () => {
    if (bookingType === "HOURLY") {
      // Validation for hourly booking
      if (!hourlyCheckInDate) {
        showErrorToast("Please select a check-in date.");
        return;
      }
      if (!checkInTime) {
        showErrorToast("Please select a check-in time.");
        return;
      }
      if (duration < 1) {
        showErrorToast("Minimum duration is 1 hour.");
        return;
      }
    } else {
      // Check-in validation
      if (!checkInDate) {
        showErrorToast("Please select a valid check-in date.");
        return;
      }

      // Check-out validation
      if (!checkOutDate || checkOutDate < checkInDate) {
        showErrorToast("Please select a valid check-out date.");
        return;
      }

      const ci = new Date(checkInDate);
      ci.setHours(0, 0, 0, 0);
      const co = new Date(checkOutDate);
      co.setHours(0, 0, 0, 0);

      if (currentStep === 1) {
        // Kiểm tra chồng lấn với các ngày đã được đặt
        if (isDateRangeOverlapping(ci, co, bookedDates)) {
          showErrorToast(
            "The selected date range overlaps with already booked dates. Please choose different dates.",
          );
          return;
        } else {
          setError("");
        }
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Kiểm tra xem khoảng thời gian checkin-checkout có chồng lấn với ngày đã đặt
  const isDateRangeOverlapping = (
    checkIn: Date,
    checkOut: Date,
    bookedDates: Date[],
  ): boolean => {
    // Set giờ của ngày về 00:00:00 để so sánh chính xác
    const normalizeDate = (date: Date) => {
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };

    const ciNormalized = normalizeDate(checkIn);
    const coNormalized = normalizeDate(checkOut);

    return bookedDates.some((bookedDate) => {
      const bookedNormalized = normalizeDate(bookedDate);
      return (
        bookedNormalized >= ciNormalized && bookedNormalized < coNormalized
      );
    });
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) => {
      const exists = prev.includes(serviceId);
      if (exists) {
        // remove service and its targets
        setSelectedServiceTargets((t) => {
          const copy = { ...t };
          delete copy[serviceId];
          return copy;
        });
        // remove quantity
        setServiceQuantities((q) => {
          const copy = { ...q };
          delete copy[serviceId];
          return copy;
        });
        return prev.filter((id) => id !== serviceId);
      } else {
        // add service and default to ALL rooms
        setSelectedServiceTargets((t) => ({
          ...t,
          [serviceId]: rooms.length <= 1 ? "ALL" : "ALL",
        }));
        // set default quantity to 1
        setServiceQuantities((q) => ({
          ...q,
          [serviceId]: 1,
        }));
        return [...prev, serviceId];
      }
    });
  };

  // Hàm cập nhật số lượng dịch vụ
  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    if (quantity > 99) quantity = 99;
    setServiceQuantities((prev) => ({
      ...prev,
      [serviceId]: quantity,
    }));
  };

  // Hàm tăng số lượng
  const incrementQuantity = (serviceId: string) => {
    const current = serviceQuantities[serviceId] || 1;
    updateServiceQuantity(serviceId, current + 1);
  };

  // Hàm giảm số lượng
  const decrementQuantity = (serviceId: string) => {
    const current = serviceQuantities[serviceId] || 1;
    updateServiceQuantity(serviceId, current - 1);
  };

  // Return selected Service objects from services array
  const getSelectedServiceObjects = (): Service[] =>
    services.filter((s) => selectedServices.includes(s.serviceID));

  // toggle a specific room target for a given service
  const toggleServiceTarget = (serviceId: string, roomNumber: string) => {
    setSelectedServiceTargets((prev) => {
      const cur = prev[serviceId];
      // if currently ALL, replace with single selected room
      if (cur === "ALL" || !cur) {
        return { ...prev, [serviceId]: [roomNumber] };
      }
      const arr = Array.isArray(cur) ? [...cur] : [];
      if (arr.includes(roomNumber)) {
        const next = arr.filter((r) => r !== roomNumber);
        return { ...prev, [serviceId]: next.length ? next : "ALL" };
      } else {
        return { ...prev, [serviceId]: [...arr, roomNumber] };
      }
    });
  };

  const setServiceApplyAll = (serviceId: string, applyAll: boolean) => {
    setSelectedServiceTargets((prev) => ({
      ...prev,
      [serviceId]: applyAll ? "ALL" : rooms.map((r) => r.roomNumber),
    }));
  };

  // Tính tổng chi phí dịch vụ - cập nhật để tính theo số lượng
  const calculateServiceCosts = () => {
    return getSelectedServiceObjects().reduce((sum, service) => {
      const targets = selectedServiceTargets[service.serviceID];
      const quantity = serviceQuantities[service.serviceID] || 1;
      let factor = 1;
      if (!targets || targets === "ALL") {
        factor = rooms.length || 1;
      } else if (Array.isArray(targets)) {
        factor = targets.length || 1;
      }
      return sum + service.price * factor * quantity;
    }, 0);
  };

  /**
   * Tính phần trăm giá theo giờ dựa trên HourlyRatePolicy
   *
   * CÔNG THỨC:
   * 1. Lấy phần trăm cơ bản từ baseRates theo duration
   * 2. Áp dụng phụ phí cuối tuần: +X% (từ weekendSurcharge)
   * 3. Trả về tổng phần trăm (base % + weekend %)
   *
   * @param duration Số giờ đặt
   * @param checkInDate Ngày và giờ check-in
   * @returns Phần trăm giá theo giờ (%) đã tính phụ phí
   */
  const calculateHourlyRate = (
    duration: number,
    checkInDate: Date | null,
  ): number => {
    // Fallback nếu chưa có policy
    if (!checkInDate || hourlyRatePolicies.length === 0) {
      return 100;
    }

    const policy = hourlyRatePolicies[0]; // Lấy policy đầu tiên

    // Lấy phần trăm cơ bản từ baseRates
    let ratePercentage = 100; // default 100% nếu không tìm thấy

    if (policy.baseRates) {
      // Kiểm tra nếu baseRates là object (Map)
      if (
        typeof policy.baseRates === "object" &&
        !Array.isArray(policy.baseRates)
      ) {
        const baseRatesMap = policy.baseRates as Record<string, number>;

        // Lấy rate trực tiếp từ map theo duration
        // VD: duration = 2 => baseRatesMap["2"] = 25
        let rate = baseRatesMap[duration.toString()];

        // Nếu không tìm thấy (VD: 12h không có trong map), lấy rate cao nhất (9h = 100%)
        if (rate === undefined) {
          // Tìm duration cao nhất trong map
          const maxDuration = Math.max(
            ...Object.keys(baseRatesMap).map((k) => parseInt(k)),
          );
          rate = baseRatesMap[maxDuration.toString()];
          console.log(
            `Duration ${duration}h not found, using max rate (${maxDuration}h): ${rate}%`,
          );
        }

        if (rate !== undefined) {
          ratePercentage = rate;
          console.log(`Base rate for ${duration}h: ${ratePercentage}%`);
        } else {
          console.warn(
            `No base rate found for ${duration}h, using default 100%`,
          );
        }
      }
      // Fallback: nếu là array (cho tương thích)
      else if (Array.isArray(policy.baseRates)) {
        const rates = policy.baseRates as BaseRateItem[];
        const sortedRates = [...rates].sort(
          (a, b) => b.baseHours - a.baseHours,
        );
        const matchedRate = sortedRates.find((r) => duration >= r.baseHours);

        if (matchedRate) {
          ratePercentage = matchedRate.baseRate;
          console.log(`Base rate for ${duration}h: ${ratePercentage}%`);
        }
      }
    }

    // Áp dụng phụ cuối tuần
    const dayOfWeek = checkInDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend && policy.weekendSurcharge) {
      const beforeSurcharge = ratePercentage;
      ratePercentage += policy.weekendSurcharge; // Cộng thêm weekend surcharge %
      console.log(
        `Weekend surcharge: ${beforeSurcharge}% → ${ratePercentage}% (+${policy.weekendSurcharge}%)`,
      );
    }

    console.log(`Final hourly rate percentage: ${ratePercentage}%`);

    return ratePercentage;
  };

  // Tính tổng chi phí phòng
  const calculateRoomCosts = async () => {
    // HOURLY
    if (bookingType === "HOURLY") {
      return await rooms.reduce(async (sumPromise, room) => {
        const sum = await sumPromise;

        const basePrice = room.roomType?.basePrice || 0;
        const ratePercentage = calculateHourlyRate(duration, hourlyCheckInDate);

        const roomTypeId = room.roomType?.roomTypeID;
        if (!roomTypeId) return sum;

        const price = await calculateRoomPriceAfterApplyPromotion(roomTypeId);

        const totalPrice = (price * ratePercentage) / 100;

        console.log(
          `Room ${
            room.roomNumber
          }: ${basePrice} × ${ratePercentage}% = ${totalPrice.toFixed(0)} VND`,
        );

        return sum + totalPrice;
      }, Promise.resolve(0));
    } else {
      // DAILY
      return await rooms.reduce(async (sumPromise, room) => {
        const sum = await sumPromise;

        const roomTypeId = room.roomType?.roomTypeID;
        if (!roomTypeId) return sum;

        const price =
          (await calculateRoomPriceAfterApplyPromotion(roomTypeId)) || 0;
        console.log("Price: " + price);

        return sum + price;
      }, Promise.resolve(0));
    }
  };

  //Lấy giá phòng sau khi áp dụng khuyến mãi
  const calculateRoomPriceAfterApplyPromotion = async (roomTypeId: string) => {
    const today = new Date().toISOString().split("T")[0];

    return await calculateDiscountedPrice(roomTypeId, today);
  };

  const handleSaveBooking = async () => {
    setError("");

    let ci: Date;
    let co: Date;

    // Validation based on booking type
    if (bookingType === "DAILY") {
      if (!checkInDate) {
        setError("Please select a check-in date.");
        return;
      }
      if (!checkOutDate) {
        setError("Please select a check-out date.");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      ci = new Date(checkInDate);
      ci.setHours(0, 0, 0, 0);
      co = new Date(checkOutDate);
      co.setHours(0, 0, 0, 0);

      if (ci < today) {
        setError("Check-in cannot be before today.");
        return;
      }
      if (co <= ci) {
        setError("Check-out must be after check-in.");
        return;
      }

      // Kiểm tra chồng lấn với các ngày đã được đặt (chỉ cho daily booking)
      if (isDateRangeOverlapping(ci, co, bookedDates)) {
        setError(
          "The selected date range overlaps with already booked dates. Please choose different dates.",
        );
        return;
      }
    } else {
      // Hourly booking validation
      if (!hourlyCheckInDate) {
        setError("Please select a check-in date.");
        return;
      }
      if (!checkInTime) {
        setError("Please select a check-in time.");
        return;
      }
      if (duration < 1) {
        setError("Minimum duration is 1 hour.");
        return;
      }

      const [hours, minutes] = checkInTime.split(":").map(Number);
      ci = new Date(hourlyCheckInDate);
      ci.setHours(hours, minutes, 0, 0);
      co = new Date(ci.getTime() + duration * 60 * 60 * 1000);

      // Check if booking time is in the past
      const now = new Date();
      if (ci <= now) {
        showErrorToast("Check-in time must be in the future.");
        return;
      }

      // Check room availability for hourly bookings
      try {
        setLoading(true);
        for (const room of rooms) {
          const conflicts = await checkRoomAvailability(
            room.roomNumber || "",
            ci.toISOString(),
            co.toISOString(),
          );

          if (conflicts && conflicts.length > 0) {
            const conflictDetails = conflicts
              .map((b) => {
                const checkIn = new Date(b.checkInDate);
                const checkOut = new Date(b.checkOutDate);
                return `${checkIn.toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${checkOut.toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;
              })
              .join("; ");

            showErrorToast(
              `Room ${room.roomNumber} is already booked during this time. Conflicting bookings: ${conflictDetails}`,
            );
            setLoading(false);
            return;
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error checking room availability:", err);
        showErrorToast("Cannot check room availability. Please try again.");
        setLoading(false);
        return;
      }
    }

    let checkInWithTime = new Date(checkInDate);
    checkInWithTime.setHours(14, 0, 0, 0);

    let checkOutWithTime = new Date(checkOutDate);
    checkOutWithTime.setHours(12, 0, 0, 0);

    const formatLocalDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    // Daily booking
    if (bookingType === "DAILY") {
      checkInWithTime = new Date(checkInDate!);
      checkInWithTime.setHours(14, 0, 0, 0);

      checkOutWithTime = new Date(checkOutDate!);
      checkOutWithTime.setHours(12, 0, 0, 0);
    } else {
      // Hourly booking
      const [hours, minutes] = checkInTime.split(":").map(Number);
      checkInWithTime = new Date(hourlyCheckInDate!);
      checkInWithTime.setHours(hours, minutes, 0, 0);

      checkOutWithTime = new Date(
        checkInWithTime.getTime() + duration * 60 * 60 * 1000,
      );
    }

    // Tính hourlyRate (%) cho booking
    let calculatedHourlyRate = 0;
    if (bookingType === "HOURLY") {
      calculatedHourlyRate = calculateHourlyRate(duration, hourlyCheckInDate);
      console.log(
        `Calculated hourly rate: ${calculatedHourlyRate}% for ${duration} hours`,
      );
    }

    const payload: any = {
      checkInDate: formatLocalDateTime(checkInWithTime),
      checkOutDate: formatLocalDateTime(checkOutWithTime),
      numberOfGuests: booking.numberOfGuests || 1,
      status: "WAITING",
      specialRequests: specialRequests,
      bookingDate: formatLocalDateTime(new Date()),
      packageType: booking.packageType || "Standard",
      totalAmount: await calculatedTotalAmount(),
      invoiceType: "ROOM_BOOKING",
      paymentStatus: "PENDING",
      type: bookingType,
      duration: bookingType === "HOURLY" ? duration : 0,
      hourlyRate: bookingType === "HOURLY" ? calculatedHourlyRate : null,
      customerID: customer?.id || null,
      totalCost: await calculateServiceCosts(),
    };

    const bookingDetails = rooms.map((r: Room) => ({
      roomNumber: r.roomNumber,
      roomPrice: r.roomType?.basePrice || 0,
      review: null,
    }));

    // Dựa trên selectedServices và selectedServiceTargets để tạo bookingServices với thông tin phòng áp dụng
    const bookingServicesWithRooms: any[] = [];
    getSelectedServiceObjects().forEach((s: Service) => {
      const targets = selectedServiceTargets[s.serviceID];
      const quantity = serviceQuantities[s.serviceID] || 1;

      const roomCount =
        !targets || targets === "ALL"
          ? rooms.length || 1
          : Array.isArray(targets)
            ? targets.length || 1
            : 1;

      bookingServicesWithRooms.push({
        serviceId: s.serviceID,
        servicePrice: s.price,
        quantity: quantity * roomCount,
        totalAmount: s.price * quantity * roomCount,
        orderStatus: "PLACE",
        paymentMethod: selectedPaymentMethod,
      });
    });

    console.log("Booking payload:", payload);
    console.log("Booking details: ", bookingDetails);
    console.log("Booking services: ", bookingServicesWithRooms);

    try {
      setLoading(true);
      const savedBooking = await saveBookingWithDetails(
        payload,
        bookingDetails,
        bookingServicesWithRooms,
      );

      if (!savedBooking?.bookingID) {
        throw new Error("Failed to save booking");
      }

      for (const cv of selectedVoucher) {
        cv.state = false;
        await saveCustomerVoucher(cv);
      }

      const bookingToPass = {
        ...payload,
        ...(savedBooking || {}),
        bookingID: savedBooking.bookingID,
        customer: savedBooking?.customer || customer,
      };

      navigate("/customer/payment", {
        state: {
          booking: bookingToPass,
        },
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to save booking: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Tính toán số ngày đặt phòng dựa trên checkin - checkout
  const calculateNights = () => {
    if (bookingType === "HOURLY") return 1;
    if (!checkInDate || !checkOutDate) return 1;
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  //Tính tổng tiền trước giảm giá (rooms + services)
  const calculateSubTotal = async () => {
    const numberOfNights = calculateNights();
    const roomCost = await calculateRoomCosts();

    const totalRoomCosts = roomCost * numberOfNights;

    // Không cần dòng này nữa vì đã có state discount
    // const discountValue = calculateDiscount();roomCost * numberOfNights;

    const totalServiceCosts = calculateServiceCosts();

    const subtotal = totalRoomCosts + totalServiceCosts;

    return subtotal;
  };

  // Tính tổng tiền giảm giá từ vouchers
  const calculateDiscount = async () => {
    const subtotal = await calculateSubTotal();

    if (!selectedVoucher || selectedVoucher.length === 0) return 0;
    let discount = 0;

    selectedVoucher.forEach((v) => {
      const voucher = v.voucher;
      const discountType = voucher.discountType;

      if (discountType === "PERCENT") {
        discount = discount + (subtotal * voucher.discountPercentage) / 100;
      } else {
        discount = discount + (voucher.discountValue || 0);
      }
    });

    return discount;
  };

  const discountValue = calculateDiscount();

  const calculatedTotalAmount = async () => {
    let totalAmount = (await calculateSubTotal()) - (await calculateDiscount());
    if (totalAmount <= 0) {
      totalAmount = 0;
    }
    return totalAmount;
  };

  if (currentStep === 1) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {bookingType === "DAILY" ? (
          <div className="grid grid-cols-3 gap-8">
            {/* Check-in Calendar */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Check in time
                </label>
                <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar size={20} className="text-gray-600" />
                  <input
                    type="text"
                    value={
                      checkInDate ? checkInDate.toLocaleDateString("en-GB") : ""
                    }
                    readOnly
                    className="flex-1 bg-transparent text-gray-900 font-medium focus:outline-none"
                  />
                </div>
                <BookingCalendar
                  selectedDate={checkInDate}
                  onDateSelect={setCheckInDate}
                  minDate={new Date()}
                  excludedDates={bookedDates}
                />
              </div>
            </div>

            {/* Check-out Calendar */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Check out time
                </label>
                <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar size={20} className="text-gray-600" />
                  <input
                    type="text"
                    value={
                      checkOutDate
                        ? checkOutDate.toLocaleDateString("en-GB")
                        : ""
                    }
                    readOnly
                    className="flex-1 bg-transparent text-gray-900 font-medium focus:outline-none"
                  />
                </div>
                <BookingCalendar
                  selectedDate={checkOutDate}
                  onDateSelect={setCheckOutDate}
                  minDate={
                    checkInDate
                      ? new Date(checkInDate.getTime() + 86400000)
                      : new Date()
                  }
                  excludedDates={bookedDates}
                />
              </div>
            </div>

            {/* Customer Information */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                  <span className="text-lg">
                    <TfiUser className="text-white" />
                  </span>
                  <h3 className="font-semibold">Customer information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={customer?.fullName || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9b8a8] bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={customer?.phone || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9b8a8] bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={customer?.email || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9b8a8] bg-gray-50"
                    />
                  </div>

                  {/* <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mt-6 flex items-center gap-2">
                    <span className="text-lg">
                      <TfiMore className="text-white" />
                    </span>
                    <h3 className="font-semibold">Other</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Promotion code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your promotion code (optional)"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9b8a8]"
                    />
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Hourly Booking Layout */
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <HourlyBookingSelector
                checkInDate={hourlyCheckInDate}
                onCheckInDateSelect={setHourlyCheckInDate}
                checkInTime={checkInTime}
                onCheckInTimeChange={setCheckInTime}
                duration={duration}
                onDurationChange={setDuration}
                selectedRooms={selectedRoom}
              />
            </div>

            {/* Customer Information */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                  <span className="text-lg">
                    <TfiMore className="text-white" />
                  </span>
                  <h3 className="font-semibold">Other</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customer?.fullName || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customer?.phone || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customer?.email || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Step Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleNextStep}
            className="px-8 py-3 bg-[#c9b8a8] text-white font-semibold rounded-lg hover:bg-[#b8a896] transition"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  } else if (currentStep === 2) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Services List */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <span className="text-lg">
                  <MdOutlineRoomService className="text-white" />
                </span>
                <h3 className="font-semibold">Services</h3>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">Loading services...</div>
                </div>
              ) : services.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">No services available</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index}>
                      {/* Service Item */}
                      <div
                        className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg transition cursor-pointer ${
                          selectedServices.includes(service.serviceID)
                            ? "bg-gray-50 border-[#c9b8a8]"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleService(service.serviceID)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.serviceID)}
                          onChange={() => toggleService(service.serviceID)}
                          className="w-5 h-5 cursor-pointer accent-[#c9b8a8]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {service.serviceName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {service.serviceHours}
                          </p>
                          <p className="text-sm text-gray-600">
                            {service.price.toLocaleString()}đ
                          </p>
                        </div>
                      </div>

                      {/* Quantity Selector và Room Target (shown when service is selected) */}
                      {selectedServices.includes(service.serviceID) && (
                        <div
                          className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Quantity Selector */}
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                            <label className="text-sm font-medium text-gray-700">
                              Quantity:
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  decrementQuantity(service.serviceID)
                                }
                                disabled={
                                  (serviceQuantities[service.serviceID] || 1) <=
                                  1
                                }
                                className={`w-8 h-8 flex items-center justify-center rounded-full border transition ${
                                  (serviceQuantities[service.serviceID] || 1) <=
                                  1
                                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                    : "border-[#c9b8a8] text-[#c9b8a8] hover:bg-[#c9b8a8] hover:text-white"
                                }`}
                              >
                                <span className="text-lg font-bold">−</span>
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={
                                  serviceQuantities[service.serviceID] || 1
                                }
                                onChange={(e) =>
                                  updateServiceQuantity(
                                    service.serviceID,
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                className="w-16 text-center px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9b8a8]"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  incrementQuantity(service.serviceID)
                                }
                                disabled={
                                  (serviceQuantities[service.serviceID] || 1) >=
                                  99
                                }
                                className={`w-8 h-8 flex items-center justify-center rounded-full border transition ${
                                  (serviceQuantities[service.serviceID] || 1) >=
                                  99
                                    ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                    : "border-[#c9b8a8] text-[#c9b8a8] hover:bg-[#c9b8a8] hover:text-white"
                                }`}
                              >
                                <span className="text-lg font-bold">+</span>
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-[#c9b8a8]">
                              {(
                                service.price *
                                (serviceQuantities[service.serviceID] || 1)
                              ).toLocaleString()}
                              đ
                            </span>
                          </div>

                          {/* Room Target Selector */}
                          <div className="flex items-center gap-3 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  selectedServiceTargets[service.serviceID] ===
                                    "ALL" ||
                                  !selectedServiceTargets[service.serviceID]
                                }
                                onChange={(e) =>
                                  setServiceApplyAll(
                                    service.serviceID,
                                    e.target.checked,
                                  )
                                }
                              />
                              <span className="text-sm font-medium">
                                Apply to all selected rooms
                              </span>
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {rooms.map((room) => {
                              const roomNumber = room.roomNumber;
                              const targets =
                                selectedServiceTargets[service.serviceID];
                              const checked =
                                targets === "ALL"
                                  ? false
                                  : Array.isArray(targets) &&
                                    targets.includes(roomNumber);
                              const disabled = targets === "ALL";
                              return (
                                <label
                                  key={roomNumber}
                                  className={`flex items-center gap-2 cursor-pointer p-2 rounded ${
                                    disabled
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-gray-100"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() =>
                                      toggleServiceTarget(
                                        service.serviceID,
                                        roomNumber,
                                      )
                                    }
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm">{roomNumber}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Services */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-8">
              <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <span className="text-lg">
                  <MdRoomService className="text-white" />
                </span>
                <h3 className="font-semibold">Selected Services</h3>
              </div>

              <div className="space-y-3">
                {getSelectedServiceObjects().length > 0 ? (
                  <>
                    {getSelectedServiceObjects().map((service) => {
                      const quantity =
                        serviceQuantities[service.serviceID] || 1;
                      const targets = selectedServiceTargets[service.serviceID];
                      const roomCount =
                        !targets || targets === "ALL"
                          ? rooms.length
                          : Array.isArray(targets)
                            ? targets.length
                            : 1;
                      const totalPrice = service.price * quantity * roomCount;

                      return (
                        <div
                          key={service.serviceID}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {service.serviceName}
                            </span>
                            <button
                              onClick={() => toggleService(service.serviceID)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                            <span>
                              x{quantity} • {roomCount} room
                              {roomCount > 1 ? "s" : ""}
                            </span>
                            <span className="font-semibold text-[#c9b8a8]">
                              {totalPrice.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Total Service Cost */}
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          Total Services:
                        </span>
                        <span className="text-sm font-bold text-[#c9b8a8]">
                          {calculateServiceCosts().toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No services selected
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousStep}
            className="px-8 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            onClick={handleNextStep}
            className="px-8 py-3 bg-[#c9b8a8] text-white font-semibold rounded-lg hover:bg-[#b8a896] transition"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  } else if (currentStep === 3) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="text-lg">
              <CiSquareQuestion className="text-white" />
            </span>
            <h3 className="font-semibold">Special Requests</h3>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your special requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9b8a8]"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePreviousStep}
              className="px-8 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleNextStep}
              className="px-8 py-3 bg-[#c9b8a8] text-white font-semibold rounded-lg hover:bg-[#b8a896] transition"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    );
  } else if (currentStep === 4) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="text-lg">
              <TfiUser className="text-white" />
            </span>
            <h3 className="font-semibold text-md">Customer information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Customer Name
              </label>
              <p className="text-gray-900 font-medium">
                {customer?.fullName || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Phone Number
              </label>
              <p className="text-gray-900 font-medium">
                {customer?.phone || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Email
              </label>
              <p className="text-gray-900 font-medium">
                {customer?.email || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Room Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="text-lg">
              <RiHotelLine className="text-white" />
            </span>
            <h3 className="font-semibold">Room Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-3">
                Room Number:
              </label>
              <div className="space-y-2">
                {rooms.map((room, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-200"
                  >
                    <span className="text-gray-900 font-medium">
                      {room.roomNumber}
                    </span>
                    <span className="text-[#c9b8a8] font-semibold">
                      {(() => {
                        const roomPrice = roomPrices[room.roomNumber!] || 0;
                        const basePrice = room.roomType?.basePrice || 0;
                        return (
                          <>
                            {basePrice > roomPrice && (
                              <span className="line-through text-gray-500 mr-2">
                                {basePrice.toLocaleString()} VND
                              </span>
                            )}
                            {roomPrice.toLocaleString()} VND /night
                          </>
                        );
                      })()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {bookingType === "DAILY" ? (
              <>
                <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-4">
                  <label className="text-sm font-semibold text-gray-600">
                    Checkin Date:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {checkInDate?.toLocaleDateString("en-GB")} at 14:00
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Checkout Date:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {checkOutDate?.toLocaleDateString("en-GB")} at 12:00
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Number of Nights:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {calculateNights()}{" "}
                    {calculateNights() === 1 ? "night" : "nights"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-4">
                  <label className="text-sm font-semibold text-gray-600">
                    Checkin Date & Time:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {hourlyCheckInDate?.toLocaleDateString("en-GB")} at{" "}
                    {checkInTime}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Duration:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {duration} {duration === 1 ? "hour" : "hours"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <label className="text-sm font-semibold text-gray-600">
                    Checkout Time:
                  </label>
                  <span className="text-gray-900 font-medium">
                    {(() => {
                      if (!hourlyCheckInDate || !checkInTime) return "N/A";
                      const [hours, minutes] = checkInTime
                        .split(":")
                        .map(Number);
                      const checkOut = new Date(hourlyCheckInDate);
                      checkOut.setHours(hours + duration, minutes, 0, 0);
                      return `${checkOut.toLocaleDateString(
                        "en-GB",
                      )} at ${checkOut
                        .getHours()
                        .toString()
                        .padStart(2, "0")}:${checkOut
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}`;
                    })()}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-4">
              <label className="text-sm font-semibold text-gray-600">
                Total room costs:
              </label>
              <span className="text-[#c9b8a8] font-semibold">
                {roomCosts.toLocaleString()} VND
              </span>
            </div>
          </div>
        </div>

        {/* Selected Services */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="text-lg">
              <MdRoomService className="text-white" />
            </span>
            <h3 className="font-semibold">Selected Services</h3>
          </div>

          <div className="space-y-3">
            {getSelectedServiceObjects().length > 0 ? (
              getSelectedServiceObjects().map((service) => {
                const quantity = serviceQuantities[service.serviceID] || 1;
                const targets = selectedServiceTargets[service.serviceID];
                const roomCount =
                  !targets || targets === "ALL"
                    ? rooms.length
                    : Array.isArray(targets)
                      ? targets.length
                      : 1;
                const totalPrice = service.price * quantity * roomCount;

                return (
                  <div
                    key={service.serviceID}
                    className="flex justify-between items-center py-2 border-b border-gray-200"
                  >
                    <span className="text-gray-900 font-medium">
                      • {service.serviceName} x{quantity} ({roomCount} room
                      {roomCount > 1 ? "s" : ""})
                    </span>
                    <span className="text-gray-900 font-medium">
                      {totalPrice.toLocaleString()} VND
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">
                No services selected
              </p>
            )}
          </div>
          <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-4">
            <label className="text-sm font-semibold text-gray-600">
              Total service costs:
            </label>
            <span className="text-[#c9b8a8] font-semibold">
              {serviceCosts.toLocaleString()} VND
            </span>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="bg-[#c9b8a8] text-white px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="text-lg">
              <TbHotelService className="text-white" />
            </span>
            <h3 className="font-semibold">Booking Summary</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-900">
                Booking Type
              </label>
              <p className="text-gray-900 font-medium mt-0.5">
                {bookingType === "DAILY" ? "Daily Booking" : "Hourly Booking"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900">
                Special Requests
              </label>
              <p className="text-gray-900 font-medium mt-0.5">
                {specialRequests || "None"}
              </p>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-4">
              <label className="text-sm font-semibold text-gray-900">
                Vouchers
              </label>
              <span
                onClick={() => setIsVoucherModalOpen(true)}
                className="text-[#c9b8a8] text-sm font-medium cursor-pointer hover:underline"
              >
                {selectedVoucher && selectedVoucher.length > 0
                  ? selectedVoucher.length === 1
                    ? `${selectedVoucher[0].voucher.voucherName} (${
                        selectedVoucher[0].voucher.discountType === "PERCENT"
                          ? `-${selectedVoucher[0].voucher.discountPercentage}%`
                          : `-${selectedVoucher[0].voucher.discountValue?.toLocaleString()} VND`
                      })`
                    : `${selectedVoucher.length} vouchers applied`
                  : customerVouchers && customerVouchers.length > 0
                    ? "Choose voucher"
                    : "No vouchers available"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-4">
              <label className="text-sm font-semibold text-gray-900">
                Total costs:
              </label>
              <span className="text-gray-900 font-semibold">
                {subTotal.toLocaleString()} VND
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <label className="text-sm font-semibold text-gray-900">
                Discount value:
              </label>
              <span className="text-red-600 font-semibold">
                -{discount.toLocaleString()} VND
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-4">
              <label className="text-sm font-semibold text-gray-900">
                Total amount:
              </label>
              <span className="text-[#c9b8a8] font-bold text-lg">
                {totalAmount.toLocaleString()} VND
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePreviousStep}
              className="px-8 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Back
            </button>
            <div className="flex flex-col items-end">
              {error && (
                <div className="text-sm text-red-600 mb-3">{error}</div>
              )}
              <button
                onClick={handleSaveBooking}
                disabled={loading}
                className={`px-8 py-3 text-white font-semibold rounded-lg transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#c9b8a8] hover:bg-[#b8a896]"
                }`}
              >
                {loading ? "Saving..." : "Reserve"}
              </button>
            </div>
          </div>

          {/* Voucher Selection Modal */}
          <CustomerVoucherModal
            isOpen={isVoucherModalOpen}
            onClose={() => setIsVoucherModalOpen(false)}
            availableVouchers={customerVouchers}
            onSelectVoucher={(vouchers) => {
              setSelectedVoucher(vouchers);
              setIsVoucherModalOpen(false);
            }}
          />
        </div>
      </div>
    );
  }

  // Placeholder for other steps
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Step {currentStep}
      </h2>
      <p className="text-gray-600 mb-6">This step is under development.</p>
      <div className="flex gap-4">
        <button
          onClick={() => setCurrentStep(currentStep - 1)}
          className="px-6 py-2 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={handleNextStep}
          className="px-6 py-2 bg-[#c9b8a8] text-white font-semibold rounded-lg hover:bg-[#b8a896] transition"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}

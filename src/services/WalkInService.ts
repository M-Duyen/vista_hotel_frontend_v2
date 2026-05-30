/*eslint-disable*/
import type { RoomType } from "../types/RoomType";
import type { Room } from "../types/Room";
import type { Booking } from "../types/Booking";
import { bookingsApi, customerApi, roomsApi, roomTypesApi } from "./apiClient";
import { calculateHourlyRoomRate, calculateRoomPrice } from "./pricingService";

export interface WalkInBookingRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";

  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  packageType?: string;

  employeeId?: string;
  totalAmount?: number;
}

export interface HourlyBookingRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";

  roomNumber: string;
  checkInTime: string;
  duration: number;
  numberOfGuests?: number;
  specialRequests?: string;

  employeeId?: string;
  totalAmount?: number;
}

const normalizeDateTime = (value: string) =>
  value.includes("T") ? value : `${value}T00:00:00`;

const findOrCreateCustomer = async (request: {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}) => {
  const email = request.email?.trim();
  const phone = request.phone.trim();

  if (phone) {
    const byPhone = await customerApi
      .get(`/by-phone/${encodeURIComponent(phone)}`)
      .then((res) => res.data)
      .catch(() => null);
    if (byPhone?.id) return byPhone;
  }

  if (email) {
    const byEmail = await customerApi
      .get(`/by-email/${encodeURIComponent(email)}`)
      .then((res) => res.data)
      .catch(() => null);
    if (byEmail?.id) return byEmail;
  }

  const fullName = `${request.firstName.trim()} ${request.lastName.trim()}`.trim();
  const response = await customerApi.post("", {
    email: email || `${phone}@walkin.vistahotel.local`,
    username: email || phone,
    fullName,
    phone,
    address: request.address || "",
    birthDate: request.birthDate || null,
    gender: request.gender,
  });

  return response.data;
};

const isRoomFree = async (roomNumber: string, checkIn: string, checkOut: string) => {
  const response = await bookingsApi.get("/check-availability", {
    params: { roomNumber, checkInDate: checkIn, checkOutDate: checkOut },
  });

  if (typeof response.data?.available === "boolean") {
    return response.data.available;
  }

  return Array.isArray(response.data) ? response.data.length === 0 : true;
};

export const getRoomTypes = async (): Promise<RoomType[]> => {
  try {
    const response = await roomTypesApi.get("");
    return response.data;
  } catch (error) {
    console.error("Error fetching room types:", error);
    throw error;
  }
};

export const getAvailableRooms = async (
  roomTypeId: string | null,
  checkIn: string,
  checkOut: string
): Promise<Room[]> => {
  try {
    const roomsResponse = await roomsApi.get("", {
      params: roomTypeId ? { roomTypeId } : {},
    });

    const rooms: Room[] = Array.isArray(roomsResponse.data) ? roomsResponse.data : [];
    const activeRooms = rooms.filter(
      (room) =>
        room.roomNumber &&
        room.status !== "MAINTENANCE" &&
        room.status !== "CLEANING",
    );

    const availability = await Promise.all(
      activeRooms.map(async (room) => ({
        room,
        available: await isRoomFree(room.roomNumber!, checkIn, checkOut),
      })),
    );

    return availability
      .filter((item) => item.available)
      .map((item) => item.room);
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    throw error;
  }
};

export const getAvailableRoomsForHourly = async (
  roomTypeId: string | null,
  checkInTime: string,
  duration: number
): Promise<Room[]> => {
  try {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkIn.getTime() + duration * 60 * 60 * 1000);

    const params: any = {
      checkIn: checkIn.toISOString().split(".")[0],
      checkOut: checkOut.toISOString().split(".")[0],
    };

    if (roomTypeId) {
      params.roomTypeId = roomTypeId;
    }

    return getAvailableRooms(roomTypeId, params.checkIn, params.checkOut);
  } catch (error) {
    console.error("Error fetching available rooms for hourly:", error);
    throw error;
  }
};

export const createWalkInBooking = async (
  request: WalkInBookingRequest
): Promise<Booking> => {
  try {
    const room = await roomsApi.get(`/${request.roomNumber}`).then((res) => res.data as Room);
    const roomType = room.roomType;
    if (!roomType?.roomTypeID || !roomType.basePrice) {
      throw new Error("Room type price is missing");
    }

    const checkInDate = normalizeDateTime(request.checkInDate);
    const checkOutDate = normalizeDateTime(request.checkOutDate);
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const dayPrices = await Promise.all(
      Array.from({ length: nights }, (_, index) => {
        const date = new Date(checkInDate);
        date.setDate(date.getDate() + index);
        return calculateRoomPrice({
          roomTypeId: roomType.roomTypeID!,
          basePrice: Number(roomType.basePrice || 0),
          bookingDate: date.toISOString().split("T")[0],
        });
      }),
    );

    const roomPrice = dayPrices.reduce((sum, item) => sum + Number(item.finalPrice || 0), 0);
    const customer = await findOrCreateCustomer(request);
    const response = await bookingsApi.post("/save-booking", {
      booking: {
        checkInDate,
        checkOutDate,
        numberOfGuests: request.numberOfGuests,
        status: "CHECKED_IN",
        specialRequests: request.specialRequests || "",
        bookingDate: new Date().toISOString().split(".")[0],
        duration: nights * 24,
        packageType: request.packageType || "STANDARD",
        totalAmount: roomPrice,
        totalCost: roomPrice,
        paymentStatus: "PENDING",
        type: "DAILY",
        customerID: customer.id,
        employeeID: request.employeeId,
        actualCheckInTime: new Date().toISOString().split(".")[0],
      },
      bookingDetails: [{ roomNumber: request.roomNumber, roomPrice }],
      bookingServices: [],
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating walk-in booking:", error);
    throw new Error(error.response?.data || "Failed to create booking");
  }
};

// export const createHourlyBooking = async (
//   request: HourlyBookingRequest
// ): Promise<Booking> => {
//   try {
//     const checkIn = new Date(request.checkInTime);
//     const checkOut = new Date(
//       checkIn.getTime() + request.duration * 60 * 60 * 1000
//     );

//     const walkInRequest: WalkInBookingRequest = {
//       firstName: request.firstName,
//       lastName: request.lastName,
//       email: request.email,
//       phone: request.phone,
//       address: request.address,
//       birthDate: request.birthDate,
//       gender: request.gender,
//       roomNumber: request.roomNumber,
//       checkInDate: checkIn.toISOString().split(".")[0],
//       checkOutDate: checkOut.toISOString().split(".")[0],
//       numberOfGuests: request.numberOfGuests || 1,
//       specialRequests: request.specialRequests,
//       packageType: "HOURLY",
//       employeeId: request.employeeId,
//     };

//     const response = await api.post(
//       `${ENDPOINT}/create-booking`,
//       walkInRequest
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error creating hourly booking:", error);
//     throw new Error(error.response?.data || "Failed to create hourly booking");
//   }
// };
export const createHourlyBooking = async (
  request: HourlyBookingRequest
): Promise<Booking> => {
  try {
    const checkIn = new Date(request.checkInTime);
    const checkOut = new Date(
      checkIn.getTime() + request.duration * 60 * 60 * 1000
    );

    const walkInRequest: WalkInBookingRequest = {
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      phone: request.phone,
      address: request.address,
      birthDate: request.birthDate,
      gender: request.gender,
      roomNumber: request.roomNumber,
      checkInDate: checkIn.toISOString().split(".")[0],
      checkOutDate: checkOut.toISOString().split(".")[0],
      numberOfGuests: request.numberOfGuests || 1,
      specialRequests: request.specialRequests,
      packageType: "HOURLY",
      employeeId: request.employeeId,
      totalAmount: request.totalAmount,
    };

    const room = await roomsApi.get(`/${request.roomNumber}`).then((res) => res.data as Room);
    const roomType = room.roomType;
    if (!roomType?.roomTypeID || !roomType.basePrice) {
      throw new Error("Room type price is missing");
    }

    const rate = await calculateHourlyRoomRate({
      roomTypeId: roomType.roomTypeID,
      basePrice: Number(roomType.basePrice || 0),
      hours: request.duration,
      checkInDateTime: walkInRequest.checkInDate,
    });

    const customer = await findOrCreateCustomer(request);
    const totalAmount = Number(rate.totalAmount || request.totalAmount || 0);
    const response = await bookingsApi.post("/save-booking", {
      booking: {
        checkInDate: walkInRequest.checkInDate,
        checkOutDate: walkInRequest.checkOutDate,
        numberOfGuests: request.numberOfGuests || 1,
        status: "CHECKED_IN",
        specialRequests: request.specialRequests || "",
        bookingDate: new Date().toISOString().split(".")[0],
        hourlyRate: rate.totalPercentage,
        duration: request.duration,
        packageType: "HOURLY",
        totalAmount,
        totalCost: totalAmount,
        paymentStatus: "PENDING",
        type: "HOURLY",
        customerID: customer.id,
        employeeID: request.employeeId,
        actualCheckInTime: new Date().toISOString().split(".")[0],
      },
      bookingDetails: [{ roomNumber: request.roomNumber, roomPrice: totalAmount }],
      bookingServices: [],
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating hourly booking:", error);
    throw new Error(error.response?.data || "Failed to create hourly booking");
  }
};

export const getRoomTypePrice = async (roomTypeId: string): Promise<number> => {
  try {
    const response = await roomTypesApi.get("");
    const roomTypes: RoomType[] = response.data;
    const roomType = roomTypes.find((type) => type.roomTypeID === roomTypeId);
    return roomType?.basePrice || 0;
  } catch (error) {
    console.error("Error fetching room type price:", error);
    return 0;
  }
};

export default {
  getRoomTypes,
  getAvailableRooms,
  getAvailableRoomsForHourly,
  createWalkInBooking,
  createHourlyBooking,
  getRoomTypePrice,
};

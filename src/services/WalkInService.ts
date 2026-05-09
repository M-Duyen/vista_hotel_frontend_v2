/*eslint-disable*/
import type { RoomType } from "../types/RoomType";
import type { Room } from "../types/Room";
import type { Booking } from "../types/Booking";
import { api } from "./apiClient";

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

const ENDPOINT = "/walk-in";

export const getRoomTypes = async (): Promise<RoomType[]> => {
  try {
    const response = await api.get(`${ENDPOINT}/room-types`);
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
    const params: any = {
      checkIn,
      checkOut,
    };

    if (roomTypeId) {
      params.roomTypeId = roomTypeId;
    }

    const response = await api.get(`${ENDPOINT}/available-rooms`, { params });
    return response.data;
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

    const response = await api.get(`${ENDPOINT}/available-rooms`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching available rooms for hourly:", error);
    throw error;
  }
};

export const createWalkInBooking = async (
  request: WalkInBookingRequest
): Promise<Booking> => {
  try {
    const response = await api.post(`${ENDPOINT}/create-booking`, request);
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

    const response = await api.post(
      `${ENDPOINT}/create-booking`,
      walkInRequest
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating hourly booking:", error);
    throw new Error(error.response?.data || "Failed to create hourly booking");
  }
};

export const getRoomTypePrice = async (roomTypeId: string): Promise<number> => {
  try {
    const response = await api.get(`${ENDPOINT}/room-types`);
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

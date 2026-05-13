import type { RoomType } from "../types/RoomType";
// import { api } from "./apiClient";
import { roomTypesApi } from "./apiClient";

// const ENDPOINT = "/room-types";

export const getAllRoomTypes = async () => {
  try {
    const response = await roomTypesApi.get('');
    return response.data;
  } catch (error) {
    console.error("Error fetching room types:", error);
    throw error;
  }
};

/**
 * Get room type by ID
 */
export const getRoomTypeById = async (id: string): Promise<RoomType> => {
  try {
    const response = await roomTypesApi.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching room type by ID:", error);
    throw error;
  }
};

/**
 * Create or update room type
 */
export const saveRoomType = async (
  roomTypeData: Partial<RoomType>
): Promise<RoomType> => {
  try {
    const response = await roomTypesApi.post('/save', roomTypeData);
    return response.data;
  } catch (error) {
    console.error("Error saving room type:", error);
    throw error;
  }
};

/**
 * Delete room type
 */
export const deleteRoomType = async (id: string): Promise<void> => {
  try {
    await roomTypesApi.delete(`/${id}`);
  } catch (error) {
    console.error("Error deleting room type:", error);
    throw error;
  }
};

export const calculateDiscountedPrice = async (
  roomTypeId: string,
  bookingDate: string
): Promise<number> => {
  try {
    const response = await roomTypesApi.get(
      `/discounted-price/${roomTypeId}`,
      { params: { bookingDate } }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const roomTypeService = {
  getAllRoomTypes,
  getRoomTypeById,
  saveRoomType,
  deleteRoomType,
};

export default roomTypeService;

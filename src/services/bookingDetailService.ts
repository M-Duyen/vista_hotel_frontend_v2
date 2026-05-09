/* eslint-disable */
import { api } from "./apiClient";
import type { BookingDetail } from "../types/BookingDetail";

const ENDPOINT = "/booking-details";

export const getBookingDetailsById = async (
  id: string
): Promise<BookingDetail[]> => {
  try {
    const response = await api.get(`${ENDPOINT}/booking/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking details ${id}:`, error);
    throw error;
  }
};
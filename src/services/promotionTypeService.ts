import { api } from "./apiClient";
import type { PromotionType } from "../types/PromotionType";

const ENDPOINT = "/promotion-types";

export const getAllPromotionTypes = async (): Promise<PromotionType[]> => {
  try {
    const response = await api.get(`${ENDPOINT}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching promotion types:", error);
    throw error;
  }
};

export const getPromotionTypeById = async (
  id: string
): Promise<PromotionType> => {
  try {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching promotion type:", error);
    throw error;
  }
};

export const createPromotionType = async (
  promotionTypeData: Partial<PromotionType>
): Promise<PromotionType> => {
  try {
    const response = await api.post(`${ENDPOINT}/create`, promotionTypeData);
    return response.data;
  } catch (error) {
    console.error("Error creating promotion type:", error);
    throw error;
  }
};

export const updatePromotionType = async (
  id: string,
  promotionTypeData: Partial<PromotionType>
): Promise<PromotionType> => {
  try {
    const response = await api.put(`${ENDPOINT}/${id}`, promotionTypeData);
    return response.data;
  } catch (error) {
    console.error("Error updating promotion type:", error);
    throw error;
  }
};

export const deletePromotionType = async (id: string): Promise<void> => {
  try {
    await api.delete(`${ENDPOINT}/${id}`);
  } catch (error) {
    console.error("Error deleting promotion type:", error);
    throw error;
  }
};

import { promotionTypesApi } from "./apiClient";
import type { PromotionType } from "../types/PromotionType";

const normalizePromotionType = (raw: any): PromotionType => ({
  promotionTypeID: raw?.promotionTypeID ?? raw?.promotionTypeId ?? "",
  promotionTYPEName: raw?.promotionTYPEName ?? raw?.promotionTypeName ?? "",
  description: raw?.description ?? "",
});

export const getAllPromotionTypes = async (): Promise<PromotionType[]> => {
  try {
    const response = await promotionTypesApi.get("");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizePromotionType);
  } catch (error) {
    console.error("Error fetching promotion types:", error);
    throw error;
  }
};

export const getPromotionTypeById = async (
  id: string
): Promise<PromotionType> => {
  try {
    const response = await promotionTypesApi.get(`/${id}`);
    return normalizePromotionType(response.data);
  } catch (error) {
    console.error("Error fetching promotion type:", error);
    throw error;
  }
};

export const createPromotionType = async (
  promotionTypeData: Partial<PromotionType>
): Promise<PromotionType> => {
  try {
    const payload = {
      promotionTypeId: promotionTypeData.promotionTypeID,
      promotionTypeName: promotionTypeData.promotionTYPEName,
      description: promotionTypeData.description,
    };
    const response = await promotionTypesApi.post("/create", payload);
    return normalizePromotionType(response.data);
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
    const payload = {
      promotionTypeName: promotionTypeData.promotionTYPEName,
      description: promotionTypeData.description,
    };
    const response = await promotionTypesApi.put(`/${id}`, payload);
    return normalizePromotionType(response.data);
  } catch (error) {
    console.error("Error updating promotion type:", error);
    throw error;
  }
};

export const deletePromotionType = async (id: string): Promise<void> => {
  try {
    await promotionTypesApi.delete(`/${id}`);
  } catch (error) {
    console.error("Error deleting promotion type:", error);
    throw error;
  }
};

/* eslint-disable*/
import { promotionsApi } from "./apiClient";
import type { Promotion } from "../types/Promotion";
import { saveRoomTypePromotion } from "./roomTypePromotionService";
// import type { RoomTypePromotion } from "../types/RoomTypePromotion";

const normalizePromotion = (raw: any): Promotion => ({
  promotionID: raw?.promotionID ?? raw?.promotionId ?? "",
  promotionName: raw?.promotionName ?? "",
  description: raw?.description ?? "",
  discountType: raw?.discountType,
  active: raw?.active ?? false,
  promotionType: raw?.promotionType
    ? {
        promotionTypeID:
          raw.promotionType?.promotionTypeID ??
          raw.promotionType?.promotionTypeId ??
          "",
        promotionTYPEName:
          raw.promotionType?.promotionTYPEName ??
          raw.promotionType?.promotionTypeName ??
          "",
        description: raw.promotionType?.description ?? "",
      }
    : {
        promotionTypeID: "",
        promotionTYPEName: "",
        description: "",
      },
  admin: raw?.admin ?? undefined,
  roomTypePromotion: raw?.roomTypePromotion ?? raw?.roomTypePromotions ?? [],
});

interface AxiosError {
  response?: {
    data?: unknown;
    status?: number;
  };
}

export const getAllPromotions = async () => {
  try {
    const response = await promotionsApi.get("");
    const items = Array.isArray(response.data) ? response.data : [];
    return items.map(normalizePromotion);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw error;
  }
};

export const createPromotion = async (
  promotionData: Partial<Promotion> & {
    promotionID?: string;
    roomTypePromotions?: Array<{
      roomType: { roomTypeID: string };
      discountValue: number;
      startDate: string;
      endDate: string;
    }>;
  },
) => {
  try {
    console.log("Sending promotion data to backend:", promotionData);

    // Trích xuất roomTypePromotions trước khi gửi
    const { roomTypePromotions, ...promotionOnly } = promotionData;

    const promotionTypeId =
      typeof promotionOnly.promotionType === "string"
        ? promotionOnly.promotionType
        : promotionOnly.promotionType?.promotionTypeID ||
          promotionOnly.promotionType?.promotionTypeId;

    // TODO: Get adminId from auth context when available
    const promotionPayload = {
      promotionId: promotionOnly.promotionID,
      promotionName: promotionOnly.promotionName,
      description: promotionOnly.description,
      discountType: promotionOnly.discountType,
      active: promotionOnly.active ?? true,
      adminId: "ADMIN001",
      promotionType: promotionTypeId
        ? {
            promotionTypeId,
          }
        : undefined,
    };

    // Tạo promotion trước
    const response = await promotionsApi.post("/create", promotionPayload);
    console.log("Promotion created:", response.data);

    let fullPromotion: Promotion | undefined;

    // Lưu các room type promotions riêng nếu có
    if (roomTypePromotions && roomTypePromotions.length > 0) {
      console.log("Saving room type promotions...");

      // Lấy tất cả các khuyến mãi và tìm khuyến mãi vừa tạo
      const allPromotions = await getAllPromotions();
      fullPromotion = allPromotions.find(
        (p: Promotion) => p.promotionID === promotionData.promotionID,
      );

      if (!fullPromotion) {
        console.error("Could not find created promotion!");
        throw new Error("Promotion created but not found in database");
      }

      console.log("Found full promotion:", fullPromotion);

      const savePromises = roomTypePromotions.map((rtp) => {
        const rtpData = {
          roomType: rtp.roomType,
          promotion: fullPromotion,
          discountValue: rtp.discountValue,
          startDate: rtp.startDate,
          endDate: rtp.endDate,
        };
        return saveRoomTypePromotion(rtpData).catch((error) => {
          console.error("Failed to save room type promotion:", error);
          return null;
        });
      });

      await Promise.all(savePromises);
    }

    return fullPromotion ?? normalizePromotion(promotionPayload);
  } catch (error: unknown) {
    console.error("Error saving promotion:", error);
    console.error("Error response:", (error as AxiosError).response?.data);
    console.error("Error status:", (error as AxiosError).response?.status);
    throw error;
  }
};

export const savePromotion = createPromotion;

// Cập nhật trạng thái kích hoạt của khuyến mãi
export const updatePromotionStatus = async (
  promotionID: string,
  active: boolean,
) => {
  try {
    const response = await promotionsApi.patch(
      `/${promotionID}/status?active=${active}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating promotion status:", error);
    throw error;
  }
};

export const getPromotionById = async (promotionID: string) => {
  try {
    const response = await promotionsApi.get(`/find/${promotionID}`);
    return normalizePromotion(response.data);
  } catch (error) {
    console.error("Error fetching promotion by ID:", error);
    throw error;
  }
};

// Alias for compatibility
export { getAllPromotions as getPromotions };

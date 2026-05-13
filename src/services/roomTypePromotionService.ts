import { roomTypePromotionsApi } from "./apiClient";
import type { RoomTypePromotion } from "../types/RoomTypePromotion";

interface AxiosError {
  response?: {
    data?: unknown;
    status?: number;
  };
}

// Lấy tất cả các chương trình khuyến mãi loại phòng
export const getAllRoomTypePromotions = async (): Promise<
  RoomTypePromotion[]
> => {
  const response = await roomTypePromotionsApi.get("");
  return response.data;
};

// Lấy khuyến mãi loại phòng theo ID khuyến mãi
export const getRoomTypePromotionsByPromotionId = async (
  promotionId: string,
): Promise<RoomTypePromotion[]> => {
  try {
    const allRTP = await getAllRoomTypePromotions();
    return allRTP.filter(
      (rtp: RoomTypePromotion) => rtp.promotion?.promotionID === promotionId,
    );
  } catch (error) {
    console.error("Error fetching room type promotions:", error);
    return [];
  }
};

// Lấy khuyến mãi loại phòng theo ID loại phòng
export const getRoomTypePromotionsByRoomTypeId = async (
  roomTypeId: string,
): Promise<RoomTypePromotion[]> => {
  try {
    const allRTP = await getAllRoomTypePromotions();
    return allRTP.filter(
      (rtp: RoomTypePromotion) => rtp.roomType?.roomTypeID === roomTypeId,
    );
  } catch (error) {
    console.error("Error fetching room type promotions:", error);
    return [];
  }
};

// Lưu/Tạo khuyến mãi loại phòng
export const saveRoomTypePromotion = async (roomTypePromotionData: {
  roomType: { roomTypeID: string };
  promotion?: { promotionID: string };
  discountValue: number;
  startDate: string;
  endDate: string;
}): Promise<RoomTypePromotion> => {
  const promotion = { ...roomTypePromotionData.promotion } as Record<
    string,
    unknown
  >;
  if ("roomTypePromotions" in promotion) {
    delete promotion.roomTypePromotions; // Remove @OneToMany collection
  }

  const roomType = { ...roomTypePromotionData.roomType } as Record<
    string,
    unknown
  >;
  if ("rooms" in roomType) {
    delete roomType.rooms; // Remove @OneToMany collection if exists
  }
  if ("amenities" in roomType) {
    delete roomType.amenities; // Remove @ManyToMany collection if exists
  }

  const payload = {
    roomType: roomType,
    promotion: promotion,
    discountValue: Number(roomTypePromotionData.discountValue),
    startDate: roomTypePromotionData.startDate,
    endDate: roomTypePromotionData.endDate,
  };

  console.log("Saving RoomTypePromotion:", JSON.stringify(payload, null, 2));

  try {
    const response = await roomTypePromotionsApi.post("/create", payload);
    console.log("RoomTypePromotion saved successfully");
    return response.data;
  } catch (error: unknown) {
    console.error("Failed to save RoomTypePromotion:");
    console.error("  Status:", (error as AxiosError).response?.status);
    console.error("  Error data:", (error as AxiosError).response?.data);

    if ((error as AxiosError).response?.data) {
      console.error(
        "  Full error:",
        JSON.stringify((error as AxiosError).response?.data, null, 2),
      );
    }

    throw error;
  }
};

// Delete room type promotion
export const deleteRoomTypePromotion = async (
  promotionId: string,
  roomTypeId: string,
) => {
  const response = await roomTypePromotionsApi.delete(
    `/delete?promotionId=${promotionId}&roomTypeId=${roomTypeId}`,
  );
  return response.data;
};

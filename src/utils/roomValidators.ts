import type { RoomFormData } from "../components/room/modal/AddRoomModal";

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate dữ liệu của tab thông tin chi tiết phòng
 * Now includes room type selection
 */
export const validateRoomDetails = (
  formData: RoomFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.roomNumber.trim()) {
    errors.push({
      field: "roomNumber",
      message: "Room number is required",
    });
  }

  if (!formData.floor) {
    errors.push({
      field: "floor",
      message: "Floor is required",
    });
  } else if (parseInt(formData.floor) < 1) {
    errors.push({
      field: "floor",
      message: "Floor must be greater than 0",
    });
  }

  if (!formData.roomStatus) {
    errors.push({
      field: "roomStatus",
      message: "Room status is required",
    });
  }

  if (!formData.lastCleaned) {
    errors.push({
      field: "lastCleaned",
      message: "Last cleaned date is required",
    });
  }

  if (!formData.roomTypeId) {
    errors.push({
      field: "roomTypeId",
      message: "Room type is required. Please select a room type.",
    });
  }

  return errors;
};

/**
 * Valid tab Images
 */
export const validateImages = (formData: RoomFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (formData.imageUrls.length === 0 && formData.imageFiles.length === 0) {
    errors.push({
      field: "imageFiles",
      message: "At least one image is required",
    });
  }

  return errors;
};

/**
 * Validate dữ liệu dựa trên tab hiện tại
 * Only 2 tabs now: details and images
 */
export const validateTab = (
  tabId: string,
  formData: RoomFormData
): ValidationError[] => {
  switch (tabId) {
    case "details":
      return validateRoomDetails(formData);
    case "images":
      return validateImages(formData);
    default:
      return [];
  }
};

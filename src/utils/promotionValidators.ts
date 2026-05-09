/**
 * Tiện ích xác thực cho Quản lý Khuyến mãi
 */

/**
 * Validate ID khuyến mãi
 * @param id - ID Khuyến mãi
 * @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
 */
export const validatePromotionId = (id: string): string => {
  if (!id || id.trim().length === 0) {
    return "Promotion ID is required";
  }

  const trimmed = id.trim();
  if (trimmed.length < 3) {
    return "Promotion ID must be at least 3 characters";
  }

  if (trimmed.length > 20) {
    return "Promotion ID must not exceed 20 characters";
  }

  // Chỉ cho phép chữ và số và dấu gạch dưới
  if (!/^[A-Z0-9_]+$/i.test(trimmed)) {
    return "Promotion ID can only contain letters, numbers, and underscores";
  }

  return "";
};

/**
* Validate tên khuyến mãi
* @param name - Tên khuyến mãi
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validatePromotionName = (name: string): string => {
  if (!name || name.trim().length === 0) {
    return "Promotion name is required";
  }

  const trimmed = name.trim();
  if (trimmed.length < 5) {
    return "Promotion name must be at least 5 characters";
  }

  if (trimmed.length > 150) {
    return "Promotion name must not exceed 150 characters";
  }

  return "";
};

/**
* Validate mô tả khuyến mãi
* @param description - Mô tả khuyến mãi
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validatePromotionDescription = (description: string): string => {
  if (!description || description.trim().length === 0) {
    return "Description is required";
  }

  const trimmed = description.trim();
  if (trimmed.length < 10) {
    return "Description must be at least 10 characters";
  }

  if (trimmed.length > 1000) {
    return "Description must not exceed 1000 characters";
  }

  return "";
};

/**
* Validate phần trăm giảm giá cho các chương trình khuyến mãi
* @param percentage - Phần trăm giảm giá (0-100)
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validatePromotionDiscount = (percentage: number): string => {
  if (percentage === null || percentage === undefined) {
    return "Discount percentage is required";
  }

  if (percentage <= 0) {
    return "Discount percentage must be greater than 0";
  }

  if (percentage > 100) {
    return "Discount percentage must not exceed 100";
  }

  return "";
};

/**
* Validate phạm vi ngày khuyến mãi
* @param startDate - Ngày bắt đầu
* @param endDate - Ngày kết thúc
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validatePromotionDateRange = (
  startDate: Date | string,
  endDate: Date | string
): string => {
  if (!startDate) {
    return "Start date is required";
  }

  if (!endDate) {
    return "End date is required";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return "Invalid start date";
  }

  if (isNaN(end.getTime())) {
    return "Invalid end date";
  }

  if (end <= start) {
    return "End date must be after start date";
  }

  // Kiểm tra xem phạm vi ngày có quá dài không (hơn 1 năm)
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > oneYear) {
    return "Promotion duration cannot exceed 1 year";
  }

  return "";
};

/**
* Validate ID loại khuyến mãi
* @param typeId - ID loại khuyến mãi
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validatePromotionTypeId = (typeId: string): string => {
  if (!typeId || typeId.trim().length === 0) {
    return "Promotion type is required";
  }

  return "";
};

/**
* Validate tên loại khuyến mãi
* @param name - Tên loại khuyến mãi
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validatePromotionTypeName = (name: string): string => {
  if (!name || name.trim().length === 0) {
    return "Promotion type name is required";
  }

  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return "Promotion type name must be at least 3 characters";
  }

  if (trimmed.length > 50) {
    return "Promotion type name must not exceed 50 characters";
  }

  return "";
};

/**
* Validate số đêm đặt phòng tối thiểu để được khuyến mãi
* @param nights - Số đêm tối thiểu
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validateMinBookingNights = (nights: number): string => {
  if (nights === null || nights === undefined) {
    return "Minimum booking nights is required";
  }

  if (nights < 1) {
    return "Minimum booking nights must be at least 1";
  }

  if (nights > 365) {
    return "Minimum booking nights must not exceed 365";
  }

  if (!Number.isInteger(nights)) {
    return "Minimum booking nights must be a whole number";
  }

  return "";
};

/**
* Validate giá trị giảm giá cho RoomTypePromotion
* Được sử dụng cho giá trị giảm giá trong bảng giao thoa giữa RoomType và Promotion
* @param discountValue - Giá trị giảm giá (0-100 cho chiết khấu theo phần trăm)
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validateRoomTypePromotionDiscount = (
  discountValue: number
): string => {
  if (discountValue === null || discountValue === undefined) {
    return "Discount value is required";
  }

  if (discountValue <= 0) {
    return "Discount value must be greater than 0";
  }

  if (discountValue > 100) {
    return "Discount value must not exceed 100";
  }

  return "";
};

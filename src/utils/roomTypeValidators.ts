/**
 * Tiện ích validate cho Quản lý Loại phòng
 */

/**
 * Validate ID loại phòng
 * @param id - ID loại phòng
 * @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
 */
export const validateRoomTypeId = (id: string): string => {
  if (!id || id.trim().length === 0) {
    return "Room type ID is required";
  }

  const trimmed = id.trim();
  if (trimmed.length < 2) {
    return "Room type ID must be at least 2 characters";
  }

  if (trimmed.length > 20) {
    return "Room type ID must not exceed 20 characters";
  }

  // Chỉ cho phép chữ và số và dấu gạch dưới
  if (!/^[A-Z0-9_]+$/i.test(trimmed)) {
    return "Room type ID can only contain letters, numbers, and underscores";
  }

  return "";
};

/**
* Validate tên loại phòng
* @param name - Tên loại phòng
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validateRoomTypeName = (name: string): string => {
  if (!name || name.trim().length === 0) {
    return "Room type name is required";
  }

  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return "Room type name must be at least 3 characters";
  }

  if (trimmed.length > 100) {
    return "Room type name must not exceed 100 characters";
  }

  return "";
};

/**
* Validate số người tối đa
* @param maxOccupancy - Số người
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validateMaxOccupancy = (maxOccupancy: number): string => {
  if (maxOccupancy === null || maxOccupancy === undefined) {
    return "Max occupancy is required";
  }

  if (maxOccupancy < 1) {
    return "Max occupancy must be at least 1";
  }

  if (maxOccupancy > 20) {
    return "Max occupancy must not exceed 20 people";
  }

  if (!Number.isInteger(maxOccupancy)) {
    return "Max occupancy must be a whole number";
  }

  return "";
};

/**
 * @deprecated Sử dụng validateMaxOccupancy thay thế
 */
export const validateCapacity = validateMaxOccupancy;

/**
* Validate giá phòng
* @param price - Giá mỗi đêm tính bằng VND
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validateRoomPrice = (price: number): string => {
  if (price === null || price === undefined) {
    return "Price is required";
  }

  if (price < 100000) {
    return "Price must be at least 100,000 VND";
  }

  if (price > 100000000) {
    return "Price must not exceed 100,000,000 VND";
  }

  if (price % 1000 !== 0) {
    return "Price must be a multiple of 1,000 VND";
  }

  return "";
};

/**
* Validate diện tích phòng
* @param area - Diện tích phòng tính bằng mét vuông
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validateRoomArea = (area: number): string => {
  if (area === null || area === undefined) {
    return "Room area is required";
  }

  if (area < 10) {
    return "Room area must be at least 10 m²";
  }

  if (area > 500) {
    return "Room area must not exceed 500 m²";
  }

  return "";
};

/**
 * @deprecated Sử dụng validateRoomArea thay thế
 */
export const validateRoomSize = validateRoomArea;

/**
* Validate loại giường
* @param bedType - Loại giường
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validateBedType = (bedType: string): string => {
  if (!bedType || bedType.trim().length === 0) {
    return "Bed type is required";
  }

  const validBedTypes = ["SINGLE", "DOUBLE", "QUEEN", "KING", "TWIN"];
  if (!validBedTypes.includes(bedType.toUpperCase())) {
    return "Invalid bed type";
  }

  return "";
};

/**
* Validate mô tả phòng
* @param description - Mô tả loại phòng
* @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
*/
export const validateRoomTypeDescription = (description: string): string => {
  if (!description || description.trim().length === 0) {
    return "Description is required";
  }

  const trimmed = description.trim();
  if (trimmed.length < 20) {
    return "Description must be at least 20 characters";
  }

  if (trimmed.length > 2000) {
    return "Description must not exceed 2000 characters";
  }

  return "";
};

/**
 * Validate amenities list
 * @param amenities - Mảng các tiện nghi
 * @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
 */
export const validateAmenities = (amenities: string[]): string => {
  if (!amenities || amenities.length === 0) {
    return "At least one amenity is required";
  }

  if (amenities.length > 50) {
    return "Too many amenities (maximum 50)";
  }

  for (const amenity of amenities) {
    if (!amenity || amenity.trim().length === 0) {
      return "Amenity cannot be empty";
    }

    if (amenity.length > 100) {
      return "Each amenity must not exceed 100 characters";
    }
  }

  return "";
};

/**
 * Validate image URL
 * @param url - URL hình ảnh
 * @returns Thông báo lỗi hoặc chuỗi trống nếu hợp lệ
 */
export const validateImageUrl = (url: string): string => {
  if (!url || url.trim().length === 0) {
    return "Image URL is required";
  }

  // Kiểm tra định dạng URL cơ bản
  try {
    new URL(url);
  } catch {
    return "Invalid image URL format";
  }

  // Kiểm tra phần mở rộng hình ảnh
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const hasValidExtension = imageExtensions.some((ext) =>
    url.toLowerCase().endsWith(ext)
  );

  if (
    !hasValidExtension &&
    !url.includes("cloudinary") &&
    !url.includes("imgur")
  ) {
    return "URL must be a valid image (jpg, jpeg, png, webp, gif)";
  }

  return "";
};

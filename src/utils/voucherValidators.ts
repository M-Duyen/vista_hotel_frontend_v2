import type { Voucher } from "../types/Voucher";

/**
 * Validates voucher form data
 * @param formData - Partial voucher data to validate
 * @returns Record of field errors (empty if valid)
 */
export const validateVoucherForm = (
  formData: Partial<Voucher>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const voucherId = formData.voucherId ?? "";

  // Validate Voucher ID
  if (!voucherId.trim()) {
    errors.voucherId = "Voucher ID is required";
  } else if (voucherId.length < 3) {
    errors.voucherId = "Voucher ID must be at least 3 characters";
  } else if (!/^[A-Z0-9_-]+$/i.test(voucherId)) {
    errors.voucherId =
      "Voucher ID can only contain letters, numbers, dashes, and underscores";
  }

  // Validate Voucher Name
  if (!formData.voucherName?.trim()) {
    errors.voucherName = "Voucher name is required";
  } else if (formData.voucherName.length < 3) {
    errors.voucherName = "Voucher name must be at least 3 characters";
  } else if (formData.voucherName.length > 100) {
    errors.voucherName = "Voucher name must not exceed 100 characters";
  }

  // Validate Discount Type
  if (!formData.discountType) {
    errors.discountType = "Discount type is required";
  } else if (!["PERCENT", "FIXED"].includes(formData.discountType)) {
    errors.discountType = "Invalid discount type";
  }

  // Validate Discount Percentage (for PERCENT type)
  if (formData.discountType === "PERCENT") {
    if (
      formData.discountPercentage === undefined ||
      formData.discountPercentage === null
    ) {
      errors.discountPercentage = "Discount percentage is required";
    } else if (formData.discountPercentage <= 0) {
      errors.discountPercentage = "Discount percentage must be greater than 0";
    } else if (formData.discountPercentage > 100) {
      errors.discountPercentage = "Discount percentage cannot exceed 100%";
    }
  }

  // Validate Discount Value (for FIXED type)
  if (formData.discountType === "FIXED") {
    if (
      formData.discountValue === undefined ||
      formData.discountValue === null
    ) {
      errors.discountValue = "Discount value is required";
    } else if (formData.discountValue <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    } else if (formData.discountValue > 100000000) {
      errors.discountValue = "Discount value is too large";
    }
  }

  // Validate Start Date
  if (!formData.startDate) {
    errors.startDate = "Start date is required";
  } else {
    const startDate = new Date(formData.startDate);
    if (isNaN(startDate.getTime())) {
      errors.startDate = "Invalid start date";
    }
  }

  // Validate End Date
  if (!formData.endDate) {
    errors.endDate = "End date is required";
  } else {
    const endDate = new Date(formData.endDate);
    if (isNaN(endDate.getTime())) {
      errors.endDate = "Invalid end date";
    }
  }

  // Validate Date Range
  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (endDate <= startDate) {
        errors.endDate = "End date must be after start date";
      }

      // Check if date range is too long (e.g., more than 2 years)
      const twoYearsInMs = 2 * 365 * 24 * 60 * 60 * 1000;
      if (endDate.getTime() - startDate.getTime() > twoYearsInMs) {
        errors.endDate = "Voucher validity period cannot exceed 2 years";
      }
    }
  }

  // Validate Status
  if (formData.isActive === undefined || formData.isActive === null) {
    errors.isActive = "Status is required";
  }

  return errors;
};

/**
 * Checks if a voucher is expired
 * @param voucher - Voucher to check
 * @returns true if expired, false otherwise
 */
export const isVoucherExpired = (voucher: Voucher): boolean => {
  const now = new Date();
  const endDate = new Date(voucher.endDate);
  return endDate < now;
};

/**
 * Checks if a voucher is about to expire (within 7 days)
 * @param voucher - Voucher to check
 * @returns true if expiring soon, false otherwise
 */
export const isVoucherExpiringSoon = (voucher: Voucher): boolean => {
  const now = new Date();
  const endDate = new Date(voucher.endDate);
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  return endDate.getTime() - now.getTime() <= sevenDaysInMs && endDate > now;
};

/**
 * Gets the display status of a voucher
 * @param voucher - Voucher to get status for
 * @returns Status object with label and color
 */
export const getVoucherDisplayStatus = (
  voucher: Voucher
): {
  label: string;
  color: string;
  bgColor: string;
} => {
  if (isVoucherExpired(voucher)) {
    return {
      label: "Expired",
      color: "text-red-800",
      bgColor: "bg-red-100",
    };
  }

  if (voucher.isActive) {
    if (isVoucherExpiringSoon(voucher)) {
      return {
        label: "Expiring Soon",
        color: "text-orange-800",
        bgColor: "bg-orange-100",
      };
    }
    return {
      label: "Active",
      color: "text-green-800",
      bgColor: "bg-green-100",
    };
  }

  return {
    label: "Inactive",
    color: "text-gray-800",
    bgColor: "bg-gray-100",
  };
};

/**
 * Formats discount display text
 * @param voucher - Voucher to format
 * @returns Formatted discount string
 */
export const formatVoucherDiscount = (voucher: Voucher): string => {
  if (voucher.discountType === "PERCENT") {
    return `${voucher.discountPercentage || 0}%`;
  }
  return `${voucher.discountValue?.toLocaleString("vi-VN") || 0}đ`;
};

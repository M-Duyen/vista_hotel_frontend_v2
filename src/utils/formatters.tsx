// <<<<<<< HEAD
// // Utility functions for formatting data
//
// /**
//  * Format a date to Vietnamese locale string
//  */
// export const formatDate = (date: string | Date | null | undefined): string => {
//     if (!date) return 'N/A';
//
//     try {
//         const d = typeof date === 'string' ? new Date(date) : date;
//         return new Intl.DateTimeFormat('vi-VN', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//             hour: '2-digit',
//             minute: '2-digit',
//         }).format(d);
//     } catch {
//         return 'N/A';
//     }
// };
//
// /**
//  * Format a date to short format (DD/MM/YYYY)
//  */
// export const formatDateShort = (
//     date: string | Date | null | undefined,
// ): string => {
//     if (!date) return 'N/A';
//
//     try {
//         const d = typeof date === 'string' ? new Date(date) : date;
//         return new Intl.DateTimeFormat('vi-VN', {
//             year: 'numeric',
//             month: '2-digit',
//             day: '2-digit',
//         }).format(d);
//     } catch {
//         return 'N/A';
//     }
// };
//
// /**
//  * Format currency to VND
//  */
// export const formatCurrency = (amount: number | null | undefined): string => {
//     if (amount === null || amount === undefined) return 'N/A';
//
//     return new Intl.NumberFormat('vi-VN', {
//         style: 'currency',
//         currency: 'VND',
//     }).format(amount);
// };
//
// /**
//  * Format number with thousand separators
//  */
// export const formatNumber = (num: number | null | undefined): string => {
//     if (num === null || num === undefined) return 'N/A';
//
//     return new Intl.NumberFormat('vi-VN').format(num);
// =======
// /**
// * Định dạng số theo đơn vị tiền tệ Đồng Việt Nam (VND)
// * @param amount - Số tiền cần định dạng
// * @returns Chuỗi được định dạng theo đơn vị tiền tệ VND
// */
// export const formatVND = (amount: number | undefined | null): string => {
//   if (amount === undefined || amount === null) {
//     return "0 ₫";
//   }
//
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//   }).format(amount);
// };
//
// /**
// * Định dạng số theo đơn vị tiền tệ Đồng Việt Nam (đồng)
// * @param money - Số tiền cần định dạng
// * @returns Chuỗi được định dạng theo đơn vị tiền tệ VNĐ
// */
// export const formatNumber = (amount: number | undefined | null): string => {
//   if (amount === undefined || amount === null) {
//     return "0";
//   }
//
//   return new Intl.NumberFormat("vi-VN").format(amount);
// >>>>>>> origin/PPH
// };
// ====================================================================
// 🔧 Utility Functions – Định dạng ngày, số, tiền tệ (Merged Version)
// ====================================================================

/**
 * Định dạng ngày giờ đầy đủ (DD/MM/YYYY HH:mm)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "N/A";

    try {
        const d = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(d);
    } catch {
        return "N/A";
    }
};

/**
 * Định dạng ngày ngắn (DD/MM/YYYY)
 */
export const formatDateShort = (
    date: string | Date | null | undefined
): string => {
    if (!date) return "N/A";

    try {
        const d = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(d);
    } catch {
        return "N/A";
    }
};

/**
 * Định dạng số tiền theo VND (trả về N/A nếu không hợp lệ)
 * Ví dụ: 50000 → "50.000 ₫"
 */
export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "N/A";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

/**
 * Định dạng số tiền VND (luôn có ₫ và luôn trả về số)
 * Ví dụ: null → "0 ₫"
 */
export const formatVND = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "0 ₫";

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

/**
 * Định dạng số có dấu phân cách hàng nghìn
 * Ví dụ: 1000000 → "1.000.000"
 */
export const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return "0";

    return new Intl.NumberFormat("vi-VN").format(num);
};

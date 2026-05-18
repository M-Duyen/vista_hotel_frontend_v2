/*eslint-disable */
import { API_CONFIG } from "@/config/api.config";

const API_BASE_URL = API_CONFIG.BASE_URL;

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface BackendNotification {
  id: string;
  type: "REQUEST" | "INFO" | "ALERT" | "SYSTEM";
  category:
    | "EARLY_CHECKIN"
    | "LATE_CHECKOUT"
    | "CANCELLATION"
    | "PAYMENT_ISSUE"
    | "MAINTENANCE"
    | "HOUSEKEEPING"
    | "PROMOTION"
    | "SECURITY"
    | "OTHER";
  title: string;
  message: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserType?: "CUSTOMER" | "ADMIN" | "EMPLOYEE";
  toUserId?: string;
  toUserIds?: string[];
  toUserType?: "CUSTOMER" | "ADMIN" | "EMPLOYEE";
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "DISMISSED"
    | "SENT"
    | "FAILED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  needsAction?: boolean;
  isRead: boolean;
  readAt?: string;
  isRealtime: boolean;
  deliveredAt?: string;
  channel?: string;
  dataJson?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

class NotificationApiService {
  private getCurrentUser() {
    try {
      const raw = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private getPrimaryRole(user: any): "CUSTOMER" | "ADMIN" | "EMPLOYEE" {
    const role =
      user?.userRole ||
      (Array.isArray(user?.roles) ? user.roles[0] : undefined) ||
      "CUSTOMER";
    const normalizedRole = String(role).toUpperCase();
    if (normalizedRole.includes("ADMIN")) return "ADMIN";
    if (normalizedRole.includes("EMPLOYEE")) return "EMPLOYEE";
    return "CUSTOMER";
  }

  private getCurrentUserId(user: any): string {
    return (
      user?.id ||
      user?.customerId ||
      user?.customerID ||
      user?.employeeId ||
      user?.employeeID ||
      user?.adminId ||
      user?.adminID ||
      ""
    );
  }

  private getAuthHeaders() {
    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
    const user = this.getCurrentUser();
    const role = this.getPrimaryRole(user);
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      "X-User-Id": this.getCurrentUserId(user),
      "X-User-Role": role,
    };
  }

  // Lấy danh sách notifications cho customer và employee
  async getMyNotifications(
    page = 0,
    size = 20,
  ): Promise<ApiResponse<{ content: BackendNotification[] }>> {
    try {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("❌ [API] No token found");
        return {
          success: false,
          message: "No authentication token",
          data: { content: [] },
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/notifications?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Error: ${response.status}`,
          data: { content: [] },
        };
      }

      const data = await response.json();

      // Extract content từ Spring Page
      const content = data?.data?.content ?? data?.content ?? data?.data ?? [];

      return {
        success: data.success,
        message: data.message,
        data: { content: Array.isArray(content) ? content : [] },
      };
    } catch (error) {
      console.error("API error fetching notifications:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: { content: [] },
      };
    }
  }

  // Lấy notifications chưa đọc cho customer và employee
  async getUnreadNotifications(): Promise<ApiResponse<BackendNotification[]>> {
    try {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
      if (!token) {
        console.error("[API] No token for unread notifications");
        return {
          success: false,
          message: "No authentication token",
          data: [],
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications/unread`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error("API failed to fetch unread notifications");
        return {
          success: false,
          message: `Error: ${response.status}`,
          data: [],
        };
      }

      const data = await response.json();

      return data;
    } catch (error) {
      console.error("[API] Error fetching unread notifications:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: [],
      };
    }
  }

  // Đếm notifications chưa đọc
  async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/unread/count`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw error;
    }
  }

  // Đánh dấu đã đọc
  async markAsRead(
    notificationId: string,
  ): Promise<ApiResponse<BackendNotification>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking as read:", error);
      throw error;
    }
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to mark all as read");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  }

  // Xóa notification
  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Tạo notification mới
  async createNotification(
    notification: Partial<BackendNotification>,
  ): Promise<ApiResponse<BackendNotification>> {
    try {
      const user = this.getCurrentUser();
      const role = this.getPrimaryRole(user);
      const payload = {
        fromUserId: this.getCurrentUserId(user),
        fromUserName: user?.fullName || user?.userName || user?.username,
        fromUserType: role,
        ...notification,
      };

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      console.log(
        "📡 API Response status:",
        response.status,
        response.statusText,
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create notification: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Convert Backend notification to Frontend format
  convertToFrontendFormat(backendNotif: BackendNotification): any {
    return {
      id: backendNotif.id,
      title: backendNotif.title,
      message: backendNotif.message,
      type: this.mapTypeToFrontend(backendNotif.type),
      timestamp: backendNotif.createdAt,
      read: backendNotif.isRead,
      userId: backendNotif.toUserId,
      actionUrl: undefined,
    };
  }

  private mapTypeToFrontend(
    type: string,
  ): "info" | "success" | "warning" | "error" {
    switch (type) {
      case "REQUEST":
        return "info";
      case "INFO":
        return "info";
      case "ALERT":
        return "warning";
      case "SYSTEM":
        return "error";
      default:
        return "info";
    }
  }
}

export const notificationApiService = new NotificationApiService();
export type { BackendNotification, ApiResponse };

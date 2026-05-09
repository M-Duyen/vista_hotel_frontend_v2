import { axiosInstance } from "../config/api";

const ENDPOINT = "/chat-support";

export interface ChatSessionDTO {
  id: string;
  sessionId: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  status: "waiting" | "active" | "resolved";
  assignedStaff?: {
    id: string;
    fullName: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  priority: "low" | "medium" | "high";
  aiHandoffReason?: string;
  createdAt: string;
}

export interface ChatMessageDTO {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: "customer" | "ai" | "staff";
  content: string;
  timestamp: string;
  isRead: boolean;
  showRoomCards?: boolean;
}

export const getStaffChats = async (
  staffId: string
): Promise<ChatSessionDTO[]> => {
  const response = await axiosInstance.get<ChatSessionDTO[]>(
    `${ENDPOINT}/staff/${staffId}/chats`
  );
  return response.data;
};

export const getPendingChats = async (): Promise<ChatSessionDTO[]> => {
  const response = await axiosInstance.get<ChatSessionDTO[]>(
    `${ENDPOINT}/pending`
  );
  return response.data;
};

export const getChatMessages = async (
  sessionId: string
): Promise<ChatMessageDTO[]> => {
  const response = await axiosInstance.get<ChatMessageDTO[]>(
    `${ENDPOINT}/chats/${sessionId}/messages`
  );
  return response.data;
};

export const sendStaffMessage = async (
  sessionId: string,
  content: string,
  staffId: string
): Promise<ChatMessageDTO> => {
  const response = await axiosInstance.post<ChatMessageDTO>(
    `${ENDPOINT}/chats/${sessionId}/messages`,
    {
      content,
      staffId,
    }
  );
  return response.data;
};

export const assignChatToStaff = async (
  sessionId: string,
  staffId: string,
  staffName: string
): Promise<void> => {
  await axiosInstance.post(`${ENDPOINT}/chats/${sessionId}/assign`, {
    staffId,
    staffName,
  });
};

export const getChatHistory = async (
  customerId: string
): Promise<ChatMessageDTO[]> => {
  const response = await axiosInstance.get<ChatMessageDTO[]>(
    `${ENDPOINT}/customers/${customerId}/history`
  );
  return response.data;
};

export const markChatAsResolved = async (sessionId: string): Promise<void> => {
  await axiosInstance.patch(`${ENDPOINT}/chats/${sessionId}/resolve`);
};

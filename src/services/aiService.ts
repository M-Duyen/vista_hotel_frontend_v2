import { axiosInstance } from "../config/api";

export interface AiChatRequest {
  userId: string;
  message: string;
}

export interface AiChatResponse {
  content: string;
  showRoomCards: boolean;
}

export interface MessageDTO {
  sender: string; // "user" or "assistant"
  content: string;
  timestamp: string; // ISO string
  showRoomCards: boolean;
}

export interface ChatHistoryItem {
  sessionId: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string; // ISO string
  messageCount: number;
}

// Default test userId
const DEFAULT_USER_ID = "user123";

const getUserId = (): string => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      return userData.id || DEFAULT_USER_ID;
    }
  } catch (error) {
    console.error("Error getting userId from localStorage:", error);
  }
  return DEFAULT_USER_ID;
};

export const getUserChatSessions = async (
  userId?: string
): Promise<ChatHistoryItem[]> => {
  const finalUserId = userId || getUserId();
  const response = await axiosInstance.get<ChatHistoryItem[]>(
    `/api/ai/chat/history/${finalUserId}`
  );
  return response.data;
};

export const getSessionMessages = async (
  userId: string | undefined,
  sessionId: string
): Promise<MessageDTO[]> => {
  const finalUserId = userId || getUserId();
  const response = await axiosInstance.get<MessageDTO[]>(
    `/api/ai/chat/session/${sessionId}/messages?userId=${finalUserId}`
  );
  return response.data;
};

export const sendChatMessage = async (
  userId: string | undefined,
  message: string
): Promise<AiChatResponse> => {
  const finalUserId = userId || getUserId();
  const response = await axiosInstance.post<AiChatResponse>("/api/ai/chat", {
    userId: finalUserId,
    message,
  });
  return response.data;
};

export const startNewChat = async (userId?: string): Promise<string> => {
  const finalUserId = userId || getUserId();
  const response = await axiosInstance.post<{ sessionId: string }>(
    `/api/ai/chat/new?userId=${finalUserId}`
  );
  return response.data.sessionId;
};

export const deleteChatSession = async (
  userId: string | undefined,
  sessionId: string
): Promise<void> => {
  const finalUserId = userId || getUserId();
  await axiosInstance.delete(
    `/api/ai/chat/session/${sessionId}?userId=${finalUserId}`
  );
};

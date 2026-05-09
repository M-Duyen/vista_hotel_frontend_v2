import { axiosInstance } from "../config/api";

export interface AiChatRequest {
  userId: string;
  message: string;
}

export interface AiChatResponse {
  content: string;
  showRoomCards: boolean;
}

export interface ChatHistoryItem {
  sessionId: string;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

export const getUserChatSessions = async (
  userId: string
): Promise<ChatHistoryItem[]> => {
  const response = await axiosInstance.get<ChatHistoryItem[]>(
    `/ai/chat/history/${userId}`
  );
  return response.data;
};

export const getSessionMessages = async (
  userId: string,
  sessionId: string
): Promise<AiChatResponse[]> => {
  const response = await axiosInstance.get(
    `/ai/chat/session/${sessionId}/messages?userId=${userId}`
  );
  return response.data;
};

export const sendChatMessage = async (
  userId: string,
  message: string
): Promise<AiChatResponse> => {
  const response = await axiosInstance.post<AiChatResponse>("/ai/chat", {
    userId,
    message,
  });
  return response.data;
};

export const startNewChat = async (userId: string): Promise<string> => {
  const response = await axiosInstance.post<{ sessionId: string }>(
    `/ai/chat/new?userId=${userId}`
  );
  return response.data.sessionId;
};

export const deleteChatSession = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  await axiosInstance.delete(`/ai/chat/session/${sessionId}?userId=${userId}`);
};

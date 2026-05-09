import {api} from "./apiClient";

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

export const sendEmail = async (payload: EmailPayload) => {
    try {
        const response = await api.post('/email/send', payload);
        return response.data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
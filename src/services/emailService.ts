import { emailApi } from "./apiClient";
import {
  voucherAssignedEmailTemplate,
  type VoucherEmailTemplateData,
} from "../utils/emailTemplates/voucherEmails";

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

export const sendEmail = async (payload: EmailPayload) => {
    try {
        const response = await emailApi.post('/send', payload);
        return response.data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

export const sendVoucherAssignedEmail = async (
  to: string,
  data: VoucherEmailTemplateData,
) => {
  return sendEmail({
    to,
    subject: "Your Vista Hotel voucher is ready",
    htmlContent: voucherAssignedEmailTemplate(data),
  });
};

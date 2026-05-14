import { api } from "./apiClient";

const ENDPOINT = "/payments";

export const generateQRPayment = async (
  bookingId: string,
  choice: number = 0,
) => {
  try {
    const response = await api.get(`${ENDPOINT}/payment-qr/${bookingId}`, {
      params: { choice },
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error generating QR payment:", error);
    throw error;
  }
};

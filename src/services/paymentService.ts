import { paymentsApi } from "./apiClient";

export const generateQRPayment = async (
  bookingId: string,
  choice: number = 0,
) => {
  try {
    const response = await paymentsApi.get(`/payment-qr/${bookingId}`, {
      params: { choice },
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error generating QR payment:", error);
    throw error;
  }
};

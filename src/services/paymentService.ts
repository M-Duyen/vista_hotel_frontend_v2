import { axiosInstance } from "../config/api";

export const getPaymentQRCode = async (bookingId: string): Promise<string> => {
  try {
    const response = await axiosInstance.get(
      `/bookings/payment-qr-checkout/${bookingId}`,
      {
        responseType: "blob",
      }
    );

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error fetching payment QR code:", error);
    throw error;
  }
};

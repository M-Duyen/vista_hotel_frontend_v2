/* eslint-disable */
import ModalContainer from "./ModalContainer";
import { sendEmail, type EmailPayload } from "../../services/emailService";
import { bookingReceipt } from "../../utils/emailTemplates/authEmails";

export default function PaymentSuccessModal({
  paymentData,
  onClose,
}: {
  paymentData: any;
  onClose: () => void;
}) {
  const formatCurrency = (amount: number | string): string => {
    const numAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
        : amount;
    return new Intl.NumberFormat("vi-VN").format(numAmount);
  };

  const handleEmailReceipt = async () => {
    try {
      const emailData: EmailPayload = {
        to: paymentData.guestEmail,
        subject: `Payment Receipt - Booking ${paymentData.bookingId}`,
        htmlContent: `
                    <h2>Payment Receipt</h2>
                    <p>Dear ${paymentData.guestName},</p>
                    <p>Thank you for your payment.</p>
                    <h3>Payment Details:</h3>
                    <ul>
                        <li>Booking ID: ${paymentData.bookingId}</li>
                        <li>Room: ${paymentData.roomNumber}</li>
                        <li>Amount Paid: ${formatCurrency(
                          paymentData.balanceDue
                        )} VND</li>
                        <li>Payment Method: ${paymentData.paymentMethod}</li>
                        <li>Date: ${new Date().toLocaleString("vi-VN")}</li>
                    </ul>
                    <p>We hope you enjoyed your stay at Vista Hotel!</p>
                `,
      };

      await sendEmail(emailData);
      alert("Receipt has been emailed to the guest.");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email receipt.");
    }
  };

  const handlePrintReceipt = () => {
    // Tạo nội dung HTML cho hóa đơn
    const receiptHTML = bookingReceipt(paymentData);

    // Tạo cửa sổ mới để in
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();

      // Đợi nội dung load xong rồi mới in
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Tự động đóng cửa sổ sau khi in (hoặc hủy in)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    } else {
      alert(
        "Không thể mở cửa sổ in. Vui lòng kiểm tra trình duyệt có chặn popup không."
      );
    }
  };

  return (
    <ModalContainer title="Payment Successful" onClose={onClose}>
      <div className="px-6 py-8 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check-circle text-4xl"></i>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-green-600">
            Check-out Complete!
          </h3>
          <p className="mb-4 text-gray-700">
            Payment of{" "}
            <span className="font-semibold text-[#c9b8a8]">
              {formatCurrency(paymentData.balanceDue)} VND
            </span>{" "}
            has been successfully processed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="mb-1">
              Booking: <strong>{paymentData.bookingId}</strong>
            </p>
            <p className="mb-1">
              Guest: <strong>{paymentData.guestName}</strong>
            </p>
            <p>
              Room: <strong>{paymentData.roomNumber}</strong>
            </p>
            <p>
              Payment Method:{" "}
              <strong className="capitalize">
                {paymentData.paymentMethod}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleEmailReceipt}
            className="px-5 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium"
          >
            <i className="fas fa-envelope"></i> Email Receipt
          </button>
          <button
            onClick={handlePrintReceipt}
            className="px-5 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium"
          >
            <i className="fas fa-print"></i> Print Receipt
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 flex justify-center">
        <button
          onClick={onClose}
          className="px-8 py-2.5 bg-[#c9b8a8] text-white rounded-md hover:bg-[#b8a896] transition font-medium"
        >
          Done
        </button>
      </div>
    </ModalContainer>
  );
}

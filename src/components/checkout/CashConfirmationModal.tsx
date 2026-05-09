/* eslint-disable */
import ModalContainer from "./ModalContainer";

export default function CashConfirmationModal({
  paymentData,
  onClose,
  onConfirm,
}: {
  paymentData: any;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const formatCurrency = (amount: number | string): string => {
    if (!amount || amount === "") return "0";

    const numAmount =
      typeof amount === "string"
        ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
        : amount;

    if (isNaN(numAmount)) return "0";

    return new Intl.NumberFormat("vi-VN").format(numAmount);
  };

  return (
    <ModalContainer title="Confirm Cash Payment" onClose={onClose}>
      <div className="px-6 py-8 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-money-bill-wave text-3xl"></i>
        </div>

        <div>
          <p className="mb-3 text-gray-600">
            Please confirm that you have received:
          </p>
          <h3 className="text-2xl font-semibold mb-4 text-[#c9b8a8]">
            {formatCurrency(paymentData.amountTendered)} VND
          </h3>
          <p className="mb-1">
            For booking: <strong>{paymentData.bookingId}</strong>
          </p>
          <p>
            Change to return:{" "}
            <strong className="text-green-600">
              {formatCurrency(paymentData.changeAmount)} VND
            </strong>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2.5 bg-[#c9b8a8] text-white rounded-md hover:bg-[#b8a896] transition font-medium"
        >
          Confirm Receipt
        </button>
      </div>
    </ModalContainer>
  );
}

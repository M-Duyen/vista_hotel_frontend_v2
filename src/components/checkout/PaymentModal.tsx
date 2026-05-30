/* eslint-disable */
import { useState, useEffect, useRef } from "react";
import ModalContainer from "./ModalContainer";
import {
  getBookingById,
  getCheckoutBalance,
  processCheckout,
} from "../../services/bookingService";
import { generateQRPayment } from "../../services/paymentService";

interface BookingService {
  bookingServiceID: string;
  service: {
    serviceID: string;
    serviceName: string;
    price: number;
  };
  quantity: number;
  totalAmount: number;
}

interface BookingDetail {
  roomNumber?: string;
  room: {
    roomNumber?: string;
    roomType?: {
      typeName?: string;
      roomTypeName?: string;
      basePrice?: number;
    } | null;
  } | null;
  roomPrice: number;
}

export default function PaymentModal({
  paymentData,
  onClose,
  onConfirmPayment,
}: {
  paymentData: any;
  onClose: () => void;
  onConfirmPayment: (
    method: string,
    amountTendered?: string,
    changeAmount?: string,
    notes?: string,
  ) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [changeAmount, setChangeAmount] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const [booking, setBooking] = useState<any>(null);
  const [checkoutBalance, setCheckoutBalance] = useState<any>(null);

  const [bookingServices, setBookingServices] = useState<BookingService[]>([]);
  const [bookingDetails, setBookingDetails] = useState<BookingDetail[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [initialPaymentStatus, setInitialPaymentStatus] = useState<string>("");

  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [checklist, setChecklist] = useState({
    roomKeys: false,
    roomInspected: false,
    minibarChecked: false,
    luggageAssistance: false,
    feedbackRequested: false,
  });

  useEffect(() => {
    fetchBookingData();
  }, [paymentData.bookingId]);

  const fetchBookingData = async () => {
    if (!paymentData.bookingId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const bookingData = await getBookingById(paymentData.bookingId);
      const balanceData = await getCheckoutBalance(paymentData.bookingId);

      setBooking(bookingData);
      setCheckoutBalance(balanceData);

      setInitialPaymentStatus(
        bookingData?.paymentStatus || paymentData.paymentStatus,
      );

      if (bookingData?.bookingDetails) {
        setBookingDetails(bookingData.bookingDetails as any);
      }

      setBookingServices([]);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching booking data:", error);
      setBookingServices([]);
      setLoading(false);
    }
  };

  const calculateRoomCharges = () => {
    return bookingDetails.reduce((sum, detail) => sum + (detail.roomPrice || 0), 0);
  };

  const calculateServiceCharges = () => {
    return bookingServices.reduce(
      (sum, service) => sum + service.totalAmount,
      0,
    );
  };

  const roomCharges = calculateRoomCharges();
  const serviceCharges = calculateServiceCharges();
  const total = Number(
    checkoutBalance?.totalAmount || booking?.totalAmount || 0,
  );

  const calculatePrepaidAmount = () => {
    return Number(checkoutBalance?.paidAmount || 0);
  };

  const prepaidAmount = calculatePrepaidAmount();
  const balanceDue = Number(
    checkoutBalance?.remainingAmount ?? Math.max(0, total - prepaidAmount),
  );

  useEffect(() => {
    if (paymentMethod === "vnpay" && balanceDue > 0 && !loading) {
      generateVNPayQR();
    }
  }, [paymentMethod, balanceDue, loading]);

  const generateVNPayQR = async () => {
    try {
      const blob = await generateQRPayment(paymentData.bookingId, 4);

      if (qrCodeUrl && qrCodeUrl.startsWith("blob:")) {
        URL.revokeObjectURL(qrCodeUrl);
      }

      const objectUrl = URL.createObjectURL(blob);
      setQrCodeUrl(objectUrl);

      stopPaymentPolling();
      startPaymentPolling();
    } catch (error) {
      console.error("Error generating QR code:", error);
      setQrCodeUrl("");
    }
  };

  const startPaymentPolling = async () => {
    const maxAttempts = 60;
    const delayMs = 1000;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        stopPaymentPolling();
        return;
      }

      try {
        const refreshed = await getBookingById(paymentData.bookingId);
        const currentStatus = refreshed?.paymentStatus;

        console.log(
          `[Attempt ${attempts + 1}] Current status: ${currentStatus}`,
        );

        const hasStatusChanged = currentStatus !== initialPaymentStatus;

        const isPaid =
          currentStatus === "PAID" || currentStatus === "COMPLETED";

        const isPartiallyPaid =
          currentStatus === "PERCENTAGE_30" ||
          currentStatus === "PERCENTAGE_50";

        if (hasStatusChanged && (isPaid || isPartiallyPaid)) {
          setPaymentConfirmed(true);
          stopPaymentPolling();

          setTimeout(() => {
            handleConfirmPayment();
          }, 2000);
          return;
        }

        if (!hasStatusChanged && isPaid && balanceDue === 0) {
          setPaymentConfirmed(true);
          stopPaymentPolling();
          return;
        }

        attempts++;
        pollingRef.current = setTimeout(poll, delayMs);
      } catch (error) {
        attempts++;
        pollingRef.current = setTimeout(poll, delayMs);
      }
    };

    poll();
  };

  const stopPaymentPolling = () => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPaymentPolling();
      if (qrCodeUrl && qrCodeUrl.startsWith("blob:")) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [qrCodeUrl]);

  const handlePaymentMethodChange = (method: string) => {
    if (paymentMethod === "vnpay") {
      stopPaymentPolling();
      setPaymentConfirmed(false);
    }
    setPaymentMethod(method);
  };

  const handleAmountTenderedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // Remove all non-digit characters
    const value = e.target.value.replace(/[^0-9]/g, "");

    // Store the raw number value
    setAmountTendered(value);

    try {
      const tendered = parseFloat(value) || 0;
      // Ensure balanceDue is a valid number
      const balance =
        typeof balanceDue === "number" && !isNaN(balanceDue) ? balanceDue : 0;

      if (tendered > 0 && tendered >= balance) {
        const change = tendered - balance;
        console.log("Change calculated:", change);
        setChangeAmount(formatCurrency(change));
      } else {
        console.log("Not enough money or zero input");
        setChangeAmount("0");
      }
    } catch (error) {
      console.error("Error calculating change:", error);
      setChangeAmount("0");
    }
  };

  // Format amount tendered for display
  const formatAmountTenderedDisplay = (value: string): string => {
    if (!value) return "";
    return formatCurrency(parseFloat(value));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(amount));
  };

  const getDetailRoomNumber = (detail: BookingDetail) =>
    detail.room?.roomNumber ?? detail.roomNumber ?? "N/A";

  const getDetailRoomType = (detail: BookingDetail) =>
    detail.room?.roomType?.typeName ??
    detail.room?.roomType?.roomTypeName ??
    "N/A";

  const handleChecklistChange = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmPayment = async () => {
    try {
      setIsProcessingCheckout(true);

      if (paymentMethod === "cash") {
        onConfirmPayment(paymentMethod, amountTendered, changeAmount, notes);
        return;
      }

      if (paymentMethod === "vnpay") {
        await processCheckout(paymentData.bookingId, "vnpay");
      } else {
        await processCheckout(paymentData.bookingId, "transfer");
      }

      onConfirmPayment(paymentMethod, amountTendered, changeAmount, notes);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <ModalContainer title="Process Payment" onClose={onClose}>
      <div className="max-h-[70vh] overflow-y-auto px-6">
        {/* Guest Header */}
        <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-cream pb-6">
          <div className="flex items-center gap-4">
            <img
              src={paymentData.guestImage || "/default-avatar.png"}
              alt="Guest Photo"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xl font-semibold mb-1">
                {paymentData.guestName}
              </h3>
              <p className="text-sm text-gray-600">
                <i className="fas fa-envelope mr-2"></i>
                {paymentData.guestEmail}
              </p>
              <p className="text-sm text-gray-600">
                <i className="fas fa-phone mr-2"></i>
                {paymentData.guestPhone}
              </p>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <div className="mb-2">
              <span className="text-sm text-gray-500 block">Booking ID</span>
              <span className="font-semibold">{paymentData.bookingId}</span>
            </div>
            <div className="mb-2">
              <span className="text-sm text-gray-500 block">Booking Type</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  paymentData.bookingType === "DAILY"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {paymentData.bookingType}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Room(s)</span>
              <span className="font-semibold">
                {bookingDetails.map((d) => getDetailRoomNumber(d)).join(", ") ||
                  "Loading..."}
              </span>
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-file-invoice-dollar"></i> Bill Summary
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-light">
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Room Charges - CHỈ HIỂN thị, không dùng để tính tổng */}
                  {bookingDetails.map((detail, index) => (
                    <tr key={index} className="border-b border-cream">
                      <td className="py-2 px-4">
                        {getDetailRoomType(detail)} - Room{" "}
                        {getDetailRoomNumber(detail)}
                        {paymentData.bookingType === "HOURLY" && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({paymentData.duration}h)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {formatCurrency(detail.roomPrice)} VND
                      </td>
                    </tr>
                  ))}

                  {/* Service Charges */}
                  {bookingServices.length > 0 &&
                    bookingServices.map((service, index) => (
                      <tr key={index} className="border-b border-cream">
                        <td className="py-2 px-4">
                          {service.service.serviceName}
                          {service.quantity > 1 && (
                            <span className="text-xs text-gray-500 ml-2">
                              (x{service.quantity})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-right">
                          {formatCurrency(service.totalAmount)} VND
                        </td>
                      </tr>
                    ))}

                  {roomCharges + serviceCharges > 0 && (
                    <tr className="border-b border-cream">
                      <td className="py-2 px-4 font-medium text-gray-600 text-sm">
                        Subtotal (Room + Services)
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-gray-600 text-sm">
                        {formatCurrency(roomCharges + serviceCharges)} VND
                      </td>
                    </tr>
                  )}

                  {booking &&
                    roomCharges + serviceCharges !== booking.totalAmount && (
                      <tr className="border-b border-cream text-green-600">
                        <td className="py-2 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span>Discount/Adjustment</span>
                            <i
                              className="fas fa-info-circle text-xs"
                              title="Promotions, vouchers, or dynamic pricing applied"
                            ></i>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right text-sm">
                          -
                          {formatCurrency(
                            Math.abs(
                              booking.totalAmount -
                                (roomCharges + serviceCharges),
                            ),
                          )}{" "}
                          VND
                        </td>
                      </tr>
                    )}

                  <tr className="border-b border-cream bg-light font-semibold">
                    <td className="py-3 px-4">Total Amount</td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(total)} VND
                    </td>
                  </tr>

                  {/* Prepaid Amount */}
                  {prepaidAmount > 0 && (
                    <>
                      <tr className="border-b border-cream text-green-600">
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <span>Prepaid Amount</span>
                            <i className="fas fa-check-circle text-xs"></i>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right">
                          -{formatCurrency(prepaidAmount)} VND
                        </td>
                      </tr>

                      {/* Payment Progress */}
                      <tr className="border-b border-cream bg-green-50/30">
                        <td colSpan={2} className="py-3 px-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Payment Progress</span>
                              <span className="font-semibold">
                                {((prepaidAmount / total) * 100).toFixed(0)}%
                                completed
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(prepaidAmount / total) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600 font-medium">
                                ✓ {formatCurrency(prepaidAmount)} VND paid
                              </span>
                              <span className="text-amber-600 font-medium">
                                {formatCurrency(balanceDue)} VND remaining
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Balance Due */}
                  <tr className="font-bold text-lg">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>Balance Due</span>
                        {balanceDue > 0 && (
                          <span
                            className="text-amber-500 text-sm"
                            title="Payment required"
                          >
                            <i className="fas fa-exclamation-triangle"></i>
                          </span>
                        )}
                        {balanceDue === 0 && (
                          <span
                            className="text-green-500 text-sm"
                            title="Fully paid"
                          >
                            <i className="fas fa-check-circle"></i>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={
                          balanceDue > 0 ? "text-[#c9b8a8]" : "text-green-600"
                        }
                      >
                        {formatCurrency(balanceDue)} VND
                      </span>
                    </td>
                  </tr>

                  {balanceDue === 0 && (
                    <tr>
                      <td colSpan={2} className="py-2 px-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <i className="fas fa-check-circle text-green-600 mr-2"></i>
                          <span className="text-sm text-green-700 font-medium">
                            All payments completed. Ready for checkout!
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-credit-card"></i> Payment Method
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* Cash */}
            <div
              className={`border rounded-md p-4 cursor-pointer transition ${
                paymentMethod === "cash"
                  ? "border-[#c9b8a8] bg-[#c9b8a8]/10 ring-2 ring-[#c9b8a8]"
                  : "border-gray-300 hover:border-[#c9b8a8]"
              }`}
              onClick={() => handlePaymentMethodChange("cash")}
            >
              <label className="flex flex-col items-center cursor-pointer">
                <i className="fas fa-money-bill-wave text-2xl mb-2 text-[#c9b8a8]"></i>
                <span className="font-medium">Cash</span>
              </label>
            </div>

            {/* VNPay QR */}
            <div
              className={`border rounded-md p-4 cursor-pointer transition ${
                paymentMethod === "vnpay"
                  ? "border-[#c9b8a8] bg-[#c9b8a8]/10 ring-2 ring-[#c9b8a8]"
                  : "border-gray-300 hover:border-[#c9b8a8]"
              }`}
              onClick={() => handlePaymentMethodChange("vnpay")}
            >
              <label className="flex flex-col items-center cursor-pointer">
                <i className="fas fa-qrcode text-2xl mb-2 text-[#c9b8a8]"></i>
                <span className="font-medium">VNPay QR</span>
              </label>
            </div>

            {/* Bank Transfer */}
            <div
              className={`border rounded-md p-4 cursor-pointer transition ${
                paymentMethod === "transfer"
                  ? "border-[#c9b8a8] bg-[#c9b8a8]/10 ring-2 ring-[#c9b8a8]"
                  : "border-gray-300 hover:border-[#c9b8a8]"
              }`}
              onClick={() => handlePaymentMethodChange("transfer")}
            >
              <label className="flex flex-col items-center cursor-pointer">
                <i className="fas fa-exchange-alt text-2xl mb-2 text-[#c9b8a8]"></i>
                <span className="font-medium">Bank Transfer</span>
              </label>
            </div>
          </div>

          {/* Cash Payment Section */}
          {paymentMethod === "cash" && (
            <div className="space-y-4 border border-gray-300 rounded-md p-4 bg-gray-50">
              <div>
                <label className="block mb-2 font-medium text-sm">
                  Amount Tendered (VND)
                </label>
                <input
                  type="text"
                  value={formatAmountTenderedDisplay(amountTendered)}
                  onChange={handleAmountTenderedChange}
                  placeholder={formatCurrency(balanceDue)}
                  disabled={loading || balanceDue === 0}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c9b8a8] focus:border-transparent disabled:bg-gray-200 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Balance due: {formatCurrency(balanceDue)} VND
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm">
                  Change (VND)
                </label>
                <input
                  type="text"
                  value={changeAmount}
                  disabled
                  className="w-full p-3 border border-gray-300 bg-gray-100 rounded-md text-gray-700 font-semibold"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c9b8a8] focus:border-transparent"
                  rows={3}
                  placeholder="Enter any additional notes..."
                ></textarea>
              </div>
            </div>
          )}

          {/* VNPay QR Section */}
          {paymentMethod === "vnpay" && (
            <div className="border border-gray-300 rounded-md p-6 bg-gray-50">
              {paymentConfirmed && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-green-600">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">
                        Payment Confirmed!
                      </h4>
                      <p className="text-sm text-green-700">
                        Your payment has been received. Processing checkout...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6">
                <div className="mx-auto md:mx-0">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="VNPay QR Code"
                      className="w-56 h-56 object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-gray-200 rounded-lg flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-3 text-[#c9b8a8]">
                    Scan to Pay
                  </h4>
                  <ol className="space-y-2 mb-4 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-[#c9b8a8] font-bold">1.</span>
                      <span>
                        Open your banking app (VNPay, VietcomBank, etc.)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c9b8a8] font-bold">2.</span>
                      <span>Scan this QR code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c9b8a8] font-bold">3.</span>
                      <span>
                        Confirm payment of{" "}
                        <strong className="text-[#c9b8a8]">
                          {formatCurrency(balanceDue)} VND
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#c9b8a8] font-bold">4.</span>
                      <span>Payment will be automatically confirmed</span>
                    </li>
                  </ol>

                  <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <i className="fas fa-info-circle mr-2"></i>
                      Transfer content:{" "}
                      <strong>
                        Thanh toan booking {paymentData.bookingId}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {!paymentConfirmed && (
                <div className="mt-4 p-3 bg-yellow-50 text-amber-600 rounded-md flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Waiting for payment confirmation...</span>
                </div>
              )}
            </div>
          )}

          {/* Bank Transfer Section */}
          {paymentMethod === "transfer" && (
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <h4 className="font-semibold mb-4 text-[#c9b8a8]">
                Bank Transfer Details
              </h4>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Bank Name:</span>
                  <span className="font-medium">Vietcombank</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Account Name:</span>
                  <span className="font-medium">VISTA HOTEL JSC</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">1029384756</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("1029384756");
                        alert("Account number copied!");
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <i className="fas fa-copy text-[#c9b8a8]"></i>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Transfer Content:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{paymentData.bookingId}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentData.bookingId);
                        alert("Booking ID copied!");
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition"
                    >
                      <i className="fas fa-copy text-[#c9b8a8]"></i>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-[#c9b8a8]">
                    {formatCurrency(balanceDue)} VND
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-sm">
                  Transfer Reference Number
                </label>
                <input
                  type="text"
                  placeholder="Enter bank transfer reference"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c9b8a8] focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Check-out Checklist */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-clipboard-check"></i> Check-out Checklist
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(checklist).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={key}
                  checked={value}
                  onChange={() =>
                    handleChecklistChange(key as keyof typeof checklist)
                  }
                  className="w-5 h-5 rounded accent-[#c9b8a8]"
                />
                <label htmlFor={key} className="cursor-pointer capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isProcessingCheckout}
          className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmPayment}
          disabled={
            isProcessingCheckout ||
            (paymentMethod === "cash" && !amountTendered) ||
            (paymentMethod === "vnpay" && !paymentConfirmed) ||
            !Object.values(checklist).every((v) => v)
          }
          className="px-5 py-2.5 bg-[#c9b8a8] text-white rounded-md hover:bg-[#b8a896] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isProcessingCheckout && <i className="fas fa-spinner fa-spin"></i>}
          {isProcessingCheckout
            ? "Processing..."
            : paymentMethod === "vnpay" && paymentConfirmed
              ? "Complete Check-out"
              : "Complete Check-out"}
        </button>
      </div>
    </ModalContainer>
  );
}

import { motion } from "framer-motion";
import {
  FaPercentage,
  FaGift,
  FaCheckCircle,
  FaClock,
  FaCopy,
  FaCalendarAlt,
} from "react-icons/fa";
import type { Voucher } from "../../types/Voucher";

interface VoucherCardProps {
  voucher: Voucher;
  index: number;
  status: "active" | "expiring" | "expired";
  label: string;
  copiedCode: string;
  onCopy: (code: string) => void;
}

const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  index,
  status,
  label,
  copiedCode,
  onCopy,
}) => {
  const gradientClass =
    status === "expired"
      ? "from-gray-400 to-gray-500"
      : status === "expiring"
      ? "from-warning to-danger"
      : "from-[#ebe3d7] to-[#d4c4a8]";

  return (
    <motion.div
      key={`${voucher.voucherId}-${index}`}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className="relative cursor-pointer">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#CCBDA3]">
          <div className="flex flex-col sm:flex-row">
            {/* Left Side - Compact Discount */}
            <div
              className={`bg-gradient-to-br ${gradientClass} p-3 sm:p-4 sm:w-36 flex flex-col justify-center items-center text-white relative overflow-hidden shadow-sm`}
            >
              <div className="text-center relative z-10">
                {voucher.discountType === "PERCENT" ? (
                  <>
                    <div className="flex items-center justify-center mb-1">
                      <span className="text-2xl sm:text-3xl font-black">
                        {voucher.discountPercentage}
                      </span>
                      <FaPercentage className="text-base sm:text-lg ml-1 mb-1" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold tracking-wide">
                      OFF
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg sm:text-xl font-black mb-1">
                      {voucher.discountValue?.toLocaleString()}đ
                    </div>
                    <div className="text-xs font-bold tracking-wide">
                      DISCOUNT
                    </div>
                  </>
                )}
              </div>

              {/* Punch holes */}
              <div className="absolute -right-2 sm:-right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-inner"></div>
              <div className="absolute -left-2 sm:-left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-inner"></div>
            </div>

            {/* Right Side - Details */}
            <div className="flex-1 p-3 sm:p-4 bg-gradient-to-br from-cream/10 to-transparent">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1 group-hover:text-[#C3923C] transition-colors line-clamp-1">
                    {voucher.voucherName}
                  </h3>
                  <div className="flex items-center gap-2">
                    {status === "active" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <FaCheckCircle className="text-xs" />
                        Active
                      </span>
                    )}
                    {status === "expiring" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold animate-pulse">
                        <FaClock className="text-xs" />
                        {label}
                      </span>
                    )}
                    {status === "expired" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        Expired
                      </span>
                    )}
                  </div>
                </div>
                <FaGift className="text-base sm:text-lg text-[#CCBDA3] group-hover:text-[#C3923C] transition-colors flex-shrink-0" />
              </div>

              {/* Voucher Code */}
              <div className="mb-2 sm:mb-3">
                <label className="text-xs font-semibold text-gray-600 mb-1 block uppercase tracking-wide">
                  Voucher Code
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F5F0EB] border border-[#CCBDA3]/40 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm min-w-0">
                    <code className="text-sm sm:text-base font-mono font-bold text-[#C3923C] tracking-wide truncate block">
                      {voucher.voucherId}
                    </code>
                  </div>
                  <button
                    onClick={() => onCopy(voucher.voucherId)}
                    className={`cursor-pointer p-2 rounded-lg transition-all duration-300 shadow-sm flex-shrink-0 ${
                      copiedCode === voucher.voucherId
                        ? "bg-success text-white"
                        : "bg-[#CCBDA3] text-white hover:bg-[#C3923C]"
                    }`}
                    title="Copy code"
                  >
                    {copiedCode === voucher.voucherId ? (
                      <FaCheckCircle className="text-sm" />
                    ) : (
                      <FaCopy className="text-sm" />
                    )}
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs text-gray-600 mb-2 sm:mb-3 bg-[#F5F0EB] rounded-lg py-1.5 px-2 flex-wrap">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <FaCalendarAlt className="text-[#ccbda3] text-xs sm:text-sm" />
                  <span className="font-semibold">
                    {new Date(voucher.startDate).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <span className="text-gold font-bold">→</span>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <FaCalendarAlt className="text-[#ccbda3] text-xs sm:text-sm" />
                  <span
                    className={
                      status === "expiring"
                        ? "text-orange-600 font-bold"
                        : "font-semibold"
                    }
                  >
                    {new Date(voucher.endDate).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={status === "expired"}
                className={`cursor-pointer w-full py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 shadow-sm ${
                  status === "expired"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#CCBDA3] text-white hover:bg-[#C3923C] hover:shadow-md"
                }`}
              >
                {status === "expired" ? "Expired" : "Use This Voucher"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VoucherCard;

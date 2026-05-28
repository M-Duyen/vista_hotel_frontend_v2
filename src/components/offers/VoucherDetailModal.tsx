import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Voucher } from "../../types/Voucher";

interface VoucherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
  isSaved: boolean;
  isSaving: boolean;
  isExpired: boolean;
  statusLabel: string;
  onCopy: (code: string) => void;
  onSave: (voucher: Voucher) => void;
}

const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  isOpen,
  onClose,
  voucher,
  isSaved,
  isSaving,
  isExpired,
  statusLabel,
  onCopy,
  onSave,
}) => {
  if (!isOpen || !voucher) return null;

  const formatDiscount = (current: Voucher) =>
    current.discountType === "PERCENT"
      ? `${current.discountPercentage || 0}%`
      : `${current.discountValue?.toLocaleString() || 0}đ`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-white px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    Voucher Detail
                  </p>
                  <h3 className="text-2xl font-serif font-bold text-gray-900">
                    {voucher.voucherName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-full border border-gray-300 px-3 py-1 text-xs uppercase tracking-wide hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-xl border border-[#eadfce] bg-[#f8f2ea] p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Voucher Code
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-[#6b5e4c]">
                    {voucher.voucherId}
                  </p>
                  <button
                    type="button"
                    onClick={() => onCopy(voucher.voucherId)}
                    className="cursor-pointer rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6b5e4c] shadow"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Discount
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDiscount(voucher)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {statusLabel}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Validity
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                  <span>
                    {new Date(voucher.startDate).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="text-[#6b5e4c]">→</span>
                  <span>
                    {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={`w-full rounded-xl py-3 text-sm font-semibold text-white shadow transition-all duration-300 ${
                  isSaved || isSaving || isExpired
                    ? "bg-gray-400 cursor-not-allowed opacity-75"
                    : "bg-[#6b5e4c] hover:bg-[#5a4d3e] cursor-pointer hover:shadow-md"
                }`}
                onClick={() => onSave(voucher)}
                disabled={isSaved || isSaving || isExpired}
              >
                {isExpired
                  ? "Expired"
                  : isSaved
                    ? "Saved"
                    : isSaving
                      ? "Saving..."
                      : "Save Voucher"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoucherDetailModal;

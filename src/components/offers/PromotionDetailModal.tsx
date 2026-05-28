import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Promotion } from "../../types/Promotion";

interface PromotionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  isLoading?: boolean;
  roomTypeNameById?: Record<string, string>;
}

const PromotionDetailModal: React.FC<PromotionDetailModalProps> = ({
  isOpen,
  onClose,
  promotion,
  isLoading,
  roomTypeNameById,
}) => {
  if (!isOpen || !promotion) return null;

  const getRoomTypeLabel = (
    rtp: NonNullable<Promotion["roomTypePromotion"]>[number],
  ) => {
    const roomTypeId =
      rtp.roomType?.roomTypeID ||
      (rtp.roomType as { roomTypeId?: string })?.roomTypeId ||
      (rtp as { roomTypeId?: string })?.roomTypeId ||
      (rtp as { id?: { roomTypeId?: string } })?.id?.roomTypeId ||
      "";

    return (
      rtp.roomType?.typeName ||
      (rtp.roomType as { roomTypeName?: string })?.roomTypeName ||
      (rtp.roomType as { name?: string })?.name ||
      (rtp as { roomTypeName?: string })?.roomTypeName ||
      (roomTypeId && roomTypeNameById?.[roomTypeId]) ||
      roomTypeId ||
      "Room Type"
    );
  };

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
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-white px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    Promotion Detail
                  </p>
                  <h3 className="text-2xl font-serif font-bold text-gray-900">
                    {promotion.promotionName}
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
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-[#eadfce] bg-[#f8f2ea] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Discount Type
                  </p>
                  <p className="text-lg font-semibold text-[#6b5e4c]">
                    {promotion.discountType}
                  </p>
                </div>
                <div className="rounded-xl border border-[#eadfce] bg-[#f8f2ea] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <p className="text-lg font-semibold text-[#6b5e4c]">
                    {promotion.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#eadfce] bg-[#f8f2ea] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Promotion Code
                  </p>
                  <p className="text-lg font-semibold text-[#6b5e4c]">
                    {promotion.promotionID}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Description
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {promotion.description ||
                    "This promotion is crafted to deliver extra value for your stay."}
                </p>
              </div>

              <div>
                <h4 className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-3">
                  Applies To Room Types
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isLoading && (
                    <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                      Loading room type details...
                    </div>
                  )}
                  {(promotion.roomTypePromotion || []).map((rtp, idx) => (
                    <div
                      key={`${promotion.promotionID}-${idx}`}
                      className="rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {getRoomTypeLabel(rtp)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Discount: {rtp.discountValue}
                        {promotion.discountType === "PERCENT" ? "%" : "đ"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rtp.startDate || ""} - {rtp.endDate || ""}
                      </p>
                    </div>
                  ))}
                  {!isLoading &&
                    (!promotion.roomTypePromotion ||
                      promotion.roomTypePromotion.length === 0) && (
                      <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                        No room type details available.
                      </div>
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionDetailModal;

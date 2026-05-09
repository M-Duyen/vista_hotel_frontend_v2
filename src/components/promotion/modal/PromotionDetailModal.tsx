import React from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaPercentage,
  FaDollarSign,
  FaTag,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import type { Promotion } from "../../../types/Promotion";
import { formatVND } from "../../../utils/formatters";

interface PromotionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion | null;
}

const PromotionDetailModal: React.FC<PromotionDetailModalProps> = ({
  isOpen,
  onClose,
  promotion,
}) => {
  if (!promotion) return null;

  const getPromotionTypeName = (
    promotionType: Promotion["promotionType"]
  ): string => {
    if (typeof promotionType === "string") {
      return promotionType;
    }
    return promotionType?.promotionTYPEName || "N/A";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white p-6 rounded-t-xl border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {promotion.promotionName}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        promotion.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {promotion.active ? "Active" : "Inactive"}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {promotion.promotionID}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <FaTimes className="text-gray-600 text-xl" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto scrollbar-thin flex-1">
              <div className="p-6 space-y-6">
                {/* Description */}
                {promotion.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {promotion.description}
                    </p>
                  </div>
                )}

                {/* Promotion Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaTag className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Promotion Type
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getPromotionTypeName(promotion.promotionType)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {promotion.discountType === "PERCENT" ? (
                        <FaPercentage className="text-blue-600" />
                      ) : (
                        <FaDollarSign className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Discount Type
                      </p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {promotion.discountType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Room Type Promotions */}
                {promotion.roomTypePromotion &&
                  promotion.roomTypePromotion.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaCalendarAlt className="text-[#b27c1f]" />
                        Room Type Promotions
                      </h3>
                      <div className="space-y-3">
                        {promotion.roomTypePromotion.map((rtp, index) => {
                          const daysRemaining = getDaysRemaining(rtp.endDate);
                          const isExpired = daysRemaining < 0;
                          const isExpiringSoon =
                            daysRemaining >= 0 && daysRemaining <= 7;

                          return (
                            <div
                              key={index}
                              className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#b27c1f] transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {typeof rtp.roomType === "string"
                                      ? rtp.roomType
                                      : rtp.roomType.typeName || "N/A"}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {typeof rtp.roomType === "string"
                                      ? ""
                                      : rtp.roomType.description || ""}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-[#b27c1f]">
                                    {promotion.discountType === "PERCENT"
                                      ? `${rtp.discountValue}%`
                                      : formatVND(rtp.discountValue)}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Discount
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <FaCalendarAlt className="text-gray-400" />
                                  <span className="text-gray-600">
                                    {formatDate(rtp.startDate)}
                                  </span>
                                </div>
                                <span className="text-gray-400">→</span>
                                <div className="flex items-center gap-2">
                                  <FaCalendarAlt className="text-gray-400" />
                                  <span className="text-gray-600">
                                    {formatDate(rtp.endDate)}
                                  </span>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <div className="mt-3">
                                {isExpired ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                    Expired
                                  </span>
                                ) : isExpiringSoon ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    Expires in {daysRemaining} day
                                    {daysRemaining !== 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    {daysRemaining} days remaining
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionDetailModal;

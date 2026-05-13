import React from "react";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaCalendarAlt,
  FaPercentage,
  FaDollarSign,
} from "react-icons/fa";
import type { Promotion } from "../../../types/Promotion";

interface PromotionTableViewProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onViewDetails: (promotion: Promotion) => void;
}

const PromotionTableView: React.FC<PromotionTableViewProps> = ({
  promotions,
  onEdit,
  onToggleStatus,
  onViewDetails,
}) => {
  const getPromotionTypeName = (
    promotionType: Promotion["promotionType"],
  ): string => {
    if (typeof promotionType === "string") {
      return promotionType;
    }
    return promotionType?.promotionTYPEName || "N/A";
  };

  const getDiscountIcon = (discountType?: string) => {
    return discountType?.toLowerCase() === "percentage" ? (
      <FaPercentage className="text-blue-500" />
    ) : (
      <FaDollarSign className="text-green-500" />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f0eb] border-b border-[#ebe3d7]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Promotion ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Discount Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {promotions.map((promotion, index) => (
              <motion.tr
                key={
                  promotion.promotionID ||
                  `${promotion.promotionName || "promotion"}-${index}`
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewDetails(promotion)}
              >
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {promotion.promotionID}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {promotion.promotionName}
                  </div>
                  {promotion.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {promotion.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                    {getPromotionTypeName(promotion.promotionType)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getDiscountIcon(promotion.discountType)}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {promotion.discountType == "FIXED"
                        ? "Fixed Amount (VND)"
                        : "Percentage (%)"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(promotion.promotionID, !promotion.active);
                    }}
                    className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
                  >
                    {promotion.active ? (
                      <>
                        <FaToggleOn className="text-2xl text-green-500" />
                        <span className="text-sm font-semibold text-green-600">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <FaToggleOff className="text-2xl text-gray-400" />
                        <span className="text-sm font-semibold text-gray-500">
                          Inactive
                        </span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(promotion);
                      }}
                      className="p-2 text-[#6b5e4c] hover:bg-[#f5f0eb] rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {promotions.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FaCalendarAlt className="text-3xl text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">
            No promotions found
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your filters or create a new promotion
          </p>
        </div>
      )}
    </div>
  );
};

export default PromotionTableView;

import { motion } from "framer-motion";
import {
  FaPercentage,
  FaTags,
  FaCheckCircle,
  FaGift,
  FaArrowRight,
} from "react-icons/fa";
import type { Promotion } from "../../types/Promotion";

interface PromotionCardProps {
  promotion: Promotion;
  index: number;
  onClick?: (promotion: Promotion) => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  index,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(promotion);
    }
  };

  return (
    <motion.div
      key={`${promotion.promotionID}-${index}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group cursor-pointer"
    >
      <div className="relative cursor-pointer h-full" onClick={handleClick}>
        <div className="h-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#CCBDA3]">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#CCBDA3]/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#C3923C]/5 rounded-full blur-lg"></div>

          {/* Status Badge */}
          {promotion.active && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-success to-green-600 text-white rounded-full text-xs font-bold shadow-lg animate-pulse">
                <FaCheckCircle className="text-xs" />
                Active
              </span>
            </div>
          )}

          <div className="relative p-4 h-full flex flex-col">
            {/* Icon Section */}
            <div className="mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#CCBDA3] to-[#B8A888] rounded-lg flex items-center justify-center shadow-sm">
                <FaPercentage className="text-white text-lg" />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#C3923C] transition-colors duration-300 line-clamp-2">
                {promotion.promotionName}
              </h3>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1 leading-relaxed">
                {promotion.description ||
                  "Exciting promotion offer available for our valued customers. Don't miss out on this special deal!"}
              </p>

              {/* Discount Type Badge */}
              <div className="mb-3">
                <div className="inline-flex items-center gap-1.5 bg-[#F5F0EB] border border-[#CCBDA3]/30 px-3 py-1.5 rounded-lg">
                  <FaTags className="text-[#C3923C] text-xs" />
                  <span className="text-xs font-semibold text-[#C3923C] uppercase tracking-wide">
                    {promotion.discountType}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="cursor-pointer w-full bg-gradient-to-r from-[#CCBDA3] to-[#B8A888] hover:from-[#C3923C] hover:to-[#B4893E] text-white py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClick();
                }}
              >
                <FaGift className="text-sm" />
                <span>View Details</span>
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PromotionCard;

import React from "react";
import { FaTimes, FaTag, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import type { PromotionType } from "../../../types/PromotionType";

interface PromotionTypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionType: PromotionType | null;
  onEdit: (type: PromotionType) => void;
}

const PromotionTypeDetailModal: React.FC<PromotionTypeDetailModalProps> = ({
  isOpen,
  onClose,
  promotionType,
  onEdit,
}) => {
  if (!promotionType) return null;

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
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white p-6 rounded-t-xl border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#b27c1f] to-[#eab354] flex items-center justify-center">
                      <FaTag className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {promotionType.promotionTYPEName}
                      </h2>
                      <p className="text-sm text-gray-500 font-mono">
                        {promotionType.promotionTypeID}
                      </p>
                    </div>
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
            <div className="overflow-y-auto scrollbar-thin flex-1 p-6">
              <div className="space-y-6">
                {/* Description Section */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {promotionType.description || (
                      <span className="text-gray-400 italic">
                        No description provided
                      </span>
                    )}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Type ID
                    </p>
                    <p className="text-lg font-bold text-gray-900 font-mono">
                      {promotionType.promotionTypeID}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Type Name
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {promotionType.promotionTYPEName}
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaTag className="text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        About Promotion Types
                      </h4>
                      <p className="text-sm text-blue-700">
                        Promotion types categorize different kinds of promotions
                        in your system. Each promotion must be assigned to one
                        type for better organization and reporting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-6 rounded-b-xl shadow-lg">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(promotionType)}
                  className="flex-1 px-6 py-3 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaEdit />
                  Edit Type
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionTypeDetailModal;

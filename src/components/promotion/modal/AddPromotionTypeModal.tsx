import React, { useState, useEffect } from "react";
import { FaTimes, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import type { PromotionType } from "../../../types/PromotionType";
import { useToastContext } from "../../../hooks/useToastContext";

interface AddPromotionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promotionType: Partial<PromotionType>) => void;
  editPromotionType?: PromotionType | null;
  submitting?: boolean;
}

const AddPromotionTypeModal: React.FC<AddPromotionTypeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editPromotionType,
  submitting = false,
}) => {
  const toast = useToastContext();

  const [formData, setFormData] = useState<Partial<PromotionType>>({
    promotionTypeID: "",
    promotionTYPEName: "",
    description: "",
  });

  const [errors, setErrors] = useState<{
    promotionTypeID?: string;
    promotionTYPEName?: string;
  }>({});

  useEffect(() => {
    if (editPromotionType) {
      setFormData({
        promotionTypeID: editPromotionType.promotionTypeID,
        promotionTYPEName: editPromotionType.promotionTYPEName,
        description: editPromotionType.description || "",
      });
    } else {
      setFormData({
        promotionTypeID: "",
        promotionTYPEName: "",
        description: "",
      });
    }
    setErrors({});
  }, [editPromotionType, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate Type ID
    if (!editPromotionType) {
      if (!formData.promotionTypeID) {
        newErrors.promotionTypeID = "Promotion Type ID is required";
      } else if (formData.promotionTypeID.length < 3) {
        newErrors.promotionTypeID = "Type ID must be at least 3 characters";
      } else if (!/^[A-Z0-9]+$/.test(formData.promotionTypeID)) {
        newErrors.promotionTypeID =
          "Type ID must contain only uppercase letters and numbers";
      }
    }

    // Validate Type Name
    if (
      !formData.promotionTYPEName ||
      formData.promotionTYPEName.trim() === ""
    ) {
      newErrors.promotionTYPEName = "Promotion Type Name is required";
    } else if (formData.promotionTYPEName.length < 3) {
      newErrors.promotionTYPEName = "Type Name must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    onSubmit(formData);
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {editPromotionType
                  ? "Edit Promotion Type"
                  : "Add New Promotion Type"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes className="text-gray-600 text-xl" />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto scrollbar-thin flex-1">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Type ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Type ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.promotionTypeID || ""}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        promotionTypeID: e.target.value.toUpperCase(),
                      });
                      if (errors.promotionTypeID) {
                        setErrors({ ...errors, promotionTypeID: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-colors text-gray-700 font-mono ${
                      errors.promotionTypeID
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-[#6b5e4c] focus:border-[#6b5e4c]"
                    }`}
                    placeholder="e.g., PROMTYPEFB"
                    disabled={!!editPromotionType}
                    required
                  />
                  {errors.promotionTypeID && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaInfoCircle className="text-xs" />
                      {errors.promotionTypeID}
                    </p>
                  )}
                  {!editPromotionType && !errors.promotionTypeID && (
                    <p className="mt-1 text-xs text-gray-500">
                      Enter a unique uppercase ID (e.g., PROMTYPEFB, PROMTYPECM)
                    </p>
                  )}
                </div>

                {/* Type Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.promotionTYPEName || ""}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        promotionTYPEName: e.target.value,
                      });
                      if (errors.promotionTYPEName) {
                        setErrors({ ...errors, promotionTYPEName: undefined });
                      }
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-colors text-gray-700 ${
                      errors.promotionTYPEName
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-[#6b5e4c] focus:border-[#6b5e4c]"
                    }`}
                    placeholder="Enter promotion type name..."
                    required
                  />
                  {errors.promotionTYPEName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaInfoCircle className="text-xs" />
                      {errors.promotionTYPEName}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-[#6b5e4c] transition-colors resize-none text-gray-700"
                    placeholder="Enter description for this promotion type..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional: Describe when and how this promotion type should
                    be used
                  </p>
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-6 rounded-b-xl shadow-lg">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#b27c1f] to-[#eab354] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {editPromotionType ? "Updating..." : "Creating..."}
                    </>
                  ) : editPromotionType ? (
                    "Update Type"
                  ) : (
                    "Create Type"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddPromotionTypeModal;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Voucher } from "../../types/Voucher";
import { validateVoucherForm } from "../../utils/voucherValidators";

interface VoucherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Voucher>) => Promise<void>;
  voucher?: Voucher | null;
  submitting?: boolean;
}

const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  voucher,
  submitting = false,
}) => {
  const [formData, setFormData] = useState<Partial<Voucher>>({
    voucherID: "",
    voucherName: "",
    discountType: "PERCENT",
    discountPercentage: 0,
    discountValue: 0,
    startDate: new Date(),
    endDate: new Date(),
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      if (voucher) {
        console.log("Loading voucher into form:", voucher); // Debug log
        console.log(
          "Voucher isActive value:",
          voucher.isActive,
          "Type:",
          typeof voucher.isActive
        ); // Debug log

        // Explicitly handle isActive - if it's false, keep it false, otherwise default to true
        const isActiveValue =
          voucher.isActive !== undefined && voucher.isActive !== null
            ? Boolean(voucher.isActive)
            : true;

        console.log("Setting isActive to:", isActiveValue); // Debug log

        setFormData({
          voucherID: voucher.voucherID || "",
          voucherName: voucher.voucherName || "",
          discountType: voucher.discountType || "PERCENT",
          discountPercentage: voucher.discountPercentage ?? 0,
          discountValue: voucher.discountValue ?? 0,
          startDate: voucher.startDate || new Date(),
          endDate: voucher.endDate || new Date(),
          isActive: isActiveValue,
        });
      } else {
        setFormData({
          voucherID: "",
          voucherName: "",
          discountType: "PERCENT",
          discountPercentage: 0,
          discountValue: 0,
          startDate: new Date(),
          endDate: new Date(),
          isActive: true,
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, voucher]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        voucherID: "",
        voucherName: "",
        discountType: "PERCENT",
        discountPercentage: 0,
        discountValue: 0,
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  // Realtime validation
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      const newErrors = validateVoucherForm(formData);
      setErrors(newErrors);
    }
  }, [formData, touched]);

  const handleFieldChange = (
    field: string,
    value: string | number | boolean | Date
  ) => {
    setFormData({ ...formData, [field]: value });
    setTouched({ ...touched, [field]: true });
  };

  const handleFieldBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const validate = (): boolean => {
    // Mark all fields as touched on submit
    const allFields = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allFields);

    const newErrors = validateVoucherForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Ensure isActive is explicitly included
      const submitData: Partial<Voucher> = {
        ...formData,
        isActive: formData.isActive ?? true,
      };
      console.log("Submitting voucher data:", submitData); // Debug log
      console.log("isActive value being submitted:", submitData.isActive); // Debug log
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {voucher ? "Edit Voucher" : "Create Voucher"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voucher ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.voucherID}
                onChange={(e) => handleFieldChange("voucherID", e.target.value)}
                onBlur={() => handleFieldBlur("voucherID")}
                disabled={!!voucher}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  touched.voucherID && errors.voucherID
                    ? "border-red-500"
                    : "border-gray-300"
                } ${voucher ? "bg-gray-100" : ""}`}
                placeholder="e.g., SUMMER2024"
              />
              {touched.voucherID && errors.voucherID && (
                <p className="text-red-500 text-xs mt-1">{errors.voucherID}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voucher Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.voucherName}
                onChange={(e) =>
                  handleFieldChange("voucherName", e.target.value)
                }
                onBlur={() => handleFieldBlur("voucherName")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  touched.voucherName && errors.voucherName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Summer Discount"
              />
              {touched.voucherName && errors.voucherName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.voucherName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.discountType}
              onChange={(e) =>
                handleFieldChange("discountType", e.target.value)
              }
              onBlur={() => handleFieldBlur("discountType")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] cursor-pointer"
            >
              <option value="PERCENT">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (VND)</option>
            </select>
          </div>

          {formData.discountType === "PERCENT" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.discountPercentage ?? 0}
                onChange={(e) =>
                  handleFieldChange(
                    "discountPercentage",
                    parseFloat(e.target.value) || 0
                  )
                }
                onBlur={() => handleFieldBlur("discountPercentage")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  touched.discountPercentage && errors.discountPercentage
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                min="0"
                max="100"
                step="0.1"
              />
              {touched.discountPercentage && errors.discountPercentage && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.discountPercentage}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.discountValue ?? 0}
                onChange={(e) =>
                  handleFieldChange(
                    "discountValue",
                    parseFloat(e.target.value) || 0
                  )
                }
                onBlur={() => handleFieldBlur("discountValue")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  touched.discountValue && errors.discountValue
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                min="0"
                step="1000"
              />
              {touched.discountValue && errors.discountValue && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.discountValue}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={
                  formData.startDate
                    ? new Date(formData.startDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleFieldChange("startDate", new Date(e.target.value))
                }
                onBlur={() => handleFieldBlur("startDate")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  touched.startDate && errors.startDate
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {touched.startDate && errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={
                  formData.endDate
                    ? new Date(formData.endDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleFieldChange("endDate", new Date(e.target.value))
                }
                onBlur={() => handleFieldBlur("endDate")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  touched.endDate && errors.endDate
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {touched.endDate && errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive ?? true}
              onChange={(e) => handleFieldChange("isActive", e.target.checked)}
              className="w-4 h-4 text-[#6b5e4c] border-gray-300 rounded focus:ring-[#6b5e4c] cursor-pointer"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Active
            </label>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end -mx-6 -mb-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Saving..." : voucher ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VoucherFormModal;

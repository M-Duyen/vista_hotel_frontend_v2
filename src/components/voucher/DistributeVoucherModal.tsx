import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaCheckCircle, FaTimes } from "react-icons/fa";
import type { Voucher } from "../../types/Voucher";
import type { DistributionCriteria } from "../../types/CustomerVoucher";
import voucherService from "../../services/voucherService";
import { useToastContext } from "../../hooks/useToastContext";

interface DistributeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
  onSuccess: () => void;
}

const DistributeVoucherModal: React.FC<DistributeVoucherModalProps> = ({
  isOpen,
  onClose,
  voucher,
  onSuccess,
}) => {
  const toast = useToastContext();
  const [criteria, setCriteria] = useState<DistributionCriteria>({
    membershipLevel: [],
    gender: [],
    birthMonth: [],
    minLoyaltyPoints: undefined,
  });
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCriteria({
        membershipLevel: [],
        gender: [],
        birthMonth: [],
        minLoyaltyPoints: undefined,
      });
      setPreviewCount(0);
    }
  }, [isOpen]);

  const handlePreview = async () => {
    try {
      setLoading(true);
      const result = await voucherService.previewDistribution(criteria);
      setPreviewCount(result.count);
      if (result.count === 0) {
        toast.error("Không tìm thấy khách hàng phù hợp với điều kiện", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error previewing distribution:", error);
      setPreviewCount(0);
      toast.error("Lỗi khi xem trước danh sách khách hàng", {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!voucher) return;

    try {
      setDistributing(true);
      const result = await voucherService.distributeVoucher(
        voucher.voucherID,
        criteria
      );

      if (result.success) {
        toast.success(
          result.message ||
            `Đã phân phối voucher cho ${result.count} khách hàng`,
          { duration: 3000 }
        );
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || "Không thể phân phối voucher", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error distributing voucher:", error);
      toast.error("Lỗi khi phân phối voucher", { duration: 3000 });
    } finally {
      setDistributing(false);
    }
  };

  const toggleMembershipLevel = (level: string) => {
    setCriteria((prev) => ({
      ...prev,
      membershipLevel: prev.membershipLevel?.includes(level)
        ? prev.membershipLevel.filter((l) => l !== level)
        : [...(prev.membershipLevel || []), level],
    }));
  };

  const toggleGender = (gender: string) => {
    setCriteria((prev) => ({
      ...prev,
      gender: prev.gender?.includes(gender)
        ? prev.gender.filter((g) => g !== gender)
        : [...(prev.gender || []), gender],
    }));
  };

  const toggleBirthMonth = (month: number) => {
    setCriteria((prev) => ({
      ...prev,
      birthMonth: prev.birthMonth?.includes(month)
        ? prev.birthMonth.filter((m) => m !== month)
        : [...(prev.birthMonth || []), month],
    }));
  };

  if (!isOpen || !voucher) return null;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin"
      >
        <div className="sticky top-0 bg-white text-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Distribute Voucher</h2>
              <p className="text-sm text-gray-700/80 mt-1">
                {voucher.voucherName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Membership Level Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Membership Level
            </label>
            <div className="flex flex-wrap gap-2">
              {["BRONZE", "SILVER", "GOLD", "PLATINUM"].map((level) => (
                <button
                  key={level}
                  onClick={() => toggleMembershipLevel(level)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    criteria.membershipLevel?.includes(level)
                      ? "bg-[#6b5e4c] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Gender
            </label>
            <div className="flex flex-wrap gap-2">
              {["MALE", "FEMALE", "OTHER"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => toggleGender(gender)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    criteria.gender?.includes(gender)
                      ? "bg-[#6b5e4c] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Birth Month Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Birth Month (for Birthday Vouchers)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {months.map((month, index) => (
                <button
                  key={index}
                  onClick={() => toggleBirthMonth(index + 1)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    criteria.birthMonth?.includes(index + 1)
                      ? "bg-[#6b5e4c] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Loyalty Points */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Loyalty Points
            </label>
            <input
              type="number"
              value={criteria.minLoyaltyPoints || ""}
              onChange={(e) =>
                setCriteria({
                  ...criteria,
                  minLoyaltyPoints: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c]"
              placeholder="Enter minimum points (optional)"
              min="0"
            />
          </div>

          {/* Preview Section */}
          <div className="bg-[#f5f0eb] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaUsers className="text-[#6b5e4c]" />
                <span className="font-semibold text-gray-700">
                  Preview Recipients
                </span>
              </div>
              <button
                onClick={handlePreview}
                disabled={loading}
                className="px-4 py-2 bg-white text-[#6b5e4c] border border-[#6b5e4c] rounded-lg hover:bg-[#6b5e4c] hover:text-white transition-colors font-medium cursor-pointer disabled:opacity-50"
              >
                {loading ? "Loading..." : "Preview"}
              </button>
            </div>
            {previewCount > 0 && (
              <div className="flex items-center gap-2 text-lg font-bold text-[#6b5e4c]">
                <FaCheckCircle />
                <span>{previewCount} customers will receive this voucher</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDistribute}
              disabled={distributing || previewCount === 0}
              className="px-6 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {distributing ? "Distributing..." : "Distribute Voucher"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DistributeVoucherModal;

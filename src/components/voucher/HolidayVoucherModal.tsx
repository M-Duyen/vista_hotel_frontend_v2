import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, Search, Gift } from "lucide-react";
import { getUpcomingHolidays } from "../../services/googleCalendarService";
import type { Holiday } from "../../types/Holiday";
import type { Voucher } from "../../types/Voucher";
import { useToastContext } from "../../hooks/useToastContext";

interface HolidayVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onSave: (selectedHolidays: { holiday: Holiday; voucherId: string }[]) => void;
}

export default function HolidayVoucherModal({
  isOpen,
  onClose,
  vouchers,
  onSave,
}: HolidayVoucherModalProps) {
  const toast = useToastContext();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHolidays, setSelectedHolidays] = useState<Map<string, string>>(
    new Map()
  );

  useEffect(() => {
    if (isOpen) {
      loadHolidays();
    }
  }, [isOpen]);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const upcomingHolidays = await getUpcomingHolidays(12);
      setHolidays(upcomingHolidays);
    } catch (error) {
      console.error("Error loading holidays:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHolidays = holidays.filter((holiday) =>
    holiday.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleHoliday = (holidayId: string, voucherId: string) => {
    setSelectedHolidays((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(holidayId)) {
        newMap.delete(holidayId);
      } else {
        newMap.set(holidayId, voucherId);
      }
      return newMap;
    });
  };

  const handleSave = async () => {
    if (selectedHolidays.size === 0) {
      toast.error("Vui lòng chọn ít nhất một ngày lễ!", { duration: 3000 });
      return;
    }

    setSaving(true);
    try {
      const result = Array.from(selectedHolidays.entries()).map(
        ([holidayId, voucherId]) => ({
          holiday: holidays.find((h) => h.id === holidayId)!,
          voucherId,
        })
      );

      await onSave(result); // onSave đã có try-catch và toast trong AutoEventsTab
      onClose();

      // Reset state sau khi đóng
      setSelectedHolidays(new Map());
      setSearchTerm("");
    } catch (error) {
      // Error đã được xử lý trong AutoEventsTab
      console.error("Error in handleSave:", error);
    } finally {
      setSaving(false);
    }
  };

  const activeVouchers = vouchers.filter((v) => v.isActive);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#ebe3d7] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#fff8e1] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#f57c00]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Phân phối Voucher theo Ngày Lễ
                </h2>
                <p className="text-sm text-gray-600">
                  Chọn ngày lễ và voucher tương ứng để tự động phân phối
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-[#ebe3d7]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm ngày lễ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#ebe3d7] rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b5e4c] mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải ngày lễ...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHolidays.map((holiday) => (
                  <motion.div
                    key={holiday.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-[#ebe3d7] rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date */}
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-lg bg-[#e3f2fd] flex flex-col items-center justify-center">
                          <span className="text-xs text-[#1976d2] font-medium">
                            Tháng {holiday.date.getMonth() + 1}
                          </span>
                          <span className="text-2xl font-bold text-[#1976d2]">
                            {holiday.date.getDate()}
                          </span>
                        </div>
                      </div>

                      {/* Holiday Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {holiday.summary}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {holiday.date.toLocaleDateString("vi-VN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>

                        {/* Voucher Selection */}
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedHolidays.get(holiday.id) || ""}
                            onChange={(e) =>
                              handleToggleHoliday(holiday.id, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-[#ebe3d7] rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent text-sm cursor-pointer"
                          >
                            <option value="">Chọn voucher...</option>
                            {activeVouchers.map((voucher) => (
                              <option key={voucher.id} value={voucher.id}>
                                {voucher.name} -{" "}
                                {voucher.discountType === "PERCENTAGE"
                                  ? `${voucher.discountPercentage}%`
                                  : `${voucher.discountValue?.toLocaleString(
                                      "vi-VN"
                                    )}đ`}
                              </option>
                            ))}
                          </select>
                          {selectedHolidays.has(holiday.id) && (
                            <Gift className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredHolidays.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Không tìm thấy ngày lễ nào
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#ebe3d7] flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-[#ebe3d7] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={selectedHolidays.size === 0 || saving}
              className="flex-1 px-4 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                `Lưu (${selectedHolidays.size} ngày lễ)`
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

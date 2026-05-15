/* eslint-disable */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Clock, CheckCircle, XCircle } from "lucide-react";
import type { Voucher } from "../../types/Voucher";
import voucherService from "../../services/voucherService";

interface DistributionHistory {
  id: number;
  voucherName: string;
  criteria: string;
  recipientCount: number;
  distributedAt: string;
  status: "success" | "failed";
}

interface DistributionTabProps {
  vouchers: Voucher[];
  onDistribute: (voucher: Voucher) => void;
}

export default function DistributionTab({
  vouchers,
  onDistribute,
}: DistributionTabProps) {
  const [selectedVoucherId, setSelectedVoucherId] = useState<string>("");
  const [history, setHistory] = useState<DistributionHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDistributionHistory();
  }, []);

  const loadDistributionHistory = async () => {
    setLoading(true);
    try {
      const data = await voucherService.getDistributionHistory();
      setHistory(data);
    } catch (error) {
      console.error("Error loading distribution history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = () => {
    const voucher = vouchers.find((v) => v.voucherId === selectedVoucherId);
    if (voucher) {
      onDistribute(voucher);
    }
  };

  const activeVouchers = vouchers.filter((v) => v.isActive);

  return (
    <div className="space-y-6">
      {/* Distribution Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-[#ebe3d7] p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Send className="w-5 h-5 text-[#6b5e4c]" />
          <h3 className="text-lg font-semibold text-[#6b5e4c]">
            Distribute Voucher
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Voucher
            </label>
            <select
              value={selectedVoucherId}
              onChange={(e) => setSelectedVoucherId(e.target.value)}
              className="w-full px-4 py-2 border border-[#ebe3d7] rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent cursor-pointer"
            >
              <option value="">Choose a voucher...</option>
              {activeVouchers.map((voucher) => (
                <option key={voucher.voucherId} value={voucher.voucherId}>
                  {voucher.voucherName} -{" "}
                  {voucher.discountType === "PERCENT"
                    ? `${voucher.discountPercentage}%`
                    : `${voucher.discountValue?.toLocaleString()}đ`}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDistribute}
            disabled={!selectedVoucherId}
            className="w-full bg-[#6b5e4c] text-white py-3 rounded-lg hover:bg-[#5a4d3d] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Select Recipients</span>
          </button>
        </div>
      </motion.div>

      {/* Distribution History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border border-[#ebe3d7]"
      >
        <div className="p-6 border-b border-[#ebe3d7]">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6b5e4c]" />
            <h3 className="text-lg font-semibold text-[#6b5e4c]">
              Distribution History
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b5e4c]"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No distribution history yet
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#f5f0eb]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6b5e4c] uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6b5e4c] uppercase tracking-wider">
                    Criteria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6b5e4c] uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6b5e4c] uppercase tracking-wider">
                    Distributed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6b5e4c] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#ebe3d7]">
                {history.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-[#f5f0eb] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.voucherName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {record.criteria}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.recipientCount} customers
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {new Date(record.distributedAt).toLocaleString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.status === "success" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { getVouchersByCustomerId } from "../../services/voucherService";
import type { Voucher } from "../../types/Voucher";
import VoucherHero from "../../components/voucher/VoucherHero";
import VoucherFilter from "../../components/voucher/VoucherFilter";
import VoucherCard from "../../components/voucher/VoucherCard";
import EmptyVoucher from "../../components/voucher/EmptyVoucher";

const VoucherList: React.FC = () => {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "expiring">("all");
  const [copiedCode, setCopiedCode] = useState<string>("");

  // Lấy customerId từ localStorage hoặc session
  const getCustomerId = () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return localStorage.getItem("customerId");
      const user = JSON.parse(userData);
      const role = (user?.userRole || user?.roles?.[0] || "")
        .toUpperCase()
        .replace(/^ROLE_/, "");
      return role === "CUSTOMER" ? user.id : null;
    } catch (error) {
      console.error("Error reading customer ID:", error);
      return localStorage.getItem("customerId");
    }
  };

  const customerId = getCustomerId();

  useEffect(() => {
    if (!customerId) {
      console.error("No customer ID found");
      navigate("/auth/login");
      return;
    }
    loadVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const loadVouchers = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      const data = await getVouchersByCustomerId(customerId);
      setVouchers(data);
    } catch (error) {
      console.error("Error loading vouchers:", error);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const getVoucherStatus = (
    endDate: Date | string
  ): {
    status: "active" | "expiring" | "expired";
    label: string;
    daysLeft: number;
  } => {
    const now = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (end < now) return { status: "expired", label: "Expired", daysLeft: 0 };
    if (daysUntilExpiry <= 7)
      return {
        status: "expiring",
        label: `${daysUntilExpiry}d left`,
        daysLeft: daysUntilExpiry,
      };
    return { status: "active", label: "Active", daysLeft: daysUntilExpiry };
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const filteredVouchers = vouchers.filter((v) => {
    const { status } = getVoucherStatus(v.endDate);
    if (filter === "all") return true;
    if (filter === "active") return status === "active";
    if (filter === "expiring") return status === "expiring";
    return true;
  });

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(
      (v) => getVoucherStatus(v.endDate).status === "active"
    ).length,
    expiring: vouchers.filter(
      (v) => getVoucherStatus(v.endDate).status === "expiring"
    ).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-[#ebe3d7] mx-auto"></div>
            <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-[#c3923c] absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-4 text-gray-700 font-medium text-sm">
            Loading your vouchers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <VoucherHero stats={stats} />

      <div className="max-w-6xl mx-auto px-4 py-6 -mt-6 relative z-10">
        <VoucherFilter filter={filter} onFilterChange={setFilter} />

        {filteredVouchers.length === 0 ? (
          <EmptyVoucher />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredVouchers.map((voucher, index) => {
                const { status, label } = getVoucherStatus(voucher.endDate);
                return (
                  <VoucherCard
                    key={`${voucher.voucherId}-${index}`}
                    voucher={voucher}
                    index={index}
                    status={status}
                    label={label}
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Wave */}
      <div className="mt-12">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 80L60 73.3C120 66.7 240 53.3 360 48C480 43 600 48 720 50.7C840 53 960 53 1080 48C1200 43 1320 33 1380 28L1440 23V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0V80Z"
            fill="white"
            fillOpacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
};

export default VoucherList;

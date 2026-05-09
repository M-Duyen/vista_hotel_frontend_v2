import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPercent,
  faTicket,
  faStar,
  faMagic,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { getPromotions } from "../../services/promotionService";
import { getVouchers } from "../../services/voucherService";
import { useToastContext } from "../../hooks/useToastContext";
import HeaderHome from "../../components/HeaderHome";
import Header from "../../components/Header";
import PromotionCard from "../../components/promotion/PromotionCard";
import VoucherCard from "../../components/voucher/VoucherCard";

interface Promotion {
  promotionID: string;
  promotionName: string;
  description: string;
  discountType: string;
  isActive: boolean;
}

interface Voucher {
  voucherID: string;
  voucherName: string;
  discountPercentage: number;
  discountValue: number;
  startDate: Date | string;
  endDate: Date | string;
  discountType: string;
  isActive: boolean;
}

type TabType = "all" | "promotions" | "vouchers";

const ExclusiveOffers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"active" | "all">(
    "active"
  );
  const [showSolidHeader, setShowSolidHeader] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const toast = useToastContext();

  // Header scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const trigger = heroRef.current.clientHeight * 0.6;
      setShowSolidHeader(window.scrollY > trigger);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promotionsData, vouchersData] = await Promise.all([
        getPromotions(),
        getVouchers(),
      ]);
      setPromotions(promotionsData);
      setVouchers(vouchersData);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load exclusive offers");
    } finally {
      setLoading(false);
    }
  };

  const filteredPromotions = promotions.filter(
    (p) => selectedFilter === "all" || p.isActive
  );

  const filteredVouchers = vouchers.filter(
    (v) => selectedFilter === "all" || v.isActive
  );

  const calculateDaysRemaining = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 0;
  };

  const getVoucherStatus = (
    voucher: Voucher
  ): "active" | "expiring" | "expired" => {
    const daysRemaining = calculateDaysRemaining(voucher.endDate);
    if (daysRemaining === 0) return "expired";
    if (daysRemaining <= 7) return "expiring";
    return "active";
  };

  const getVoucherLabel = (voucher: Voucher): string => {
    const daysRemaining = calculateDaysRemaining(voucher.endDate);
    if (daysRemaining === 0) return "Expired";
    if (daysRemaining === 1) return "Expires today";
    if (daysRemaining <= 7) return `${daysRemaining} days left`;
    return "Active";
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Voucher code copied!");
    setTimeout(() => setCopiedCode(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* HEADER */}
      <div className="fixed top-0 left-0 w-full z-[9999] transition-all duration-700">
        <div
          className={`transition-opacity duration-700 ${
            showSolidHeader ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <HeaderHome />
        </div>

        <div
          className={`absolute top-0 left-0 w-full transition-opacity duration-700 ${
            showSolidHeader ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Header />
        </div>
      </div>

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 overflow-hidden"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#CCBDA3] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mt-[80px] mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center bg-[#CCBDA3]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <FontAwesomeIcon icon={faStar} className="text-[#CCBDA3] mr-2" />
              <span className="text-sm font-serif font-semibold">
                Limited Time Offers
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
              Exclusive Offers
            </h1>

            {/* Gold Decorative Line */}
            <div className="relative mx-auto mb-6 w-fit">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-2 rounded-full bg-gradient-to-r from-transparent via-[#CCBDA3] to-transparent blur-xl opacity-30 pointer-events-none z-0" />
              <hr className="relative w-32 md:w-48 lg:w-56 h-0.5 border-0 rounded-full bg-gradient-to-r from-transparent via-[#CCBDA3] to-transparent drop-shadow-[0_6px_16px_rgba(204,189,163,0.12)] z-10" />
            </div>

            <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
              Discover amazing promotions and vouchers crafted exclusively for
              you
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* Tabs */}
          <div className="flex bg-white rounded-2xl p-1 shadow-lg border border-gray-200">
            {[
              { value: "all", label: "All Offers", icon: faStar },
              { value: "promotions", label: "Promotions", icon: faPercent },
              { value: "vouchers", label: "Vouchers", icon: faTicket },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as TabType)}
                className={`px-6 py-3 rounded-xl font-serif font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.value
                    ? "bg-gradient-to-r from-[#CCBDA3] to-[#B8A888] text-white shadow-md"
                    : "text-gray-600 hover:text-[#CCBDA3]"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
            <select
              value={selectedFilter}
              onChange={(e) =>
                setSelectedFilter(e.target.value as "active" | "all")
              }
              className="bg-white border border-gray-300 rounded-xl px-4 py-2 font-light focus:outline-none focus:ring-2 focus:ring-[#CCBDA3] focus:border-transparent cursor-pointer"
            >
              <option value="active">Active Only</option>
              <option value="all">All Offers</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#CCBDA3] rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FontAwesomeIcon
                  icon={faMagic}
                  className="text-[#CCBDA3] text-xl"
                />
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* All Offers */}
            {activeTab === "all" && (
              <motion.div
                key="all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {/* Promotions Section */}
                {filteredPromotions.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={faPercent}
                        className="text-[#CCBDA3]"
                      />
                      Special Promotions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPromotions.map((promotion, index) => (
                        <PromotionCard
                          key={promotion.promotionID}
                          promotion={promotion}
                          index={index}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Vouchers Section */}
                {filteredVouchers.length > 0 && (
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={faTicket}
                        className="text-[#CCBDA3]"
                      />
                      Exclusive Vouchers
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVouchers.map((voucher, index) => (
                        <VoucherCard
                          key={voucher.voucherID}
                          voucher={voucher}
                          index={index}
                          status={getVoucherStatus(voucher)}
                          label={getVoucherLabel(voucher)}
                          copiedCode={copiedCode}
                          onCopy={handleCopyCode}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredPromotions.length === 0 &&
                  filteredVouchers.length === 0 && (
                    <div className="text-center py-20">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-gray-300 text-6xl mb-4"
                      />
                      <p className="text-gray-500 text-lg">
                        No offers available at the moment
                      </p>
                    </div>
                  )}
              </motion.div>
            )}

            {/* Promotions Only */}
            {activeTab === "promotions" && (
              <motion.div
                key="promotions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPromotions.length > 0 ? (
                  filteredPromotions.map((promotion, index) => (
                    <PromotionCard
                      key={promotion.promotionID}
                      promotion={promotion}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <FontAwesomeIcon
                      icon={faPercent}
                      className="text-gray-300 text-6xl mb-4"
                    />
                    <p className="text-gray-500 text-lg">
                      No promotions available
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Vouchers Only */}
            {activeTab === "vouchers" && (
              <motion.div
                key="vouchers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredVouchers.length > 0 ? (
                  filteredVouchers.map((voucher, index) => (
                    <VoucherCard
                      key={voucher.voucherID}
                      voucher={voucher}
                      index={index}
                      status={getVoucherStatus(voucher)}
                      label={getVoucherLabel(voucher)}
                      copiedCode={copiedCode}
                      onCopy={handleCopyCode}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-20">
                    <FontAwesomeIcon
                      icon={faTicket}
                      className="text-gray-300 text-6xl mb-4"
                    />
                    <p className="text-gray-500 text-lg">
                      No vouchers available
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ExclusiveOffers;
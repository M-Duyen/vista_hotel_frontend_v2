import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPercent,
  faTicket,
  faStar,
  faMagic,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import {
  getPromotionById,
  getPromotions,
} from "../../services/promotionService";
import { getRoomTypePromotionsByPromotionId } from "../../services/roomTypePromotionService";
import { getAllRoomTypes } from "../../services/roomTypeService";
import {
  getVouchers,
  getVouchersByCustomerId,
} from "../../services/voucherService";
import { saveCustomerVoucher } from "../../services/customerVoucherService";
import { useToastContext } from "../../hooks/useToastContext";
import { useAuthStore } from "../../stores/authStore";
import HeaderHome from "../../components/HeaderHome";
import Header from "../../components/Header";
import PromotionCard from "../../components/promotion/PromotionCard";
import VoucherCard from "../../components/voucher/VoucherCard";
import PromotionDetailModal from "../../components/offers/PromotionDetailModal";
import VoucherDetailModal from "../../components/offers/VoucherDetailModal";
import type { Promotion } from "../../types/Promotion";
import type { Voucher } from "../../types/Voucher";

type TabType = "all" | "promotions" | "vouchers";

const ExclusiveOffers: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"active" | "all">(
    "active",
  );
  const [showSolidHeader, setShowSolidHeader] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null,
  );
  const [promotionDetailLoading, setPromotionDetailLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [ownedVoucherIds, setOwnedVoucherIds] = useState<Set<string>>(
    new Set(),
  );
  const [savingVoucherId, setSavingVoucherId] = useState<string | null>(null);
  const [roomTypeNameById, setRoomTypeNameById] = useState<
    Record<string, string>
  >({});
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

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setOwnedVoucherIds(new Set());
      return;
    }
    loadOwnedVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promotionsData, vouchersData] = await Promise.all([
        getPromotions(),
        getVouchers(),
      ]);
      setPromotions(promotionsData);
      setVouchers(vouchersData);
      const roomTypes = await getAllRoomTypes();
      const roomTypeMap = (roomTypes || []).reduce(
        (acc: Record<string, string>, roomType: any) => {
          const id = roomType?.roomTypeID ?? roomType?.roomTypeId;
          const name = roomType?.typeName ?? roomType?.roomTypeName ?? "";
          if (id) acc[id] = name || id;
          return acc;
        },
        {},
      );
      setRoomTypeNameById(roomTypeMap);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load exclusive offers");
    } finally {
      setLoading(false);
    }
  };

  const loadOwnedVouchers = async () => {
    if (!user?.id) return;

    try {
      const data = await getVouchersByCustomerId(user.id);
      setOwnedVoucherIds(new Set(data.map((voucher) => voucher.voucherId)));
    } catch (error) {
      console.error("Error loading owned vouchers:", error);
      setOwnedVoucherIds(new Set());
    }
  };

  const filteredPromotions = promotions.filter((p) => p.active);

  const isVoucherExpired = (voucher: Voucher) => {
    if (!voucher.endDate) return true;
    const end = new Date(voucher.endDate);
    if (typeof voucher.endDate === "string" && voucher.endDate.length <= 10) {
      end.setHours(23, 59, 59, 999);
    }
    return new Date().getTime() > end.getTime();
  };

  const filteredVouchers = vouchers.filter(
    (v) => !isVoucherExpired(v) && (selectedFilter === "all" || v.isActive),
  );

  const calculateDaysRemaining = (endDate: Date | string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    if (typeof endDate === "string" && endDate.length <= 10) {
      end.setHours(23, 59, 59, 999);
    }
    const now = new Date();
    const diff = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 0;
  };

  const getVoucherStatus = (
    voucher: Voucher,
  ): "active" | "expiring" | "expired" => {
    if (isVoucherExpired(voucher)) return "expired";
    const daysRemaining = calculateDaysRemaining(voucher.endDate);
    if (daysRemaining <= 7) return "expiring";
    return "active";
  };

  const getVoucherLabel = (voucher: Voucher): string => {
    if (isVoucherExpired(voucher)) return "Expired";
    const daysRemaining = calculateDaysRemaining(voucher.endDate);
    if (daysRemaining === 1) return "Expires today";
    if (daysRemaining <= 7) return `${daysRemaining} days left`;
    return "Active";
  };

  const handleSaveVoucher = async (voucher: Voucher) => {
    if (!isAuthenticated || !user?.id || user.userRole !== "CUSTOMER") {
      toast.error("Please log in to save vouchers.");
      navigate("/auth/login");
      return;
    }

    if (ownedVoucherIds.has(voucher.voucherId)) {
      toast.success("Voucher already saved.");
      return;
    }

    try {
      setSavingVoucherId(voucher.voucherId);
      await saveCustomerVoucher({
        customerId: user.id,
        voucherId: voucher.voucherId,
        state: true,
      });
      setOwnedVoucherIds((prev) => new Set([...prev, voucher.voucherId]));
      toast.success("Voucher saved to your account!");
    } catch (error) {
      console.error("Error saving voucher:", error);
      toast.error("Failed to save voucher.");
    } finally {
      setSavingVoucherId(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Voucher code copied!");
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const handleSelectPromotion = async (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setPromotionDetailLoading(true);

    try {
      const detail = await getPromotionById(promotion.promotionID);
      const roomTypePromotions =
        detail.roomTypePromotion && detail.roomTypePromotion.length > 0
          ? detail.roomTypePromotion
          : await getRoomTypePromotionsByPromotionId(promotion.promotionID);

      setSelectedPromotion({
        ...detail,
        roomTypePromotion: roomTypePromotions,
      });
    } catch (error) {
      console.error("Error loading promotion detail:", error);
    } finally {
      setPromotionDetailLoading(false);
    }
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
                          onClick={handleSelectPromotion}
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
                      {filteredVouchers.map((voucher, index) => {
                        const isSaved = ownedVoucherIds.has(voucher.voucherId);
                        const isSaving = savingVoucherId === voucher.voucherId;
                        return (
                          <VoucherCard
                            key={voucher.voucherId}
                            voucher={voucher}
                            index={index}
                            status={getVoucherStatus(voucher)}
                            label={getVoucherLabel(voucher)}
                            copiedCode={copiedCode}
                            onCopy={handleCopyCode}
                            actionLabel={
                              isSaved
                                ? "Saved"
                                : isSaving
                                  ? "Saving..."
                                  : "Save Voucher"
                            }
                            actionDisabled={isSaved || isSaving}
                            onAction={handleSaveVoucher}
                            onCardClick={setSelectedVoucher}
                          />
                        );
                      })}
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
                      onClick={handleSelectPromotion}
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
                  filteredVouchers.map((voucher, index) => {
                    const isSaved = ownedVoucherIds.has(voucher.voucherId);
                    const isSaving = savingVoucherId === voucher.voucherId;
                    return (
                      <VoucherCard
                        key={voucher.voucherId}
                        voucher={voucher}
                        index={index}
                        status={getVoucherStatus(voucher)}
                        label={getVoucherLabel(voucher)}
                        copiedCode={copiedCode}
                        onCopy={handleCopyCode}
                        actionLabel={
                          isSaved
                            ? "Saved"
                            : isSaving
                              ? "Saving..."
                              : "Save Voucher"
                        }
                        actionDisabled={isSaved || isSaving}
                        onAction={handleSaveVoucher}
                        onCardClick={setSelectedVoucher}
                      />
                    );
                  })
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

      <PromotionDetailModal
        isOpen={!!selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
        promotion={selectedPromotion}
        isLoading={promotionDetailLoading}
        roomTypeNameById={roomTypeNameById}
      />

      <VoucherDetailModal
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        voucher={selectedVoucher}
        isSaved={
          selectedVoucher
            ? ownedVoucherIds.has(selectedVoucher.voucherId)
            : false
        }
        isSaving={
          selectedVoucher
            ? savingVoucherId === selectedVoucher.voucherId
            : false
        }
        isExpired={selectedVoucher ? isVoucherExpired(selectedVoucher) : false}
        statusLabel={selectedVoucher ? getVoucherLabel(selectedVoucher) : ""}
        onCopy={handleCopyCode}
        onSave={handleSaveVoucher}
      />
    </div>
  );
};

export default ExclusiveOffers;

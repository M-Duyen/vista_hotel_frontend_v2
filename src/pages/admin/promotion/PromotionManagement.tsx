import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
} from "react-icons/fa";
import PromotionFilters from "../../../components/promotion/PromotionFilters";
import PromotionTableView from "../../../components/promotion/view/PromotionTableView";
import AddPromotionModal from "../../../components/promotion/modal/AddPromotionModal";
import PromotionDetailModal from "../../../components/promotion/modal/PromotionDetailModal";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import Pagination from "../../../components/common/Pagination";
import type { Promotion } from "../../../types/Promotion";
import { useToastContext } from "../../../hooks/useToastContext";
import {
  getAllPromotions,
  savePromotion,
  updatePromotionStatus,
} from "../../../services/promotionService";

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [detailPromotion, setDetailPromotion] = useState<Promotion | null>(
    null
  );

  // Confirm dialogs
  const [confirmUpdateDialog, setConfirmUpdateDialog] = useState(false);
  const [confirmStatusDialog, setConfirmStatusDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<Partial<Promotion> | null>(
    null
  );
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string;
    isActive: boolean;
  } | null>(null);

  const toast = useToastContext();

  // Generate dynamic filter options from actual data
  const promotionTypeOptions = React.useMemo(() => {
    const types = new Set<string>();
    promotions.forEach((p) => {
      const typeId =
        typeof p.promotionType === "string"
          ? p.promotionType
          : p.promotionType?.promotionTypeID;
      const typeName =
        typeof p.promotionType === "string"
          ? p.promotionType
          : p.promotionType?.promotionTYPEName || typeId;
      if (typeId) {
        types.add(JSON.stringify({ value: typeId, label: typeName || typeId }));
      }
    });
    return Array.from(types).map((t) => JSON.parse(t));
  }, [promotions]);

  const discountTypeOptions = React.useMemo(() => {
    const types = new Set<string>();
    promotions.forEach((p) => {
      if (p.discountType) {
        types.add(p.discountType);
      }
    });
    return Array.from(types).map((type) => ({
      value: type,
      label: type === "PERCENT" ? "Percentage (%)" : "Fixed Amount (VND)",
    }));
  }, [promotions]);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const data = await getAllPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  // Filter promotions
  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch =
      promotion.promotionName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      promotion.promotionID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promotion.description &&
        promotion.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && promotion.active) ||
      (statusFilter === "inactive" && !promotion.active);

    const matchesType =
      typeFilter === "all" ||
      (typeof promotion.promotionType === "string"
        ? promotion.promotionType === typeFilter
        : promotion.promotionType?.promotionTypeID === typeFilter);

    const matchesDiscountType =
      discountTypeFilter === "all" ||
      promotion.discountType === discountTypeFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDiscountType;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, discountTypeFilter]);

  // Stats
  const stats = {
    total: promotions.length,
    active: promotions.filter((p) => p.active).length,
    inactive: promotions.filter((p) => !p.active).length,
    types: new Set(
      promotions.map((p) =>
        typeof p.promotionType === "string"
          ? p.promotionType
          : p.promotionType?.promotionTypeID
      )
    ).size,
  };

  // Handlers
  const handleAddPromotion = async (promotionData: Partial<Promotion>) => {
    try {
      setSubmitting(true);
      await savePromotion(promotionData);
      toast.success("Promotion created successfully!", { duration: 3000 });
      setIsAddModalOpen(false);
      await fetchPromotions();
    } catch (error) {
      console.error("Error creating promotion:", error);
      toast.error("Failed to create promotion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPromotion = async (promotionData: Partial<Promotion>) => {
    // Show confirm dialog
    setPendingUpdate(promotionData);
    setConfirmUpdateDialog(true);
  };

  const confirmUpdatePromotion = async () => {
    if (!pendingUpdate) return;

    try {
      setSubmitting(true);
      await savePromotion(pendingUpdate);
      toast.success("Promotion updated successfully!", { duration: 3000 });
      setEditPromotion(null);
      setConfirmUpdateDialog(false);
      setPendingUpdate(null);
      await fetchPromotions();
    } catch (error) {
      console.error("Error updating promotion:", error);
      toast.error("Failed to update promotion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    // Show confirm dialog
    setPendingStatusChange({ id, isActive });
    setConfirmStatusDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!pendingStatusChange) return;

    try {
      setSubmitting(true);
      await updatePromotionStatus(
        pendingStatusChange.id,
        pendingStatusChange.isActive
      );
      toast.success(
        `Promotion ${
          pendingStatusChange.isActive ? "activated" : "deactivated"
        } successfully!`,
        { duration: 3000 }
      );
      setConfirmStatusDialog(false);
      setPendingStatusChange(null);
      await fetchPromotions();
    } catch (error) {
      console.error("Error toggling promotion status:", error);
      toast.error("Failed to update promotion status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0eb] p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-[-30px]"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Promotion Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage hotel promotions and special offers
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <FaPlus />
            Add Promotion
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-6 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-[#e3f2fd] flex items-center justify-center flex-shrink-0">
                <FaChartLine className="text-2xl text-[#1976d2]" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.total}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Total Promotions</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-6 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-2xl text-[#2e7d32]" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.active}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Active</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-6 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-[#ffebee] flex items-center justify-center flex-shrink-0">
                <FaTimesCircle className="text-2xl text-[#c62828]" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.inactive}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Inactive</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-6 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-[#fff8e1] flex items-center justify-center flex-shrink-0">
                <FaTag className="text-2xl text-[#f57c00]" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-800">
                  {stats.types}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Promotion Types</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PromotionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            discountTypeFilter={discountTypeFilter}
            onDiscountTypeFilterChange={setDiscountTypeFilter}
            promotionTypeOptions={promotionTypeOptions}
            discountTypeOptions={discountTypeOptions}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <svg
                  className="animate-spin h-12 w-12 text-[#6b5e4c]"
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
                <p className="text-gray-600 font-medium">
                  Loading promotions...
                </p>
              </div>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaTag className="text-4xl text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-medium text-lg">
                    No promotions found
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {promotions.length === 0
                      ? "Get started by creating your first promotion"
                      : "Try adjusting your filters"}
                  </p>
                </div>
                {promotions.length === 0 && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <FaPlus />
                    Create First Promotion
                  </button>
                )}
              </div>
            </div>
          ) : (
            <PromotionTableView
              promotions={paginatedPromotions}
              onEdit={setEditPromotion}
              onToggleStatus={handleToggleStatus}
              onViewDetails={setDetailPromotion}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {!loading && filteredPromotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredPromotions.length}
            />
          </motion.div>
        )}

        {/* Add/Edit Modal */}
        <AddPromotionModal
          isOpen={isAddModalOpen || !!editPromotion}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditPromotion(null);
          }}
          onSubmit={editPromotion ? handleEditPromotion : handleAddPromotion}
          editPromotion={editPromotion}
          submitting={submitting}
        />

        {/* Detail Modal */}
        <PromotionDetailModal
          isOpen={!!detailPromotion}
          onClose={() => setDetailPromotion(null)}
          promotion={detailPromotion}
        />

        {/* Confirm Update Dialog */}
        <ConfirmDialog
          isOpen={confirmUpdateDialog}
          onClose={() => {
            setConfirmUpdateDialog(false);
            setPendingUpdate(null);
          }}
          onConfirm={confirmUpdatePromotion}
          title="Confirm Update"
          message="Are you sure you want to update this promotion? This will apply all the changes you've made."
          type="warning"
          confirmText="Update"
          cancelText="Cancel"
          isLoading={submitting}
        />

        {/* Confirm Status Change Dialog */}
        <ConfirmDialog
          isOpen={confirmStatusDialog}
          onClose={() => {
            setConfirmStatusDialog(false);
            setPendingStatusChange(null);
          }}
          onConfirm={confirmToggleStatus}
          title={`${
            pendingStatusChange?.isActive ? "Activate" : "Deactivate"
          } Promotion`}
          message={`Are you sure you want to ${
            pendingStatusChange?.isActive ? "activate" : "deactivate"
          } this promotion?`}
          type="warning"
          confirmText={
            pendingStatusChange?.isActive ? "Activate" : "Deactivate"
          }
          cancelText="Cancel"
          isLoading={submitting}
        />
      </div>
    </div>
  );
};

export default PromotionManagement;

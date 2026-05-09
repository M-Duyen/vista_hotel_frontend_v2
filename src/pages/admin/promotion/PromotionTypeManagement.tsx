import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaChartLine,
  FaTag,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import AddPromotionTypeModal from "../../../components/promotion/modal/AddPromotionTypeModal";
import PromotionTypeDetailModal from "../../../components/promotion/modal/PromotionTypeDetailModal";
import type { PromotionType } from "../../../types/PromotionType";
import { useToastContext } from "../../../hooks/useToastContext";
import {
  getAllPromotionTypes,
  createPromotionType,
  updatePromotionType,
} from "../../../services/promotionTypeService";

const PromotionTypeManagement: React.FC = () => {
  const [promotionTypes, setPromotionTypes] = useState<PromotionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editPromotionType, setEditPromotionType] =
    useState<PromotionType | null>(null);
  const [detailPromotionType, setDetailPromotionType] =
    useState<PromotionType | null>(null);

  const toast = useToastContext();

  useEffect(() => {
    fetchPromotionTypes();
  }, []);

  const fetchPromotionTypes = async () => {
    try {
      setLoading(true);
      const data = await getAllPromotionTypes();
      setPromotionTypes(data);
    } catch (error) {
      console.error("Error fetching promotion types:", error);
      toast.error("Failed to load promotion types");
    } finally {
      setLoading(false);
    }
  };

  // Filter promotion types
  const filteredPromotionTypes = promotionTypes.filter((type) => {
    const matchesSearch =
      type.promotionTYPEName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.promotionTypeID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.description &&
        type.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  // Stats
  const stats = {
    total: promotionTypes.length,
  };

  // Handlers
  const handleAddPromotionType = async (
    promotionTypeData: Partial<PromotionType>
  ) => {
    try {
      setSubmitting(true);
      await createPromotionType(promotionTypeData);
      toast.success("Promotion type created successfully!", { duration: 3000 });
      setIsAddModalOpen(false);
      await fetchPromotionTypes();
    } catch (error) {
      console.error("Error creating promotion type:", error);
      toast.error("Failed to create promotion type. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPromotionType = async (
    promotionTypeData: Partial<PromotionType>
  ) => {
    if (!editPromotionType) return;

    try {
      setSubmitting(true);
      await updatePromotionType(
        editPromotionType.promotionTypeID,
        promotionTypeData
      );
      toast.success("Promotion type updated successfully!", { duration: 3000 });
      setEditPromotionType(null);
      await fetchPromotionTypes();
    } catch (error) {
      console.error("Error updating promotion type:", error);
      toast.error("Failed to update promotion type. Please try again.");
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
              Promotion Type Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage promotion categories and types
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <FaPlus />
            Add Promotion Type
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
                <p className="text-sm text-gray-600 mt-1">Total Types</p>
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
                  {filteredPromotionTypes.length}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Filtered Results</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            className="bg-gradient-to-br from-[#6b5e4c] to-[#b27c1f] rounded-xl shadow-sm p-6 cursor-pointer text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <FaTag className="text-2xl text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">Categories</h3>
                <p className="text-sm text-white/80 mt-1">
                  Organize promotions
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by type name, ID, or description..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-[#6b5e4c] focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent outline-none transition-all text-gray-700 font-medium"
            />
          </div>
        </motion.div>

        {/* Card Grid */}
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
                  Loading promotion types...
                </p>
              </div>
            </div>
          ) : filteredPromotionTypes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <FaTag className="text-4xl text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-medium text-lg">
                    No promotion types found
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {promotionTypes.length === 0
                      ? "Get started by creating your first promotion type"
                      : "Try adjusting your search"}
                  </p>
                </div>
                {promotionTypes.length === 0 && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <FaPlus />
                    Create First Type
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotionTypes.map((type, index) => (
                <motion.div
                  key={type.promotionTypeID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
                  onClick={() => setDetailPromotionType(type)}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#b27c1f] to-[#eab354] flex items-center justify-center">
                          <FaTag className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                            {type.promotionTYPEName}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono">
                            {type.promotionTypeID}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px] mb-4">
                      {type.description || "No description provided"}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailPromotionType(type);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-sm font-semibold cursor-pointer"
                      >
                        <FaEye />
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditPromotionType(type);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white rounded-lg transition-all text-sm font-semibold cursor-pointer"
                      >
                        <FaEdit />
                        Edit
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add/Edit Modal */}
        <AddPromotionTypeModal
          isOpen={isAddModalOpen || !!editPromotionType}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditPromotionType(null);
          }}
          onSubmit={
            editPromotionType ? handleEditPromotionType : handleAddPromotionType
          }
          editPromotionType={editPromotionType}
          submitting={submitting}
        />

        {/* Detail Modal */}
        <PromotionTypeDetailModal
          isOpen={!!detailPromotionType}
          onClose={() => setDetailPromotionType(null)}
          promotionType={detailPromotionType}
          onEdit={(type) => {
            setDetailPromotionType(null);
            setEditPromotionType(type);
          }}
        />
      </div>
    </div>
  );
};

export default PromotionTypeManagement;

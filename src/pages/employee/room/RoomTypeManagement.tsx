import React, { useState, useMemo, useEffect, useContext } from "react";
import { FaPlus, FaDollarSign, FaBed } from "react-icons/fa";
import { motion } from "framer-motion";
import { ToastContext } from "../../../context/ToastContext";
import Pagination from "../../../components/common/Pagination";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import roomTypeService from "../../../services/roomTypeService";
import type { RoomType } from "../../../types/RoomType";
import RoomTypeCard from "../../../components/room/RoomTypeCard";
import RoomTypeFormModal from "../../../components/room/modal/RoomTypeFormModal";
import RoomTypeDetailModal from "../../../components/room/modal/RoomTypeDetailModal";

/**
 * Component quản lý loại phòng
 * Hiển thị danh sách loại phòng với các chức năng CRUD
 */
const RoomTypeManagement: React.FC = () => {
  // State
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const toast = useContext(ToastContext);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load room types
  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      const data = await roomTypeService.getAllRoomTypes();
      setRoomTypes(data);
    } catch (error) {
      console.error("Error loading room types:", error);
      toast?.error("Failed to load room types");
    } finally {
      setLoading(false);
    }
  };

  // Filter room types
  const filteredRoomTypes = useMemo(() => {
    if (!searchTerm) return roomTypes;

    const searchLower = searchTerm.toLowerCase();
    return roomTypes.filter(
      (rt) =>
        rt.typeName?.toLowerCase().includes(searchLower) ||
        rt.roomTypeID?.toLowerCase().includes(searchLower) ||
        rt.description?.toLowerCase().includes(searchLower)
    );
  }, [roomTypes, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage);
  const paginatedRoomTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRoomTypes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRoomTypes, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Statistics - simplified
  const stats = useMemo(() => {
    const totalTypes = roomTypes.length;
    const avgPrice =
      roomTypes.length > 0
        ? roomTypes.reduce((sum, rt) => sum + (rt.basePrice || 0), 0) /
          roomTypes.length
        : 0;

    return {
      totalTypes,
      avgPrice,
    };
  }, [roomTypes]);

  // Handlers
  const handleAdd = () => {
    setSelectedRoomType(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsEditModalOpen(true);
  };

  const handleView = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (data: Partial<RoomType>) => {
    try {
      setSubmitting(true);
      await roomTypeService.saveRoomType(data);
      toast?.success(
        data.roomTypeID
          ? "Room type updated successfully!"
          : "Room type created successfully!"
      );
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      await loadRoomTypes();
    } catch (error) {
      console.error("Error saving room type:", error);
      toast?.error("Failed to save room type");
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b5e4c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room types...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-[#6b5e4c]">
              Room Types Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage hotel room types and categories
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#6b5e4c] text-white font-semibold rounded-lg shadow-lg hover:bg-[#5a4d3e] transition-colors cursor-pointer text-sm sm:text-base"
          >
            <FaPlus />
            <span className="hidden sm:inline">Add Room Type</span>
            <span className="sm:hidden">Add Type</span>
          </button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#e3f2fd] flex items-center justify-center flex-shrink-0">
                <FaBed className="text-xl sm:text-2xl text-[#1976d2]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                  {stats.totalTypes}
                </h3>
                <p className="text-xs sm:text-[14px] text-gray-600 mt-1 truncate">
                  Total Room Types
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                <FaDollarSign className="text-xl sm:text-2xl text-[#2e7d32]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                  {Math.round(stats.avgPrice).toLocaleString("vi-VN")}đ
                </h3>
                <p className="text-xs sm:text-[14px] text-gray-600 mt-1 truncate">
                  Average Base Price
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-3 sm:p-4"
        >
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent"
          />
        </motion.div>

        {/* Room Types Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredRoomTypes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] p-12 text-center">
              <FaBed className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No room types found</p>
              <p className="text-gray-400 text-sm mt-2">
                {roomTypes.length === 0
                  ? "Get started by creating your first room type"
                  : "Try adjusting your search"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedRoomTypes.map((roomType) => (
                <RoomTypeCard
                  key={roomType.roomTypeID}
                  roomType={roomType}
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredRoomTypes.length > 0 && (
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
              totalItems={filteredRoomTypes.length}
            />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <RoomTypeFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <RoomTypeFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmit}
        roomType={selectedRoomType}
        submitting={submitting}
      />

      <RoomTypeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        roomType={selectedRoomType}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default RoomTypeManagement;

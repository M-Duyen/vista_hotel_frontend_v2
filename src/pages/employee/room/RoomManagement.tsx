import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  FaDoorOpen,
  FaBed,
  FaTools,
  FaChartLine,
  FaPlus,
  FaThLarge,
  FaList,
  FaCalendarAlt,
  FaTh,
} from "react-icons/fa";
import RoomStatCard from "../../../components/room/RoomStatCard";
import RoomTableView from "../../../components/room/view/RoomTableView";
import RoomCardView from "../../../components/room/view/RoomCardView";
import RoomCalendarView from "../../../components/room/view/RoomCalendarView";
import RoomStatusBoard from "../../../components/room/view/RoomStatusBoard";
import RoomDetailModal from "../../../components/room/modal/RoomDetailModal";
import RoomFilters from "../../../components/room/RoomFilters";
import type { FilterOptions } from "../../../components/room/RoomFilters";
import Pagination from "../../../components/common/Pagination";
import type { Room } from "../../../components/room/view/RoomTableView";
import AddRoomModal from "../../../components/room/modal/AddRoomModal";
import EditRoomModal from "../../../components/room/modal/EditRoomModal";
import ChangeStatusModal from "../../../components/room/modal/ChangeStatusModal";
import ConfirmDialog from "../../../components/dialog/ConfirmDialog";
import { motion } from "framer-motion";
import { roomService } from "../../../services/roomService";
import type { Room as ApiRoom, RoomStatus } from "../../../types/Room";
import bookingService from "../../../services/bookingService";
import type { RoomBooking } from "../../../types/Booking";
import { uploadMultipleImagesToCloudinary } from "../../../services/cloudinaryService";
import type { RoomFormData } from "../../../components/room/modal/AddRoomModal";
import type { EditRoomFormData } from "../../../components/room/modal/EditRoomModal";
import { ToastContext } from "../../../context/ToastContext";
import RoomBookingsModal from "../../../components/room/modal/RoomBookingsModal";

/**
 * Component quản lý phòng
 * Hiển thị overview, danh sách phòng với filter và phân trang
 * Hỗ trợ nhiều view: Card, Table, Calendar, Status Board
 */
const RoomManagement: React.FC = () => {
  // Chế độ xem: bảng, thẻ, lịch hoặc bảng trạng thái
  const [viewMode, setViewMode] = useState<
    "table" | "card" | "calendar" | "status"
  >("status");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected room for detail modal
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Add room modal
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

  // Edit room modal
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  // Change status modal
  const [changeStatusRoom, setChangeStatusRoom] = useState<Room | null>(null);

  // Show bookings modal
  const [bookingRoomNumber, setBookingRoomNumber] = useState<string | null>(
    null
  );

  // Toast context
  const toast = useContext(ToastContext);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Rooms data from API
  const [rooms, setRooms] = useState<Room[]>([]);

  // Bookings data from API
  const [bookings, setBookings] = useState<RoomBooking[]>([]);

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    status: "all",
    roomType: "all",
    floor: "all",
    priceRange: "all",
  });

  // Chuyển đổi API Room thành UI Room
  const convertApiRoomToUiRoom = (apiRoom: ApiRoom): Room | null => {
    // Bỏ qua phòng không có roomType
    if (!apiRoom.roomType) {
      console.warn(`Room ${apiRoom.roomNumber} has null roomType, skipping...`);
      return null;
    }

    // Map backend RoomStatus với frontend Room status
    const statusMap: Record<RoomStatus, Room["status"]> = {
      AVAILABLE: "available",
      BOOKED: "occupied",
      MAINTENANCE: "maintenance",
      CLEANING: "cleaning",
    };

    return {
      id: apiRoom.roomNumber || "",
      roomNumber: apiRoom.roomNumber || "",
      roomType: apiRoom.roomType.typeName || "",
      floor: apiRoom.floor || 0,
      price: apiRoom.roomType.basePrice || 0,
      status: statusMap[apiRoom.status],
      capacity: apiRoom.roomType.maxOccupancy || 0,
      amenities: (apiRoom.roomType.amenties as string[]) || [],
      image: apiRoom.images?.[0] || "", // Hình ảnh đầu tiên để tương thích ngược
      images: apiRoom.images || [], // Tất cả hình ảnh cho gallery
      notes: apiRoom.notes || undefined,
      lastCleaned: apiRoom.lastCleaned || undefined,
    };
  };

  // Load danh sách phòng từ API
  const loadRooms = async () => {
    try {
      setLoading(true);
      const apiRooms = await roomService.getAllRooms();
      const uiRooms = apiRooms
        .map(convertApiRoomToUiRoom)
        .filter((room: Room | null): room is Room => room !== null);
      setRooms(uiRooms);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load danh sách từ API khi component mount
  useEffect(() => {
    loadRooms();
  }, []);

  // Load bookings từ API
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const roomBookings = await bookingService.getAllRoomBookings();
        setBookings(roomBookings);
      } catch (error) {
        console.error("Lỗi khi tải danh sách booking:", error);
        toast?.error("Không thể tải danh sách booking");
      }
    };

    loadBookings();
  }, [toast]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Bộ lọc tìm kiếm
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const roomTypeName =
          typeof room.roomType === "string"
            ? room.roomType
            : room.roomType?.typeName || "";

        if (
          !room.roomNumber.toLowerCase().includes(searchLower) &&
          !roomTypeName.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Bộ lọc trạng thái
      if (filters.status !== "all" && room.status !== filters.status) {
        return false;
      }

      // Bộ lọc loại phòng
      if (filters.roomType !== "all") {
        const roomTypeName =
          typeof room.roomType === "string"
            ? room.roomType
            : room.roomType?.typeName || "";
        if (roomTypeName !== filters.roomType) {
          return false;
        }
      }

      // Bộ lọc tầng
      if (filters.floor !== "all" && room.floor.toString() !== filters.floor) {
        return false;
      }

      // Bộ lọc phạm vi giá
      if (filters.priceRange !== "all") {
        const [min, max] = filters.priceRange.split("-").map(Number);
        if (room.price < min || room.price > max) {
          return false;
        }
      }

      return true;
    });
  }, [rooms, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRooms, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const available = rooms.filter((r) => r.status === "available").length;
    const occupied = rooms.filter((r) => r.status === "occupied").length;
    const maintenance = rooms.filter((r) => r.status === "maintenance").length;
    const occupancyRate =
      rooms.length > 0 ? ((occupied / rooms.length) * 100).toFixed(1) : "0";

    // Tính toán thống kê đặt phòng
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = bookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn);
      checkIn.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime();
    });

    const activeBookings = bookings.filter((booking) => {
      return booking.status === "checked-in" || booking.status === "pending";
    });

    // Tính toán doanh thu hàng ngày từ các đặt phòng hôm nay
    const dailyRevenue = todayBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    return {
      available,
      occupied,
      maintenance,
      occupancyRate,
      todayBookings: todayBookings.length,
      activeBookings: activeBookings.length,
      dailyRevenue,
    };
  }, [rooms, bookings]);

  // Lấy các loại phòng và tầng riêng biệt cho bộ lọc
  const roomTypes = Array.from(
    new Set(
      rooms
        .map((r) => {
          const typeName =
            typeof r.roomType === "string" ? r.roomType : r.roomType?.typeName;
          return typeName || "";
        })
        .filter(Boolean)
    )
  );
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort();

  // Handlers
  const handleEdit = (room: Room) => {
    console.log("Edit room:", room);
    handleEditRoom(room);
  };

  const handleView = (room: Room) => {
    console.log("View room:", room);
    setSelectedRoom(room);
  };

  // Handler để thay đổi trạng thái phòng
  const handleChangeStatus = async (
    roomId: string,
    newStatus: Room["status"],
    note?: string
  ) => {
    try {
      // Map Trạng thái UI cho API RoomStatus
      const statusMap: Record<Room["status"], RoomStatus> = {
        available: "AVAILABLE",
        occupied: "BOOKED",
        maintenance: "MAINTENANCE",
        cleaning: "CLEANING",
      };

      await roomService.updateRoomStatus(roomId, statusMap[newStatus], note);

      // Show success toast
      toast?.success(`Room ${roomId} status updated to ${newStatus}`);

      // Reload danh sách phòng
      await loadRooms();

      // Đóng modal
      setChangeStatusRoom(null);

      // Đóng RoomDetailModal nếu đang mở
      if (selectedRoom?.roomNumber === roomId) {
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error("Error updating room status:", error);
      toast?.error("Failed to update room status");
    }
  };

  const handleAddRoom = () => {
    console.log("Add new room");
    setIsAddRoomModalOpen(true);
  };

  const handleAddRoomSubmit = async (roomData: RoomFormData) => {
    console.log("Room data submitted:", roomData);

    try {
      setLoading(true);

      // Upload ảnh lên Cloudinary và lấy URL về
      // Images belong to Room entity, not RoomType
      let cloudinaryUrls: string[] = [];
      if (roomData.imageFiles.length > 0) {
        const uploadImages = await uploadMultipleImagesToCloudinary(
          roomData.imageFiles
        );
        cloudinaryUrls = uploadImages.map((img) => img.secure_url);
      }

      // Chuẩn bị dữ liệu phòng
      const roomApiData: Partial<ApiRoom> = {
        floor: parseInt(roomData.floor),
        status: roomData.roomStatus as RoomStatus,
        lastCleaned: roomData.lastCleaned || null,
        notes: roomData.notes || null,
        roomType: {
          roomTypeID: roomData.roomTypeId,
        },
        images: cloudinaryUrls,
      };

      if (roomData.roomNumber) {
        roomApiData.roomNumber = roomData.roomNumber;
      }

      console.log(
        "Sending room data to API:",
        JSON.stringify(roomApiData, null, 2)
      );

      // Lưu phòng
      await roomService.saveRoom(roomApiData);

      // Reload danh sách phòng
      const apiRooms = await roomService.getAllRooms();
      const uiRooms = apiRooms
        .map((apiRoom: ApiRoom) => {
          if (!apiRoom.roomType) {
            console.warn(
              `Room ${apiRoom.roomNumber} has null roomType,skipping...`
            );
            return null;
          }
          return convertApiRoomToUiRoom(apiRoom);
        })
        .filter((room: Room | null): room is Room => room !== null);

      setRooms(uiRooms);

      // Đóng modal
      setIsAddRoomModalOpen(false);

      // Show success toast
      toast?.success("Room created successfully!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Failed to add room:", error);
      toast?.error("Failed to create room. Please try again.", {
        duration: 5000,
        position: "top-right",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = async (room: Room) => {
    try {
      // Đóng modal chi tiết trước
      setSelectedRoom(null);

      // Lấy dữ liệu phòng đầy đủ từ API để có thông tin hoàn chỉnh
      const fullRoomData = await roomService.getRoomById(room.roomNumber);
      if (fullRoomData) {
        setRoomToEdit(fullRoomData as unknown as Room);
        setIsEditRoomModalOpen(true);
      } else {
        toast?.error("Failed to load room data", {
          duration: 3000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Failed to fetch room data:", error);
      toast?.error("Failed to load room data", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleEditRoomSubmit = async (roomData: EditRoomFormData) => {
    console.log("Edit room data submitted:", roomData);

    try {
      setLoading(true);

      // 1. Tải hình ảnh mới lên Cloudinary
      let newCloudinaryUrls: string[] = [];
      if (roomData.imageFiles.length > 0) {
        const uploadImages = await uploadMultipleImagesToCloudinary(
          roomData.imageFiles
        );
        newCloudinaryUrls = uploadImages.map((img) => img.secure_url);
      }

      // 2. Kết hợp URL ảnh hiện có và mới
      const allImageUrls = [...roomData.imageUrls, ...newCloudinaryUrls];

      // 3. Chuẩn bị dữ liệu phòng cho API
      const roomApiData = {
        roomNumber: roomData.roomNumber,
        floor: parseInt(roomData.floor),
        status: roomData.roomStatus as RoomStatus,
        lastCleaned: roomData.lastCleaned,
        notes: roomData.notes,
        roomType: {
          roomTypeID: roomData.roomTypeId,
        } as ApiRoom["roomType"],
        images: allImageUrls,
      };

      // 4. Update room
      await roomService.saveRoom(roomApiData);

      // 5. Reload rooms
      const apiRooms = await roomService.getAllRooms();
      const uiRooms = apiRooms
        .map((apiRoom: ApiRoom) => {
          if (!apiRoom.roomType) {
            console.warn(
              `Room ${apiRoom.roomNumber} has null roomType, skipping...`
            );
            return null;
          }
          return convertApiRoomToUiRoom(apiRoom);
        })
        .filter((room: Room | null): room is Room => room !== null);

      setRooms(uiRooms);

      // 6. Close modal
      setIsEditRoomModalOpen(false);
      setRoomToEdit(null);

      // 7. Show success toast
      toast?.success("Room updated successfully!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Failed to update room:", error);
      toast?.error("Failed to update room. Please try again.", {
        duration: 5000,
        position: "top-right",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0eb] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b5e4c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách phòng...</p>
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
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-[-30px]"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#6b5e4c]">
              Rooms Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              View and manage rooms
            </p>
          </div>
          <button
            onClick={handleAddRoom}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#6b5e4c] text-white font-semibold rounded-lg shadow-lg hover:bg-[#5a4d3e] transition-colors cursor-pointer text-sm sm:text-base"
          >
            <FaPlus />
            <span className="hidden sm:inline">Add Room</span>
            <span className="sm:hidden">Add</span>
          </button>
        </motion.div>

        {/* Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        >
          <RoomStatCard
            icon={FaDoorOpen}
            iconBgColor="bg-[#e8f5e9]"
            iconColor="text-[#2e7d32]"
            value={stats.available + stats.occupied + stats.maintenance}
            label="Total Rooms"
            trend={{ value: "+2 this month", isPositive: true }}
          />
          <RoomStatCard
            icon={FaBed}
            iconBgColor="bg-[#e3f2fd]"
            iconColor="text-[#1976d2]"
            value={`${stats.occupancyRate}%`}
            label="Occupancy Rate"
            trend={{ value: "+5% vs last week", isPositive: true }}
          />
          <RoomStatCard
            icon={FaChartLine}
            iconBgColor="bg-[#fff8e1]"
            iconColor="text-[#f57c00]"
            value={`${stats.dailyRevenue.toLocaleString("vi-VN")}đ`}
            label="Daily Revenue"
            trend={{
              value: `${stats.todayBookings} bookings today`,
              isPositive: true,
            }}
          />
          <RoomStatCard
            icon={FaTools}
            iconBgColor="bg-[#ffebee]"
            iconColor="text-[#c62828]"
            value={stats.maintenance}
            label="Maintenance"
            trend={{
              value: `${stats.activeBookings} active bookings`,
              isPositive: false,
            }}
          />
        </motion.div>

        {/* Filters - Chỉ hiển thị khi ở chế độ xem lưới hoặc bảng */}
        {(viewMode === "card" || viewMode === "table") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RoomFilters
              filters={filters}
              onFilterChange={setFilters}
              roomTypes={roomTypes}
              floors={floors}
            />
          </motion.div>
        )}

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <span className="text-[#6b5e4c] font-medium">Total rooms:</span>
              <span className="font-semibold text-gray-900">
                {filteredRooms.length} rooms
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#4caf50]"></span>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#2196f3]"></span>
                <span className="text-gray-600">Occupied</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#ff9800]"></span>
                <span className="text-gray-600">Cleaning</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#f44336]"></span>
                <span className="text-gray-600">Maintenance</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setViewMode("status")}
              className={`p-2 sm:p-3 rounded-lg transition-colors cursor-pointer ${
                viewMode === "status"
                  ? "bg-[#6b5e4c] text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
              title="Status Board View"
            >
              <FaTh />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 sm:p-3 rounded-lg transition-colors cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-[#6b5e4c] text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
              title="Calendar View"
            >
              <FaCalendarAlt />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 sm:p-3 rounded-lg transition-colors cursor-pointer ${
                viewMode === "card"
                  ? "bg-[#6b5e4c] text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
              title="Card View"
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 sm:p-3 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#6b5e4c] text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
              title="Table View"
            >
              <FaList />
            </button>
          </div>
        </motion.div>

        {/* Room List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {viewMode === "status" ? (
            <RoomStatusBoard
              rooms={filteredRooms}
              onRoomClick={handleRoomClick}
            />
          ) : viewMode === "calendar" ? (
            <RoomCalendarView
              rooms={rooms}
              bookings={bookings}
              onRoomClick={handleRoomClick}
            />
          ) : viewMode === "card" ? (
            <RoomCardView
              rooms={paginatedRooms}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={() => {}}
            />
          ) : (
            <RoomTableView
              rooms={paginatedRooms}
              onEdit={handleEdit}
              onView={handleView}
            />
          )}
        </motion.div>

        {/* Pagination - Only show for card and table views */}
        {(viewMode === "card" || viewMode === "table") &&
          filteredRooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredRooms.length}
              />
            </motion.div>
          )}
      </div>

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onEdit={handleEditRoom}
        onChangeStatus={() => {
          if (selectedRoom) {
            setChangeStatusRoom(selectedRoom);
          }
        }}
        onViewBookings={(roomNumber) => setBookingRoomNumber(roomNumber)}
      />

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        onSubmit={handleAddRoomSubmit}
      />

      {/* Edit Room Modal */}
      {roomToEdit && (
        <EditRoomModal
          isOpen={isEditRoomModalOpen}
          onClose={() => {
            setIsEditRoomModalOpen(false);
            setRoomToEdit(null);
          }}
          onSubmit={handleEditRoomSubmit}
          room={roomToEdit}
        />
      )}

      {/* Change Status Modal */}
      {changeStatusRoom && (
        <ChangeStatusModal
          room={changeStatusRoom}
          onClose={() => setChangeStatusRoom(null)}
          onConfirm={handleChangeStatus}
        />
      )}
      {/* Bookings Modal */}
      {bookingRoomNumber && (
        <RoomBookingsModal
          roomNumber={bookingRoomNumber}
          isOpen={!!bookingRoomNumber}
          onClose={() => setBookingRoomNumber(null)}
        />
      )}
    </div>
  );
};

export default RoomManagement;

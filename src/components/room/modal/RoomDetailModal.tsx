import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaWifi,
  FaTv,
  FaCoffee,
  FaSnowflake,
  FaGlassMartiniAlt,
  FaDoorOpen,
  FaHotTub,
  FaUtensils,
  FaLock,
  FaConciergeBell,
  FaWind,
  FaTshirt,
  FaExchangeAlt,
  FaEdit,
  FaCalendarAlt,
  FaClock,
  FaStickyNote,
  FaArrowLeft,
  FaArrowRight,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import type { Room } from "../view/RoomTableView";
import { formatVND } from "../../../utils/formatters";

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onEdit?: (room: Room) => void;
  onChangeStatus?: () => void;
  onViewBookings?: (roomNumber: string) => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onEdit,
  onChangeStatus,
  onViewBookings,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Lấy ảnh từ room.images
  const roomImages =
    room && room.images && room.images.length > 0
      ? room.images
      : room && room.image
      ? [room.image]
      : [];

  // Auto-slide effect
  useEffect(() => {
    if (roomImages.length <= 1 || !isAutoPlaying) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === roomImages.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Thay đổi ảnh mỗi 5s

    return () => clearInterval(intervalId);
  }, [roomImages.length, isAutoPlaying]);

  if (!room) return null;

  const statusConfig = {
    available: {
      label: "Available",
      bg: "bg-[#e8f5e9]",
      text: "text-[#2e7d32]",
      borderColor: "border-[#2e7d32]",
    },
    occupied: {
      label: "Occupied",
      bg: "bg-[#e3f2fd]",
      text: "text-[#1976d2]",
      borderColor: "border-[#1976d2]",
    },
    maintenance: {
      label: "Maintenance",
      bg: "bg-[#ffebee]",
      text: "text-[#c62828]",
      borderColor: "border-[#c62828]",
    },
    cleaning: {
      label: "Cleaning",
      bg: "bg-[#fff8e1]",
      text: "text-[#f57c00]",
      borderColor: "border-[#f57c00]",
    },
  };

  const amenityIcons: { [key: string]: React.ReactElement } = {
    wifi: <FaWifi />,
    tv: <FaTv />,
    coffee: <FaCoffee />,
    ac: <FaSnowflake />,
    minibar: <FaGlassMartiniAlt />,
    balcony: <FaDoorOpen />,
    jacuzzi: <FaHotTub />,
    kitchen: <FaUtensils />,
    safe: <FaLock />,
    dining: <FaConciergeBell />,
    hairdryer: <FaWind />,
    iron: <FaTshirt />,
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === roomImages.length - 1 ? 0 : prev + 1
    );
    setIsAutoPlaying(false); // Tạm dừng phát tự động khi điều hướng thủ công
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? roomImages.length - 1 : prev - 1
    );
    setIsAutoPlaying(false); // Tạm dừng phát tự động khi điều hướng thủ công
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false); // Tạm dừng phát tự động khi điều hướng thủ công
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <>
      <AnimatePresence>
        {room && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-[100]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Room {room.roomNumber}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          {typeof room.roomType === "string"
                            ? room.roomType
                            : room.roomType.typeName}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">
                          Floor {room.floor}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-600">
                          {room.capacity} Guests
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm font-semibold text-[#b27c1f]">
                          {formatVND(room.price)}
                          /night
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <FaTimes className="text-gray-500 text-xl" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {/* Image Gallery with Navigation */}
                  {roomImages.length > 0 && (
                    <div className="mb-8 space-y-4">
                      {/* Main Image Display */}
                      <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 ring-1 ring-gray-200">
                        <motion.img
                          key={currentImageIndex}
                          initial={{
                            opacity: 0,
                            scale: 1.05,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{
                            duration: 0.4,
                          }}
                          src={roomImages[currentImageIndex]}
                          alt={`Room ${room.roomNumber} - Image ${
                            currentImageIndex + 1
                          }`}
                          className="w-full h-full object-cover"
                        />

                        {/* Navigation Arrows */}
                        {roomImages.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevImage}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#b27c1f] hover:bg-[#8b6318] text-white p-4 rounded-full shadow-2xl transition-all cursor-pointer hover:scale-110 z-10"
                              title="Previous image"
                            >
                              <FaArrowLeft className="text-2xl" />
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#b27c1f] hover:bg-[#8b6318] text-white p-4 rounded-full shadow-2xl transition-all cursor-pointer hover:scale-110 z-10"
                              title="Next image"
                            >
                              <FaArrowRight className="text-2xl" />
                            </button>
                          </>
                        )}

                        {/* Image Counter */}
                        {roomImages.length > 1 && (
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            {/* Play/Pause Button */}
                            <button
                              onClick={toggleAutoPlay}
                              className="bg-black/70 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all cursor-pointer"
                              title={
                                isAutoPlaying
                                  ? "Pause slideshow"
                                  : "Play slideshow"
                              }
                            >
                              {isAutoPlaying ? (
                                <FaPause className="text-sm" />
                              ) : (
                                <FaPlay className="text-sm" />
                              )}
                            </button>

                            {/* Counter */}
                            <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                              {currentImageIndex + 1} / {roomImages.length}
                            </div>
                          </div>
                        )}

                        {/* Dots Indicator */}
                        {roomImages.length > 1 && roomImages.length <= 5 && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {roomImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => handleThumbnailClick(index)}
                                className={`transition-all cursor-pointer ${
                                  index === currentImageIndex
                                    ? "bg-white w-8 h-2"
                                    : "bg-white/50 hover:bg-white/70 w-2 h-2"
                                } rounded-full`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Gallery */}
                      {roomImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {roomImages.map((image, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleThumbnailClick(index)}
                              whileHover={{
                                scale: 1.05,
                              }}
                              whileTap={{
                                scale: 0.95,
                              }}
                              className={`relative flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                index === currentImageIndex
                                  ? "ring-4 ring-[#b27c1f] shadow-lg"
                                  : "ring-2 ring-gray-200 hover:ring-gray-300 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {index === currentImageIndex && (
                                <div className="absolute inset-0 bg-[#b27c1f]/20 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                                </div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Card */}
                  <div
                    className={`mb-6 p-6 rounded-xl border ${
                      statusConfig[room.status].bg
                    } ${statusConfig[room.status].borderColor} shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                          Current Status
                        </p>
                        <div
                          className={`inline-flex items-center px-5 py-2.5 rounded-lg font-bold text-base ${
                            statusConfig[room.status].text
                          } ${statusConfig[room.status].bg} border ${
                            statusConfig[room.status].borderColor
                          }`}
                        >
                          {statusConfig[room.status].label}
                        </div>
                      </div>
                      <button
                        onClick={onChangeStatus}
                        className="flex items-center gap-2 px-5 py-3 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                      >
                        <FaExchangeAlt />
                        <span>Change Status</span>
                      </button>
                    </div>
                  </div>

                  {/* Amenities  */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#b27c1f] to-[#eab354] rounded-lg">
                          <FaConciergeBell className="text-white text-lg" />
                        </div>
                        <span>Room Amenities</span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {room.amenities.map((amenity, idx) => {
                          const amenityKey = amenity
                            .toLowerCase()
                            .replace(/\s+/g, "");
                          const icon = amenityIcons[amenityKey] || (
                            <FaConciergeBell />
                          );
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 px-4 py-3.5 rounded-xl hover:shadow-md hover:border-[#b27c1f]/30 transition-all group"
                            >
                              <span className="text-xl text-[#b27c1f] group-hover:scale-110 transition-transform">
                                {icon}
                              </span>
                              <span className="font-medium text-gray-700">
                                {amenity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Thông tin bổ sung */}
                  <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#b27c1f] to-[#eab354] rounded-lg">
                        <FaStickyNote className="text-white text-lg" />
                      </div>
                      <span>Additional Information</span>
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FaClock className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Last Cleaned
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date().toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <FaCalendarAlt className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Availability
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {room.status === "available"
                              ? "Ready for booking"
                              : "Currently unavailable"}
                          </p>
                        </div>
                      </div>
                      {room.notes && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <FaStickyNote className="text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs text-amber-600 font-medium mb-1">
                              Notes
                            </p>
                            <p className="text-sm text-gray-700">
                              {room.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions*/}
                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(room)}
                      className="flex-1 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105"
                    >
                      <FaEdit />
                      <span>Edit Room</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (onViewBookings && room.roomNumber) {
                        onViewBookings(room.roomNumber);
                      }
                      onClose();
                    }}
                    className="flex-1 bg-[#6b5e4c] hover:bg-[#5a4d3e] text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <FaCalendarAlt />
                    <span>View Bookings</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RoomDetailModal;

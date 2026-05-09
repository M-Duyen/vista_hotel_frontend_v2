import React from "react";
import { motion } from "framer-motion";
import { FaBed, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import type { RoomType } from "../../types/RoomType";

interface RoomTypeCardProps {
  roomType: RoomType;
  onView: (roomType: RoomType) => void;
  onEdit: (roomType: RoomType) => void;
  onDelete: (roomType: RoomType) => void;
}

const RoomTypeCard: React.FC<RoomTypeCardProps> = ({
  roomType,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
      className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={() => onView(roomType)}
    >
      <div className="bg-gold p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <FaBed className="text-2xl sm:text-3xl" />
          <span className="text-xs sm:text-sm font-mono bg-white/20 px-2 sm:px-3 py-1 rounded">
            {roomType.roomTypeID}
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold mt-3 sm:mt-4">
          {roomType.typeName}
        </h3>
      </div>

      <div className="p-4 sm:p-6 space-y-3 flex-1 flex flex-col">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Base Price:</span>
            <span className="font-semibold text-[#6b5e4c] truncate ml-2">
              {roomType.basePrice?.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Capacity:</span>
            <span className="font-semibold">
              {roomType.maxOccupancy} guests
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-600">Area:</span>
            <span className="font-semibold">{roomType.area}m²</span>
          </div>
        </div>

        <div className="pt-2 border-t min-h-[48px]">
          {roomType.description ? (
            <p className="text-sm text-gray-600 line-clamp-2">
              {roomType.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">No description</p>
          )}
        </div>

        <div className="flex gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(roomType);
            }}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#e3f2fd] text-[#1976d2] rounded-lg hover:bg-[#bbdefb] transition-colors text-xs sm:text-sm font-medium cursor-pointer flex items-center justify-center gap-1"
          >
            <FaEye className="text-sm" />{" "}
            <span className="hidden sm:inline">View</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(roomType);
            }}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-[#fff8e1] text-[#f57c00] rounded-lg hover:bg-[#ffecb3] transition-colors text-xs sm:text-sm font-medium cursor-pointer flex items-center justify-center gap-1"
          >
            <FaEdit className="text-sm" />{" "}
            <span className="hidden sm:inline">Edit</span>
          </button>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(roomType);
            }}
            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-[#ffebee] text-[#c62828] rounded-lg hover:bg-[#ffcdd2] transition-colors text-xs sm:text-sm font-medium cursor-pointer"
          >
            <FaTrash className="text-sm" />
          </button> */}
        </div>
      </div>
    </motion.div>
  );
};

export default RoomTypeCard;

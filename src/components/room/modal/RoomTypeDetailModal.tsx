import React from "react";
import { motion } from "framer-motion";
import { FaEdit } from "react-icons/fa";
import type { RoomType } from "../../../types/RoomType";
import { FaTimes } from "react-icons/fa";

interface RoomTypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType: RoomType | null;
  onEdit: (roomType: RoomType) => void;
}

const RoomTypeDetailModal: React.FC<RoomTypeDetailModalProps> = ({
  isOpen,
  onClose,
  roomType,
  onEdit,
}) => {
  if (!isOpen || !roomType) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white text-gray-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{roomType.typeName}</h2>
            <p className="text-sm text-gray-600 mt-1">{roomType.roomTypeID}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#f5f0eb] rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Base Price</p>
              <p className="text-2xl font-bold text-[#6b5e4c]">
                {roomType.basePrice?.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <div className="bg-[#f5f0eb] rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Area</p>
              <p className="text-2xl font-bold text-[#6b5e4c]">
                {roomType.area}m²
              </p>
            </div>
          </div>

          <div className="bg-[#f5f0eb] rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Max Occupancy</p>
            <p className="text-xl font-bold text-[#6b5e4c]">
              {roomType.maxOccupancy} guests
            </p>
          </div>

          {roomType.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{roomType.description}</p>
            </div>
          )}

          {roomType.amenties && roomType.amenties.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {roomType.amenties.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#f5f0eb] text-gray-700 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                onEdit(roomType);
                onClose();
              }}
              className="px-6 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaEdit className="inline mr-2" />
              Edit Room Type
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoomTypeDetailModal;
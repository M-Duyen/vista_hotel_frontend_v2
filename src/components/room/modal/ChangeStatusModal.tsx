import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaTimes,
  FaCheck,
  FaBed,
  FaDoorOpen,
  FaBroom,
  FaTools,
} from "react-icons/fa";
import type { Room } from "../view/RoomTableView";

interface ChangeStatusModalProps {
  room: Room | null;
  onClose: () => void;
  onConfirm: (roomId: string, newStatus: Room["status"], note?: string) => void;
}

/**
 * Modal để thay đổi trạng thái phòng với ghi chú
 */
const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  room,
  onClose,
  onConfirm,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Room["status"] | null>(
    null
  );
  const [note, setNote] = useState("");

  if (!room) return null;

  const statusOptions: Array<{
    value: Room["status"];
    label: string;
    description: string;
    color: string;
    bgColor: string;
    textColor: string;
    icon: React.ReactElement;
  }> = [
    {
      value: "available",
      label: "Available",
      description: "Room is ready for check-in",
      color: "hover:border-green-400",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      icon: <FaDoorOpen className="text-2xl" />,
    },
    {
      value: "occupied",
      label: "Occupied",
      description: "Room is currently occupied by guest",
      color: "hover:border-blue-400",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      icon: <FaBed className="text-2xl" />,
    },
    {
      value: "cleaning",
      label: "Cleaning",
      description: "Room is being cleaned",
      color: "hover:border-yellow-400",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      icon: <FaBroom className="text-2xl" />,
    },
    {
      value: "maintenance",
      label: "Maintenance",
      description: "Room is under maintenance",
      color: "hover:border-red-400",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      icon: <FaTools className="text-2xl" />,
    },
  ];

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(room.id, selectedStatus, note);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#6b5e4c] to-[#8b7355] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Change Room Status
              </h2>
              <p className="text-white/80 text-sm">
                Update the current status of the room
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              <FaTimes className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Content with scroll */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Room Info Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Room</div>
            <div className="text-2xl font-bold text-gray-800">
              {room.roomNumber}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {typeof room.roomType === "string"
                ? room.roomType
                : room.roomType.typeName}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-3">
              Select New Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => {
                const isSelected = selectedStatus === option.value;
                const isCurrent = room.status === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    disabled={isCurrent}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `${option.bgColor} border-[#6b5e4c] shadow-lg scale-105`
                        : isCurrent
                        ? "bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed"
                        : `bg-white border-gray-200 ${option.color} hover:shadow-md`
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div
                        className={
                          isSelected ? option.textColor : "text-gray-600"
                        }
                      >
                        {option.icon}
                      </div>
                      <div>
                        <div
                          className={`font-bold text-sm ${
                            isSelected ? option.textColor : "text-gray-800"
                          }`}
                        >
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {option.description}
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 bg-[#6b5e4c] text-white rounded-full p-1"
                        >
                          <FaCheck className="text-xs" />
                        </motion.div>
                      )}

                      {isCurrent && (
                        <span className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
                          Current
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label
              htmlFor="note"
              className="block text-base font-semibold text-gray-800 mb-2"
            >
              Note{" "}
              <span className="text-gray-500 text-sm font-normal">
                (Optional)
              </span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this status change..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6b5e4c] focus:border-[#6b5e4c] outline-none resize-none transition-all"
              rows={3}
            />
          </div>
        </div>

        {/* Footer with actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedStatus || selectedStatus === room.status}
            className="flex-1 bg-gradient-to-r from-[#6b5e4c] to-[#8b7355] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Confirm Change
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChangeStatusModal;

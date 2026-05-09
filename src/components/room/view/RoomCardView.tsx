import React from 'react';
import { FaEdit, FaEye, FaTrashAlt, FaUsers, FaBed } from 'react-icons/fa';
import { motion } from 'framer-motion';
import type { Room } from './RoomTableView';

interface RoomCardViewProps {
    rooms: Room[];
    onEdit: (room: Room) => void;
    onView: (room: Room) => void;
    onDelete: (room: Room) => void;
}

const statusConfig = {
    available: {
        label: 'Available',
        bgColor: 'bg-[#e8f5e9]',
        textColor: 'text-[#2e7d32]',
        borderColor: 'border-[#2e7d32]',
    },
    occupied: {
        label: 'Booked',
        bgColor: 'bg-[#e3f2fd]',
        textColor: 'text-[#1976d2]',
        borderColor: 'border-[#1976d2]',
    },
    maintenance: {
        label: 'Unavailable',
        bgColor: 'bg-[#ffebee]',
        textColor: 'text-[#c62828]',
        borderColor: 'border-[#c62828]',
    },
    cleaning: {
        label: 'Cleaning',
        bgColor: 'bg-[#fff8e1]',
        textColor: 'text-[#f57c00]',
        borderColor: 'border-[#f57c00]',
    },
};

/**
 * Component hiển thị danh sách phòng dạng card
 * @param rooms - Danh sách phòng
 * @param onEdit - Callback khi chỉnh sửa phòng
 * @param onView - Callback khi xem chi tiết phòng
 * @param onDelete - Callback khi xóa phòng
 */
const RoomCardView: React.FC<RoomCardViewProps> = ({
    rooms,
    onEdit,
    onView,
    onDelete,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room, index) => (
                <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-sm border border-[#ebe3d7] overflow-hidden group cursor-pointer"
                    onClick={() => onView(room)}
                >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-[#ccbda3] to-[#ebe3d7] overflow-hidden pointer-events-none">
                        {room.image ? (
                            <img
                                src={room.image}
                                alt={room.roomNumber}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <FaBed className="text-6xl text-white opacity-50" />
                            </div>
                        )}
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                            <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    statusConfig[room.status].bgColor
                                } ${
                                    statusConfig[room.status].textColor
                                } backdrop-blur-sm`}
                            >
                                {statusConfig[room.status].label}
                            </span>
                        </div>
                        {/* Room Number Badge */}
                        <div className="absolute bottom-3 left-3">
                            <span className="px-4 py-2 bg-white text-gray-900 font-bold text-lg rounded-lg shadow-lg">
                                {room.roomNumber}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {typeof room.roomType === 'string'
                                ? room.roomType
                                : room.roomType.typeName}
                        </h3>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <FaUsers className="text-gray-400" />
                                    Capacity
                                </span>
                                <span className="font-medium">
                                    {room.capacity} guest
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Floor</span>
                                <span className="font-medium">
                                    Floor {room.floor}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <div className="text-sm text-gray-600">
                                    Price/Night
                                </div>
                                <div className="text-xl font-bold text-[#6b5e4c]">
                                    {room.price.toLocaleString('vi-VN')} VNĐ
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-1">
                                    {room.amenities
                                        .slice(0, 3)
                                        .map((amenity, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                            >
                                                {amenity}
                                            </span>
                                        ))}
                                    {room.amenities.length > 3 && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                            +{room.amenities.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView(room);
                                }}
                                className="flex-1 py-2 px-3 text-sm font-medium text-[#1976d2] bg-[#e3f2fd] hover:bg-[#bbdefb] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                title="View details"
                            >
                                <FaEye />
                                View
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(room);
                                }}
                                className="flex-1 py-2 px-3 text-sm font-medium text-[#2e7d32] bg-[#e8f5e9] hover:bg-[#c8e6c9] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                title="Edit"
                            >
                                <FaEdit />
                                Edit
                            </button>
                            {/* <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(room);
                                }}
                                className="py-2 px-3 text-sm font-medium text-[#c62828] bg-[#ffebee] hover:bg-[#ffcdd2] rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                            >
                                <FaTrashAlt />
                            </button> */}
                        </div>
                    </div>
                </motion.div>
            ))}
            {rooms.length === 0 && (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No rooms found</p>
                </div>
            )}
        </div>
    );
};

export default RoomCardView;

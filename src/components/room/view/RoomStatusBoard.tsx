import React from 'react';
import { FaBed, FaUser, FaClock } from 'react-icons/fa';
import type { Room } from './RoomTableView';

interface RoomStatusBoardProps {
    rooms: Room[];
    onRoomClick: (room: Room) => void;
}

/**
 * Component hiển thị bảng trạng thái phòng theo tầng
 * Visual board để xem nhanh tình trạng tất cả phòng
 */
const RoomStatusBoard: React.FC<RoomStatusBoardProps> = ({
    rooms,
    onRoomClick,
}) => {
    // Group rooms by floor
    const roomsByFloor = rooms.reduce((acc, room) => {
        if (!acc[room.floor]) {
            acc[room.floor] = [];
        }
        acc[room.floor].push(room);
        return acc;
    }, {} as Record<number, Room[]>);

    const floors = Object.keys(roomsByFloor)
        .map(Number)
        .sort((a, b) => b - a); // Sort descending

    const getStatusColor = (status: Room['status']) => {
        switch (status) {
            case 'available':
                return {
                    bg: 'bg-[#e8f5e9]',
                    border: 'border-[#2e7d32]',
                    text: 'text-[#2e7d32]',
                    icon: 'text-[#2e7d32]',
                };
            case 'occupied':
                return {
                    bg: 'bg-[#e3f2fd]',
                    border: 'border-[#1976d2]',
                    text: 'text-[#1976d2]',
                    icon: 'text-[#1976d2]',
                };
            case 'maintenance':
                return {
                    bg: 'bg-[#ffebee]',
                    border: 'border-[#c62828]',
                    text: 'text-[#c62828]',
                    icon: 'text-[#c62828]',
                };
            case 'cleaning':
                return {
                    bg: 'bg-[#fff8e1]',
                    border: 'border-[#f57c00]',
                    text: 'text-[#f57c00]',
                    icon: 'text-[#f57c00]',
                };
        }
    };

    const getStatusLabel = (status: Room['status']) => {
        switch (status) {
            case 'available':
                return 'Available';
            case 'occupied':
                return 'Occupied';
            case 'maintenance':
                return 'Maintenance';
            case 'cleaning':
                return 'Cleaning';
        }
    };

    const getStatusIcon = (status: Room['status']) => {
        switch (status) {
            case 'available':
                return FaBed;
            case 'occupied':
                return FaUser;
            case 'maintenance':
                return FaClock;
            case 'cleaning':
                return FaClock;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#ebe3d7]">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Room Status Board
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Real-time room status overview by floor
                </p>
            </div>

            <div className="space-y-8">
                {floors.map((floor) => (
                    <div key={floor}>
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                Floor {floor}
                            </h3>
                            <span className="text-sm text-gray-500">
                                ({roomsByFloor[floor].length} rooms)
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {roomsByFloor[floor]
                                .sort((a, b) =>
                                    a.roomNumber.localeCompare(b.roomNumber),
                                )
                                .map((room) => {
                                    const colors = getStatusColor(room.status);
                                    const Icon = getStatusIcon(room.status);
                                    return (
                                        <button
                                            key={room.id}
                                            onClick={() => onRoomClick(room)}
                                            className={`${colors.bg} ${colors.border} border-2 rounded-lg p-2 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group`}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Icon
                                                    className={`text-xl ${colors.icon}`}
                                                />
                                                <span
                                                    className={`text-md font-bold ${colors.text}`}
                                                >
                                                    {room.roomNumber}
                                                </span>
                                                <span className="text-xs text-gray-600 text-center">
                                                    {typeof room.roomType ===
                                                    'string'
                                                        ? room.roomType
                                                        : room.roomType
                                                              .typeName}
                                                </span>
                                                <span
                                                    className={`text-xs font-medium ${colors.text} mt-1`}
                                                >
                                                    {getStatusLabel(
                                                        room.status,
                                                    )}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomStatusBoard;

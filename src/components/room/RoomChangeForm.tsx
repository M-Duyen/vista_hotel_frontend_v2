import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Home } from 'lucide-react';
import { roomService } from '../../services/roomService';
import type { Room } from '../../types/Room';
import type { Booking } from '../../types/Booking';
import { useToast } from '../../hooks/useToast';

interface RoomChangeFormProps {
    currentBooking?: Booking;
    onSubmit: (data: RoomChangeRequest) => Promise<void>;
    onCancel: () => void;
}

export interface RoomChangeRequest {
    bookingId: string;
    currentRoomNumber: string;
    newRoomNumber: string;
    reason: string;
    requestDate: string;
}

const RoomChangeForm: React.FC<RoomChangeFormProps> = ({
    currentBooking,
    onSubmit,
    onCancel,
}) => {
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<string>('');
    const [reason, setReason] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const { success, error } = useToast();

    useEffect(() => {
        loadAvailableRooms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAvailableRooms = async () => {
        setIsLoadingRooms(true);
        try {
            const rooms = await roomService.getAll();
            // Get current room number
            const currentRoomNumber =
                currentBooking?.bookingDetails?.[0]?.room?.roomNumber;
            // Filter only available rooms and exclude current room
            const available = rooms.filter(
                (room: Room) =>
                    room.status === 'AVAILABLE' &&
                    room.roomNumber !== currentRoomNumber,
            );
            setAvailableRooms(available);
        } catch (err) {
            console.error('Error loading rooms:', err);
            error('Unable to load room list');
        } finally {
            setIsLoadingRooms(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRoom) {
            error('Please select a new room');
            return;
        }

        if (!reason.trim()) {
            error('Please enter a reason for room change');
            return;
        }

        if (!currentBooking) {
            error('Booking information not found');
            return;
        }

        setIsLoading(true);
        try {
            const requestData: RoomChangeRequest = {
                bookingId: currentBooking.bookingID,
                currentRoomNumber:
                    currentBooking.bookingDetails?.[0]?.room?.roomNumber || '',
                newRoomNumber: selectedRoom,
                reason: reason.trim(),
                requestDate: new Date().toISOString(),
            };

            await onSubmit(requestData);
            success('Room change request submitted successfully');
        } catch (err) {
            console.error('Error submitting room change request:', err);
            error('An error occurred while submitting the request');
        } finally {
            setIsLoading(false);
        }
    };

    const currentRoomNumber =
        currentBooking?.bookingDetails?.[0]?.room?.roomNumber || 'N/A';
    const currentRoomType =
        currentBooking?.bookingDetails?.[0]?.room?.roomType?.typeName || 'N/A';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Room Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Current Room
                </h3>
                <div className="space-y-1 text-sm">
                    <p>
                        <span className="text-gray-600">Room Number:</span>{' '}
                        <span className="font-semibold text-gray-900">
                            {currentRoomNumber}
                        </span>
                    </p>
                    <p>
                        <span className="text-gray-600">Room Type:</span>{' '}
                        <span className="font-semibold text-gray-900">
                            {currentRoomType}
                        </span>
                    </p>
                </div>
            </div>

            {/* Select New Room */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select New Room <span className="text-red-500">*</span>
                </label>
                {isLoadingRooms ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#CCBDA3]"></div>
                    </div>
                ) : availableRooms.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="text-gray-700">
                            No available rooms at the moment
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto p-1">
                        {availableRooms.map((room) => (
                            <label
                                key={room.roomNumber}
                                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-[#CCBDA3] ${
                                    selectedRoom === room.roomNumber
                                        ? 'border-[#CCBDA3] bg-[#CCBDA3]/5'
                                        : 'border-gray-200'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="room"
                                    value={room.roomNumber}
                                    checked={selectedRoom === room.roomNumber}
                                    onChange={(e) =>
                                        setSelectedRoom(e.target.value)
                                    }
                                    className="w-4 h-4 text-[#CCBDA3] focus:ring-[#CCBDA3]"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">
                                        Room {room.roomNumber}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {room.roomType?.typeName || 'N/A'} -
                                        Floor {room.floor || 'N/A'}
                                    </div>
                                    {room.roomType?.basePrice && (
                                        <div className="text-sm text-[#CCBDA3] font-semibold mt-1">
                                            {Number(
                                                room.roomType.basePrice,
                                            ).toLocaleString()}{' '}
                                            VND/night
                                        </div>
                                    )}
                                </div>
                                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    Available
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Reason */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Room Change{' '}
                    <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CCBDA3] focus:border-[#CCBDA3] resize-none"
                    placeholder="Please describe the reason you want to change rooms..."
                    required
                />
                <p className="mt-1 text-xs text-gray-500">
                    Example: Current room is noisy, want to move to a higher
                    floor, etc.
                </p>
            </div>

            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700 space-y-1">
                        <p className="font-semibold text-amber-900">
                            Important Notes:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>
                                Room change requests will be reviewed and
                                approved by staff
                            </li>
                            <li>
                                Additional charges may apply if the new room has
                                a higher price
                            </li>
                            <li>
                                Processing time is usually 30 minutes to 2 hours
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !selectedRoom || !reason.trim()}
                    className="flex-1 px-6 py-3 bg-[#CCBDA3] text-white rounded-lg hover:bg-[#b8a88a] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Submitting...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Submit Request</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default RoomChangeForm;
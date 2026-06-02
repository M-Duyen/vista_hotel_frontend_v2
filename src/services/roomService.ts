// import { api } from './apiClient';
import type { Room, RoomStatus } from '../types/Room';
import { roomsApi, roomTypesApi } from './apiClient';

// const ENDPOINT = '/rooms';

export const getAll = async () => {
    try {
        const response = await roomsApi.get('');
        return response.data;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
    }
};

export const getById = async (id: string) => {
    try {
        const response = await roomsApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching room by ID:', error);
        throw error;
    }
};

export const getAllRooms = async () => {
    return getAll();
};

export const getRoomById = async (id: string) => {
    return getById(id);
};

export const calculateStayRoomPrices = async (
    roomIds: string[],
    checkInDate: string,
    checkOutDate: string,
): Promise<Record<string, number>> => {
    try {
        const params = new URLSearchParams();
        roomIds.forEach((roomId) => params.append('roomIds', roomId));
        params.append('checkInDate', checkInDate);
        params.append('checkOutDate', checkOutDate);

        const response = await roomsApi.get('/stay-price', { params });
        return response.data || {};
    } catch (error) {
        console.error('Error calculating stay room prices:', error);
        throw error;
    }
};

// Tạo phòng mới
export const createRoom = async (roomData: Partial<Room>) => {
    try {
        const response = await roomsApi.post('/save', roomData);
        return response.data;
    } catch (error) {
        console.error('Error creating room:', error);
        throw error;
    }
};

// Cập nhật phòng hiện có
export const updateRoom = async (id: string, roomData: Partial<Room>) => {
    try {
        const response = await roomsApi.post(`/save`, roomData);
        return response.data;
    } catch (error) {
        console.error('Error updating room:', error);
        throw error;
    }
};

// Save room (create or update)
export const saveRoom = async (
    roomData: Partial<Room> & { roomNumber?: string },
) => {
    try {
        const response = await roomsApi.post('/save', roomData);
        return response.data;
    } catch (error) {
        console.error('Error saving room:', error);
        throw error;
    }
};

// Delete room
export const deleteRoom = async (id: string) => {
    try {
        const response = await roomsApi.delete(`/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting room:', error);
        throw error;
    }
};

// Lấy danh sách loại phòng
export const getAllRoomTypes = async () => {
    try {
        const response = await roomTypesApi.get('');
        return response.data;
    } catch (error) {
        console.error('Error fetching room types:', error);
        throw error;
    }
};

// Lấy số phòng tiếp theo dựa trên tầng và loại phòng
export const getNextRoomNumber = async (floor: number, roomTypeId: string) => {
    try {
        const rooms = await getAll();

        // Map ID loại phòng thành tiền tố
        const typePrefixMap: { [key: string]: string } = {
            STE: 'STE',
            STD: 'STD',
            DLX: 'DLX',
        };

        const prefix = typePrefixMap[roomTypeId] || 'RM';

        // Tìm phòng hiện có có cùng tiền tố và tầng
        const existingRooms = rooms.filter((room: Partial<Room>) => {
            const roomNum = room.roomNumber || '';
            return (
                roomNum.startsWith(prefix) &&
                roomNum.length >= 3 &&
                parseInt(roomNum.charAt(3)) === floor
            );
        });

        // Lấy số phòng cao nhất cho tầng này
        let maxNumber = 0;
        existingRooms.forEach((room: Partial<Room>) => {
            const roomNum = room.roomNumber || '';
            if (roomNum.length >= 6) {
                const number = parseInt(roomNum.substring(3)); // Lấy tầng + số thứ tự
                if (!isNaN(number) && Math.floor(number / 100) === floor) {
                    const sequence = number % 100;
                    if (sequence > maxNumber) {
                        maxNumber = sequence;
                    }
                }
            }
        });

        // Tạo số phòng tiếp theo
        const nextSequence = (maxNumber + 1).toString().padStart(2, '0');
        return `${prefix}${floor}${nextSequence}`;
    } catch (error) {
        console.error('Error generating next room number:', error);
        throw error;
    }
};

// Cập nhật trạng thái phòng
export const updateRoomStatus = async (
    roomNumber: string,
    newStatus: RoomStatus,
    note?: string,
): Promise<Room> => {
    try {
        // Lấy thông tin room hiện tại
        const room = await getById(roomNumber);

        if (!room) {
            throw new Error(`Room ${roomNumber} not found`);
        }

        // Cập nhật status và note
        const updateRoom = {
            ...room,
            status: newStatus,
            notes: note || room.notes,
        };

        // Gọi API để lưu thay đổi
        const response = await roomsApi.post('/save', updateRoom);
        return response.data;
    } catch (error) {
        console.error('Error updating room status:', error);
        throw error;
    }
};

// Lấy danh sách phòng trống theo khoảng thời gian (ISO datetime)
export const getAvailableRooms = async (
    startDate: string, // ISO datetime: YYYY-MM-DDTHH:mm:ss
    endDate: string, // ISO datetime: YYYY-MM-DDTHH:mm:ss
): Promise<Room[]> => {
    try {
        const response = await roomsApi.get('/available', {
            params: { startDate, endDate },
        });
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching available rooms:', error);
        throw error;
    }
};

// Search rooms with various query params (calls backend /search)
export const searchRooms = async (params: {
    q?: string;
    roomNumber?: string;
    floor?: number;
    status?: RoomStatus;
    roomTypeId?: string;
}) => {
    try {
        const response = await roomsApi.get('/search', { params });
        return response.data;
    } catch (error) {
        console.error('Error searching rooms:', error);
        throw error;
    }
};

export const roomService = {
    getAll,
    getAllRooms,
    getById,
    getRoomById,
    calculateStayRoomPrices,
    createRoom,
    updateRoom,
    saveRoom,
    deleteRoom,
    getAllRoomTypes,
    getNextRoomNumber,
    updateRoomStatus,
    getAvailableRooms, // added
    searchRooms,
};

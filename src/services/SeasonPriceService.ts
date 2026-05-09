import { api } from './apiClient';
import axios from 'axios';
import type { SeasonPrice } from '../types/SeasonPrice';

const ENDPOINT = '/seasonal-prices';

export const getAllSeasonalPrices = async (): Promise<SeasonPrice[]> => {
    try {
        const response = await api.get(ENDPOINT);
        return response.data;
    } catch (error: Error | unknown) {
        console.error('Error fetching seasonal prices:', error);
        throw formatAxiosError(error);
    }
};

export const getSeasonalPriceById = async (
    id: string | number,
): Promise<SeasonPrice> => {
    try {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    } catch (error: Error | unknown) {
        console.error(`Error fetching seasonal price ${id}:`, error);
        throw formatAxiosError(error);
    }
};

/**
 * Create or Update seasonal price with room type associations
 * Backend endpoint: POST /seasonal-prices/seasonal-price
 * Backend method: createOrUpdateSeasonPrice
 * - If seasonalPrice.id is null/undefined -> create new
 * - If seasonalPrice.id exists -> update existing
 * @param priceDTO - Contains seasonalPrice and roomTypeIDs
 * @returns Promise<SeasonPrice>
 */
export async function saveSeasonalPriceWithRoomTypes(priceDTO: {
    seasonalPrice: Partial<SeasonPrice>;
    roomTypeIDs?: string[];
}): Promise<SeasonPrice> {
    try {
        const res = await api.post(
            `${ENDPOINT}/save-with-room-types`,
            priceDTO,
        );
        return res.data;
    } catch (err: Error | unknown) {
        const action = priceDTO.seasonalPrice.id ? 'updating' : 'creating';
        console.error(`Error ${action} seasonal price:`, err);
        throw formatAxiosError(err);
    }
}

// delete (backend: DELETE /seasonal-prices/{id})
export const deleteSeasonalPrice = async (id: string | number) => {
    try {
        const res = await api.delete(`${ENDPOINT}/${id}`);
        return res.data as string;
    } catch (err: unknown) {
        console.error(`Error deleting seasonal price ${id}:`, err);
        if (axios.isAxiosError(err)) {
            const resp = err.response;
            if (resp && resp.data) {
                const data = resp.data;
                const msg =
                    typeof data === 'string'
                        ? data
                        : (data as { message?: string }).message ??
                          JSON.stringify(data);
                throw new Error(msg);
            }
        }
        throw err;
    }
};

// Additional endpoints that return PriceDTOs (seasonal prices with room-type details)
export const getAllSeasonalPrices_RoomType = async (): Promise<[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/room-types`);
        return response.data;
    } catch (error: Error | unknown) {
        console.error('Error fetching seasonal prices room types:', error);
        throw formatAxiosError(error);
    }
};

export const getSeasonalPrice_RoomTypeById = async (
    id: string | number,
): Promise<Error | unknown> => {
    try {
        const response = await api.get(`${ENDPOINT}/room-types/${id}`);
        return response.data;
    } catch (error: Error | unknown) {
        console.error(`Error fetching seasonal price room type ${id}:`, error);
        throw formatAxiosError(error);
    }
};

// helper to normalize axios/server errors
function formatAxiosError(err: Error | unknown): Error {
    if (axios.isAxiosError(err)) {
        const resp = err.response;
        if (resp && resp.data) {
            const data = resp.data;
            const msg =
                typeof data === 'string'
                    ? data
                    : data.message ?? JSON.stringify(data);
            return new Error(msg);
        }
        return new Error(err.message || 'Network error');
    }
    return err instanceof Error ? err : new Error(String(err));
}

export default {
    getAllSeasonalPrices,
    getSeasonalPriceById,
    saveSeasonalPriceWithRoomTypes,
    deleteSeasonalPrice,
    getAllSeasonalPrices_RoomType,
    getSeasonalPrice_RoomTypeById,
};

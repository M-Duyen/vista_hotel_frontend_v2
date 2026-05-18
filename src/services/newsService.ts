/* eslint-disable */
import { newsApi } from './apiClient';
import type { News } from '../types/News';

const ENDPOINT = '';

export const getAll = async () => {
    try {
        const response = await newsApi.get(ENDPOINT);
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
};

// Lấy tin nổi bật
export const getHighlighted = async () => {
    try {
        const response = await newsApi.get(`${ENDPOINT}/highlight`);
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching highlighted news:', error);
        return [];
    }
};

// Lấy theo ID
export const getNewsById = async (newsId: string): Promise<News | null> => {
    try {
        const response = await newsApi.get(`${ENDPOINT}/${newsId}`);
        return response.data?.data || response.data;
    } catch (error) {
        console.error(`Error fetching news ${newsId}:`, error);
        return null;
    }
};

// Thêm tin tức
export const createNews = async (data: any) => {
    const response = await newsApi.post(`${ENDPOINT}/create`, data);
    return response.data;
};

// Cập nhật tin tức
export const updateNews = async (newsId: string, data: any) => {
    const response = await newsApi.put(`${ENDPOINT}/update/${newsId}`, data);
    return response.data;
};

// Xóa tin tức
export const deleteNews = async (newsId: string) => {
    const response = await newsApi.delete(`${ENDPOINT}/delete/${newsId}`);
    return response.data;
};

export default {
    getAll,
    getHighlighted,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
};

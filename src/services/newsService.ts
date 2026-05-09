/* eslint-disable */
import { api } from './apiClient';
import type { News } from '../types/News';

const ENDPOINT = '/news';

// Lấy tất cả
export const getAll = async () => {
    const response = await api.get(ENDPOINT);
    return response.data;
};

// Lấy tin nổi bật
export const getHighlighted = async () => {
    const response = await api.get(`${ENDPOINT}/highlight`);
    return response.data;
};

// Lấy tin theo newsId
export const getNewsById = async (newsId: string): Promise<News> => {
    const response = await api.get(`${ENDPOINT}/${newsId}`);
    return response.data;
};

// Thêm tin tức
export const createNews = async (data: any) => {
    const response = await api.post(`${ENDPOINT}/create`, data);
    return response.data;
};

// Cập nhật tin tức
export const updateNews = async (newsId: string, data: any) => {
    const response = await api.put(`${ENDPOINT}/update/${newsId}`, data);
    return response.data;
};

export default {
    getAll,
    getHighlighted,
    getNewsById,
    createNews,
    updateNews,
};

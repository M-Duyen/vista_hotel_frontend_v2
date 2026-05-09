import { api } from './apiClient';
import type { Employee } from '../types/Employee';

const ENDPOINT = '/employees';

// Lấy danh sách tất cả nhân viên
export const getAll = async (): Promise<Employee[]> => {
    try {
        const response = await api.get(ENDPOINT);
        return response.data;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

// Tìm kiếm nhân viên theo tên
export const searchEmployees = async (name: string): Promise<Employee[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/search`, {
            params: { name },
        });
        return response.data;
    } catch (error) {
        console.error('Error searching employees:', error);
        throw error;
    }
};

// Lấy thông tin nhân viên theo ID
export const getById = async (id: string): Promise<Employee> => {
    try {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        throw error;
    }
};

// Thêm nhân viên mới
export const create = async (
    employee: Partial<Employee>,
): Promise<Employee> => {
    try {
        console.log('Creating new employee:', employee);
        const response = await api.post(`${ENDPOINT}/save`, employee);
        return response.data;
    } catch (error) {
        console.error('Error creating employee:', error);
        throw error;
    }
};

// Cập nhật thông tin nhân viên
export const update = async (
    id: string,
    employee: Partial<Employee>,
): Promise<Employee> => {
    try {
        console.log('Updating employee with ID:', id, 'Data:', employee);
        // Bao gồm ID trong employee data để backend biết đây là update
        const employeeWithId = { ...employee, id };
        const response = await api.post(`${ENDPOINT}/save`, employeeWithId);
        return response.data;
    } catch (error) {
        console.error('Error updating employee with ID:', id, error);
        throw error;
    }
};

// Thêm hoặc cập nhật nhân viên (để tương thích ngược)
export const createOrUpdate = async (
    employee: Partial<Employee>,
): Promise<Employee> => {
    try {
        if (employee.id) {
            return await update(employee.id, employee);
        } else {
            return await create(employee);
        }
    } catch (error) {
        console.error('Error saving employee:', error);
        throw error;
    }
};

// Xóa nhân viên
export const deleteEmployee = async (id: string): Promise<void> => {
    try {
        await api.delete(`${ENDPOINT}/${id}`);
    } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
    }
};

// Cập nhật trạng thái nhân viên
export const updateStatus = async (
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
): Promise<Employee> => {
    try {
        const response = await api.patch(`${ENDPOINT}/${id}/status`, {
          status,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating employee status:', error);
        throw error;
    }
};

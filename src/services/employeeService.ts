/* eslint-disable */
import { usersApi } from './apiClient';
import type { Employee } from '../types/Employee';

// Endpoint để lấy danh sách nhân viên từ User Service
const ENDPOINT = '/role/EMPLOYEE';

const normalizeEmployeePayload = (employee: Partial<Employee>) => {
    const username = employee.username || employee.userName || '';
    const employeeStatus = employee.employeeStatus || employee.status || 'ACTIVE';

    return {
        username,
        email: employee.email,
        fullName: employee.fullName,
        password: employee.password,
        phone: employee.phone,
        address: employee.address,
        avatarUrl: (employee as any).avatarUrl,
        department: employee.department,
        position: employee.position,
        salary: employee.salary,
        hireDate: employee.hireDate,
        employeeStatus,
        adminLevel:
            employee.userRole === 'ADMIN' || employee.roles?.includes('ADMIN')
                ? 1
                : undefined,
    };
};

// Lấy danh sách tất cả nhân viên
export const getAll = async (): Promise<Employee[]> => {
    try {
        const response = await usersApi.get(ENDPOINT);
        // Backend trả về { total: x, data: [...] }
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
    }
};

// Tìm kiếm nhân viên theo tên (Nếu backend có endpoint search theo role thì dùng, nếu không thì lọc ở FE)
export const searchEmployees = async (name: string): Promise<Employee[]> => {
    try {
        const response = await usersApi.get(`${ENDPOINT}`, {
            params: { name }, // Giả định backend hỗ trợ query param name ở endpoint role
        });
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error('Error searching employees:', error);
        return [];
    }
};

// Lấy thông tin nhân viên theo ID
export const getById = async (id: string): Promise<Employee | null> => {
    try {
        const response = await usersApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching employee ${id}:`, error);
        return null;
    }
};

// Lưu nhân viên mới
export const saveEmployee = async (employee: Partial<Employee>): Promise<Employee | null> => {
    try {
        const response = await usersApi.post('', normalizeEmployeePayload(employee));
        return response.data;
    } catch (error) {
        console.error('Error saving employee:', error);
        throw error;
    }
};

export const create = saveEmployee;

// Cập nhật nhân viên
export const updateEmployee = async (id: string, employee: Partial<Employee>): Promise<Employee | null> => {
    try {
        const response = await usersApi.put(`/${id}`, normalizeEmployeePayload(employee));
        return response.data;
    } catch (error) {
        console.error(`Error updating employee ${id}:`, error);
        throw error;
    }
};

export const update = updateEmployee;

// Xóa nhân viên
export const deleteEmployee = async (id: string): Promise<void> => {
    try {
        await usersApi.delete(`/${id}`);
    } catch (error) {
        console.error(`Error deleting employee ${id}:`, error);
        throw error;
    }
};

export default {
    getAll,
    getById,
    create,
    saveEmployee,
    update,
    updateEmployee,
    deleteEmployee,
    searchEmployees,
};

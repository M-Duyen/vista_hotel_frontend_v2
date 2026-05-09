import { useState, useEffect } from 'react';
import { useToastContext } from '../../hooks/useToastContext';
import { update } from '../../services/employeeService';
import type { Employee } from '../../types/Employee';

type Props = {
    show: boolean;
    employee: Employee | null;
    onClose: () => void;
    onSuccess: () => void;
};

interface EmployeeFormData {
    userName: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    salary: string;
    hireDate: string;
    address: string;
    status: 'ACTIVE' | 'INACTIVE';
    userRole: 'ADMIN' | 'EMPLOYEE';
}

export default function EditEmployeeModal({
    show,
    employee,
    onClose,
    onSuccess,
}: Props) {
    const toast = useToastContext();

    const [formData, setFormData] = useState<EmployeeFormData>({
        userName: '',
        fullName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        salary: '',
        hireDate: '',
        address: '',
        userRole: 'EMPLOYEE',
        status: 'ACTIVE',
    });

    const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load employee data when modal opens
    useEffect(() => {
        if (show && employee) {
            setFormData({
                userName: employee.userName || '',
                fullName: employee.fullName || '',
                email: employee.email || '',
                phone: employee.phone || '',
                position: employee.position || '',
                department: employee.department || '',
                salary: employee.salary ? employee.salary.toLocaleString() : '',
                hireDate: employee.hireDate || '',
                address: employee.address || '',
                userRole:
                    (employee.userRole as 'ADMIN' | 'EMPLOYEE') || 'EMPLOYEE',
                status: (employee.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
            });
            setErrors({});
        }
    }, [show, employee]);

    /** Lock scroll when modal opens */
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [show]);

    /** Handle input changes */
    const handleChange = (field: keyof EmployeeFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    /** Validate form */
    const validate = (): boolean => {
        const newErrors: Partial<EmployeeFormData> = {};

        if (!formData.userName.trim()) {
            newErrors.userName = 'Vui lòng nhập tên đăng nhập';
        }

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
        }

        if (
            formData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (
            formData.phone &&
            !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))
        ) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.position.trim()) {
            newErrors.position = 'Vui lòng nhập chức vụ';
        }

        if (!formData.department.trim()) {
            newErrors.department = 'Vui lòng nhập phòng ban';
        }

        if (!formData.salary.trim()) {
            newErrors.salary = 'Vui lòng nhập lương';
        } else if (isNaN(Number(formData.salary.replace(/,/g, '')))) {
            newErrors.salary = 'Lương phải là số';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /** Submit form */
    const handleSubmit = async () => {
        if (!validate() || !employee || !employee.id) {
            console.error('Missing employee or employee ID:', employee);
            toast.error('Không tìm thấy thông tin nhân viên để cập nhật');
            return;
        }

        setIsSubmitting(true);

        try {
            const updatedEmployee: Partial<Employee> = {
                userName: formData.userName,
                fullName: formData.fullName,
                email: formData.email.trim() || null,
                phone: formData.phone.trim() || null,
                position: formData.position,
                department: formData.department,
                salary: Number(formData.salary.replace(/,/g, '')),
                hireDate: formData.hireDate || null,
                address: formData.address.trim() || null,
                userRole: formData.userRole,
                status: formData.status,
                // Không truyền password để giữ nguyên mật khẩu hiện tại
            };

            console.log(
                'Updating employee with ID:',
                employee.id,
                updatedEmployee,
            );
            await update(employee.id, updatedEmployee);
            toast.success('Cập nhật thông tin nhân viên thành công!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update employee error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin nhân viên');
        } finally {
            setIsSubmitting(false);
        }
    };

    /** Format salary input */
    const formatSalary = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    if (!show || !employee || !employee.id) {
        console.warn('EditEmployeeModal: Missing employee data', {
            show,
            employee,
        });
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
            {/* Click to close overlay */}
            <div className="absolute inset-0" onClick={onClose} />

            <div
                className="relative bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-xl animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Chỉnh sửa thông tin nhân viên
                    </h2>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                        ID: {employee.id}
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Username */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Tên đăng nhập *
                            </label>
                            <input
                                type="text"
                                value={formData.userName}
                                onChange={(e) =>
                                    handleChange('userName', e.target.value)
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.userName
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                }`}
                                placeholder="Nhập tên đăng nhập"
                            />
                            {errors.userName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.userName}
                                </p>
                            )}
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Họ và tên *
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) =>
                                    handleChange('fullName', e.target.value)
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.fullName
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                }`}
                                placeholder="Nhập họ và tên"
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.fullName}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    handleChange('email', e.target.value)
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.email
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                }`}
                                placeholder="example@gmail.com"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                    handleChange('phone', e.target.value)
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.phone
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                }`}
                                placeholder="0123456789"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Job Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Chức vụ *
                            </label>
                            <input
                                type="text"
                                value={formData.position}
                                onChange={(e) =>
                                    handleChange('position', e.target.value)
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.position
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                }`}
                                placeholder="Ví dụ: Lễ tân, Quản lý, Kế toán..."
                            />
                            {errors.position && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.position}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Phòng ban *
                            </label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) =>
                                    handleChange('department', e.target.value)
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.department
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                }`}
                                placeholder="Ví dụ: Lễ tân, Housekeeping, Kế toán..."
                            />
                            {errors.department && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.department}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Financial & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Lương (VNĐ) *
                            </label>
                            <input
                                type="text"
                                value={formData.salary}
                                onChange={(e) =>
                                    handleChange(
                                        'salary',
                                        formatSalary(e.target.value),
                                    )
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.salary
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                }`}
                                placeholder="10,000,000"
                            />
                            {errors.salary && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.salary}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Vai trò
                            </label>
                            <select
                                value={formData.userRole}
                                onChange={(e) =>
                                    handleChange('userRole', e.target.value)
                                }
                                className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 focus:border-blue-500 transition-colors"
                            >
                                <option value="EMPLOYEE">Nhân viên</option>
                                <option value="ADMIN">Quản trị viên</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Trạng thái
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    handleChange('status', e.target.value)
                                }
                                className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 focus:border-blue-500 transition-colors"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Tạm nghỉ</option>
                            </select>
                        </div>
                    </div>

                    {/* Date & Address */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Ngày tuyển dụng
                        </label>
                        <input
                            type="date"
                            value={formData.hireDate}
                            onChange={(e) =>
                                handleChange('hireDate', e.target.value)
                            }
                            className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Địa chỉ
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) =>
                                handleChange('address', e.target.value)
                            }
                            className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 focus:border-blue-500 transition-colors"
                            placeholder="Nhập địa chỉ"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-gray-50 p-4 rounded-xl mt-6">
                    <h3 className="font-medium text-gray-800 mb-2">
                        Thông tin hệ thống
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Mã nhân viên:</span>
                            <span className="ml-2 font-medium">
                                {employee.id}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Mật khẩu:</span>
                            <span className="ml-2 text-gray-400">••••••••</span>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>

                    <button
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                </div>
            </div>
        </div>
    );
}

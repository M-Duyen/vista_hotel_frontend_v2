import { useState, useEffect } from 'react';
import { useToastContext } from '../../hooks/useToastContext';
import { create } from '../../services/employeeService';
import type { Employee, EmployeeFormData } from '../../types/Employee';

type Props = {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

const DEPARTMENTS = [
    'Front Office',
    'Housekeeping',
    'Food & Beverage',
    'Sales & Marketing',
    'Human Resources',
    'IT & Systems',
    'Security',
    'Finance & Accounting'
];

const POSITIONS = [
    'General Manager',
    'Department Manager',
    'Receptionist',
    'Housekeeper',
    'Chef',
    'Waiter/Waitress',
    'Security Officer',
    'Accountant',
    'IT Administrator',
    'Marketing Coordinator'
];

export default function AddEmployeeModal({ show, onClose, onSuccess }: Props) {
    const toast = useToastContext();

    const [formData, setFormData] = useState<EmployeeFormData>({
        userName: '',
        fullName: '',
        email: '',
        phone: '',
        position: POSITIONS[2], // Default to Receptionist
        department: DEPARTMENTS[0], // Default to Front Office
        salary: '',
        hireDate: new Date().toISOString().split('T')[0],
        address: '',
        status: 'ACTIVE',
        userRole: 'EMPLOYEE',
    });

    const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /** Lock scroll when modal opens */
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [show]);

    /** Reset form when modal opens */
    useEffect(() => {
        if (show) {
            setFormData({
                userName: '',
                fullName: '',
                email: '',
                phone: '',
                position: POSITIONS[2],
                department: DEPARTMENTS[0],
                salary: '',
                hireDate: new Date().toISOString().split('T')[0],
                address: '',
                status: 'ACTIVE',
                userRole: 'EMPLOYEE',
            });
            setErrors({});
        }
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
            newErrors.userName = 'Please enter a username';
        }

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Please enter full name';
        }

        if (
            formData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = 'Invalid email address';
        }

        if (
            formData.phone &&
            !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))
        ) {
            newErrors.phone = 'Invalid phone number';
        }

        if (!formData.position.trim()) {
            newErrors.position = 'Please select job position';
        }

        if (!formData.department.trim()) {
            newErrors.department = 'Please select department';
        }

        if (!formData.salary.trim()) {
            newErrors.salary = 'Please enter salary';
        } else if (isNaN(Number(formData.salary.replace(/,/g, '')))) {
            newErrors.salary = 'Salary must be a number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /** Submit form */
    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const employeeData: Partial<Employee> = {
                userName: formData.userName,
                fullName: formData.fullName,
                email: formData.email.trim() || null,
                phone: formData.phone.trim() || null,
                position: formData.position,
                department: formData.department,
                salary: Number(formData.salary.replace(/,/g, '')),
                hireDate: formData.hireDate || null,
                address: formData.address.trim() || null,
                status: formData.status,
                userRole: formData.userRole,
                password: 'default123', // Default password
            };

            await create(employeeData);
            toast.success('Employee added successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Add employee error:', error);
            toast.error('An error occurred while adding employee');
        } finally {
            setIsSubmitting(false);
        }
    };

    /** Format salary input */
    const formatSalary = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
            {/* Click to close overlay */}
            <div className="absolute inset-0" onClick={onClose} />

            <div
                className="relative bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-xl animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Add New Employee
                </h2>

                {/* Form */}
                <div className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Username */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Username *
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
                                placeholder="Enter username"
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
                                Full Name *
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
                                placeholder="Enter full name"
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
                                Phone Number
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
                                Job Position *
                            </label>
                            <select
                                value={formData.position}
                                onChange={(e) =>
                                    handleChange('position', e.target.value)
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.position
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                } bg-white`}
                            >
                                <option value="" disabled>Select a position</option>
                                {POSITIONS.map((pos) => (
                                    <option key={pos} value={pos}>
                                        {pos}
                                    </option>
                                ))}
                            </select>
                            {errors.position && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.position}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Department *
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) =>
                                    handleChange('department', e.target.value)
                                }
                                className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                    errors.department
                                        ? 'border-red-500'
                                        : 'border-gray-200 hover:border-gray-400 focus:border-blue-500'
                                } bg-white`}
                            >
                                <option value="" disabled>Select a department</option>
                                {DEPARTMENTS.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
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
                                Salary (VND) *
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
                                Role
                            </label>
                            <select
                                value={formData.userRole}
                                onChange={(e) =>
                                    handleChange('userRole', e.target.value)
                                }
                                className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 focus:border-blue-500 transition-colors bg-white"
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    handleChange('status', e.target.value)
                                }
                                className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 focus:border-blue-500 transition-colors bg-white"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Date & Address */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Hire Date
                        </label>
                        <input
                            type="date"
                            value={formData.hireDate}
                            onChange={(e) =>
                                handleChange('hireDate', e.target.value)
                            }
                            className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 focus:border-blue-500 transition-colors bg-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) =>
                                handleChange('address', e.target.value)
                            }
                            className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-gray-400 focus:border-blue-500 transition-colors"
                            placeholder="Enter address"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {isSubmitting ? 'Adding...' : 'Add Employee'}
                    </button>
                </div>
            </div>
        </div>
    );
}

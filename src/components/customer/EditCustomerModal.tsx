import React, { useState, useEffect } from 'react';
import type { Customer } from '../../types/Customer';
import { saveCustomer } from '../../services/customerService';

interface EditCustomerModalProps {
    show: boolean;
    customer: Customer | null;
    onClose: () => void;
    onSave: (updated: Customer) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
    show,
    customer,
    onClose,
    onSave,
}) => {
    const [form, setForm] = useState<Partial<Customer>>({});

    // Cập nhật form khi mở modal với dữ liệu khách hàng
    useEffect(() => {
        if (customer) setForm(customer);
    }, [customer]);

    if (!show || !customer) return null;

    const handleChange = (field: keyof Customer, value: unknown) => {
        setForm((prev) => ({ ...prev, [field]: value as never }));
    };

    const handleSubmit = async () => {
        try {
            const updated = await saveCustomer(form as Customer); // gọi BE để lưu
            if (updated) {
                onSave(updated); // cập nhật lại danh sách ở FE
                alert('✅ Cập nhật khách hàng thành công!');
            } else {
                alert('❌ Không thể lưu khách hàng (BE không trả dữ liệu)');
            }
            onClose();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('❌ Lỗi khi lưu khách hàng!');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <i className="fa-solid fa-pen-to-square text-amber-600"></i>
                    Cập nhật thông tin khách hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Họ tên
                        </label>
                        <input
                            type="text"
                            value={form.fullName || ''}
                            onChange={(e) =>
                                handleChange('fullName', e.target.value)
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Ngày sinh
                        </label>
                        <input
                            type="date"
                            value={form.birthDate || ''}
                            onChange={(e) =>
                                handleChange('birthDate', e.target.value)
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Số điện thoại
                        </label>
                        <input
                            type="text"
                            value={form.phone || ''}
                            onChange={(e) =>
                                handleChange('phone', e.target.value)
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email || ''}
                            onChange={(e) =>
                                handleChange('email', e.target.value)
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            value={form.address || ''}
                            onChange={(e) =>
                                handleChange('address', e.target.value)
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                            Giới tính
                        </label>
                        <div className="flex items-center gap-6 mt-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="MALE"
                                    checked={form.gender === 'MALE'}
                                    onChange={() =>
                                        handleChange('gender', 'MALE')
                                    }
                                />
                                <span>Nam</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="FEMALE"
                                    checked={form.gender === 'FEMALE'}
                                    onChange={() =>
                                        handleChange('gender', 'FEMALE')
                                    }
                                />
                                <span>Nữ</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
                    >
                        Lưu thay đổi
                    </button>
                </div>

                {/* Icon đóng modal */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>
    );
};

export default EditCustomerModal;

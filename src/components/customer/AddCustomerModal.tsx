import React, { useState, useEffect } from 'react';
import type { Customer } from '../../types/Customer';

interface CustomerModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (data: Partial<Customer>) => void;
    initialData?: Partial<Customer>; // dùng cho edit
}

const AddCustomerModal: React.FC<CustomerModalProps> = ({
    show,
    onClose,
    onSave,
    initialData,
}) => {
    const [form, setForm] = useState<Partial<Customer>>({
        fullName: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: 'MALE',
        memberShipLevel: 'SILVER',
        loyaltyPoints: 0,
    });

    useEffect(() => {
        if (initialData) setForm(initialData);
    }, [initialData]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {initialData
                        ? 'Chỉnh sửa khách hàng'
                        : 'Thêm khách hàng mới'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Họ tên
                        </label>
                        <input
                            type="text"
                            value={form.fullName ?? ''}
                            onChange={(e) =>
                                setForm({ ...form, fullName: e.target.value })
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
                            value={form.email ?? ''}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Điện thoại
                        </label>
                        <input
                            type="text"
                            value={form.phone ?? ''}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
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
                            value={form.birthDate ?? ''}
                            onChange={(e) =>
                                setForm({ ...form, birthDate: e.target.value })
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Giới tính
                        </label>
                        <select
                            value={form.gender ?? 'MALE'}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    gender: e.target
                                        .value as Customer['gender'],
                                })
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Hạng thành viên
                        </label>
                        <select
                            value={form.memberShipLevel ?? 'SILVER'}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    memberShipLevel: e.target
                                        .value as Customer['memberShipLevel'],
                                })
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="SILVER">Silver</option>
                            <option value="GOLD">Gold</option>
                            <option value="PLATINUM">Platinum</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                            Điểm tích lũy
                        </label>
                        <input
                            type="number"
                            value={form.loyaltyPoints ?? 0}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    loyaltyPoints: Number(e.target.value),
                                })
                            }
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
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
                        onClick={() => onSave(form)}
                        className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCustomerModal;

import React, { useState, useEffect } from 'react';
import type { Customer } from '../../types/Customer';

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

    // Update form when modal opens with customer data
    useEffect(() => {
        if (customer) setForm(customer);
    }, [customer]);

    if (!show || !customer) return null;

    const handleChange = (field: keyof Customer, value: unknown) => {
        setForm((prev) => ({ ...prev, [field]: value as never }));
    };

    const handleSubmit = () => {
        onSave({ ...customer, ...form } as Customer);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <i className="fa-solid fa-pen-to-square text-amber-600"></i>
                    Update Customer Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Full Name
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
                            Date of Birth
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
                            Phone Number
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
                            Address
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
                            Gender
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
                                <span>Male</span>
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
                                <span>Female</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
                    >
                        Save Changes
                    </button>
                </div>

                {/* Close modal icon */}
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

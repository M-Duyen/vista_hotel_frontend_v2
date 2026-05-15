import React, { useState, useEffect } from 'react';
import type { Service } from '../../services/serviceService';
import { createService } from '../../services/serviceService';

interface AddServiceModalProps {
    onClose: () => void;
    onSuccess: (service: Service) => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<Partial<Service>>({
        serviceName: '',
        description: '',
        price: 0,
        availability: true,
        serviceHours: '',
        serviceCategory: 'OTHER',
        images: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageUrl, setImageUrl] = useState('');


    const handleAddImage = () => {
        if (imageUrl.trim()) {
            setFormData((prev) => ({
                ...prev,
                images: [...(prev.images || []), imageUrl.trim()],
            }));
            setImageUrl('');
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.serviceHours || formData.serviceHours.trim() === '') {
            setError('Service hours cannot be empty');
            setLoading(false);
            return;
        }

        try {
            const result = await createService(formData);
            onSuccess(result);
            onClose();
        } catch (err) {
            setError('An error occurred while adding the service');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Add New Service
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <i className="fa-solid fa-times text-xl"></i>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Name{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="serviceName"
                                value={formData.serviceName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={3}
                                placeholder="Enter service name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={10}
                                placeholder="Enter detailed service description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (VND){' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                placeholder="Enter service price"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Hours{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="serviceHours"
                                value={formData.serviceHours ?? ''}
                                onChange={handleChange}
                                placeholder="Example: 08:00-22:00 or 08:00 - 22:00"
                                title="Format: HH:MM-HH:MM or HH:MM - HH:MM (e.g., 08:00-22:00)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Format: HH:MM-HH:MM (e.g., 08:00-22:00)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                name="serviceCategory"
                                value={formData.serviceCategory}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="FOOD_BEVERAGE">Food & Beverage</option>
                                <option value="LAUNDRY">Laundry</option>
                                <option value="SPA">Spa</option>
                                <option value="TRANSPORT">Transport</option>
                                <option value="TOUR">Tour</option>
                                <option value="WELLNESS">Wellness</option>
                                <option value="RECREATION">Recreation</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Images
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Enter image URL"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddImage}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {formData.images?.map((url, index) => (
                                    <div key={index} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="availability"
                                checked={formData.availability}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label className="text-sm text-gray-700">
                                Available
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {loading ? 'Adding...' : 'Add Service'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddServiceModal;

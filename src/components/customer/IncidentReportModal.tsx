
import { useState } from 'react';
import type { Booking } from '../../types/Booking';
import { incidentService } from '../../services/incidentService';
import type { IncidentFormData } from '../../types/Incident';

interface Props {
    booking: Booking | null;
    onClose: () => void;
}

export default function IncidentReportModal({ booking, onClose }: Props) {
    const [formData, setFormData] = useState({
        incidentType: '',
        description: '',
        location: '',
        severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.incidentType.trim() || !formData.description.trim()) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsSubmitting(true);

        try {
            const incidentFormData: IncidentFormData = {
                bookingId: booking?.bookingID || '',
                title: formData.incidentType,
                description: `Vị trí: ${
                    formData.location || 'Không xác định'
                }\n\nMô tả: ${formData.description}`,
                category: formData.incidentType as
                    | 'ROOM_MAINTENANCE'
                    | 'CLEANLINESS'
                    | 'NOISE'
                    | 'SERVICE_COMPLAINT'
                    | 'SAFETY_SECURITY'
                    | 'OTHER',
                priority: formData.severity as 'LOW' | 'MEDIUM' | 'HIGH',
                imageUrl: undefined, // Có thể thêm upload ảnh sau
            };

            console.log('Creating incident with data:', incidentFormData);

            const result = await incidentService.createIncident(
                incidentFormData,
            );
            console.log('Incident created successfully:', result);

            alert(
                `Báo cáo sự cố đã được gửi thành công!\nMã báo cáo: ${result.id}`,
            );
            onClose();
        } catch (error) {
            console.error('Error reporting incident:', error);
            alert('Có lỗi xảy ra khi gửi báo cáo');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Báo cáo sự cố
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            <strong>Booking ID:</strong> {booking.bookingID}
                        </p>
                        <p className="text-sm text-amber-800">
                            <strong>Phòng:</strong>{' '}
                            {booking.bookingDetails
                                ?.map((d) => d.room?.roomNumber)
                                .join(', ')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Incident Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại sự cố *
                            </label>
                            <select
                                value={formData.incidentType}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        incidentType: e.target.value,
                                    })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                required
                            >
                                <option value="">Chọn loại sự cố</option>
                                <option value="ROOM_MAINTENANCE">
                                    Vấn đề phòng/trang thiết bị
                                </option>
                                <option value="CLEANLINESS">
                                    Vệ sinh phòng
                                </option>
                                <option value="NOISE">Tiếng ồn</option>
                                <option value="SERVICE_COMPLAINT">
                                    Dịch vụ khách sạn
                                </option>
                                <option value="SAFETY_SECURITY">An toàn</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vị trí xảy ra sự cố
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        location: e.target.value,
                                    })
                                }
                                placeholder="VD: Phòng 101, Hành lang tầng 2..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>

                        {/* Severity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mức độ nghiêm trọng
                            </label>
                            <div className="flex gap-3">
                                {[
                                    {
                                        value: 'LOW',
                                        label: 'Nhẹ',
                                        color: 'text-green-600',
                                    },
                                    {
                                        value: 'MEDIUM',
                                        label: 'Trung bình',
                                        color: 'text-yellow-600',
                                    },
                                    {
                                        value: 'HIGH',
                                        label: 'Nghiêm trọng',
                                        color: 'text-red-600',
                                    },
                                ].map((severity) => (
                                    <label
                                        key={severity.value}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="severity"
                                            value={severity.value}
                                            checked={
                                                formData.severity ===
                                                severity.value
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    severity: e.target.value as
                                                        | 'LOW'
                                                        | 'MEDIUM'
                                                        | 'HIGH',
                                                })
                                            }
                                            className="mr-2"
                                        />
                                        <span
                                            className={`text-sm font-medium ${severity.color}`}
                                        >
                                            {severity.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả chi tiết *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Vui lòng mô tả chi tiết về sự cố..."
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                                required
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang gửi...
                                    </div>
                                ) : (
                                    'Gửi báo cáo'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
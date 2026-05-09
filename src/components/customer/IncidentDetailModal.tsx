import React from 'react';
import type { IncidentReport } from '../../types/Incident';
import {
    X,
    Calendar,
    User,
    MapPin,
    AlertCircle,
    CheckCircle,
    Clock,
} from 'lucide-react';
import Button from '../common/Button';

interface IncidentDetailModalProps {
    incident: IncidentReport;
    onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    ROOM_MAINTENANCE: 'Bảo trì phòng',
    CLEANLINESS: 'Vệ sinh',
    NOISE: 'Tiếng ồn',
    EQUIPMENT_FAILURE: 'Thiết bị hỏng',
    SAFETY_SECURITY: 'An toàn & Bảo mật',
    SERVICE_COMPLAINT: 'Khiếu nại dịch vụ',
    OTHER: 'Khác',
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
    LOW: { label: 'Thấp', color: 'text-green-600 bg-green-50' },
    MEDIUM: { label: 'Trung bình', color: 'text-yellow-600 bg-yellow-50' },
    HIGH: { label: 'Cao', color: 'text-orange-600 bg-orange-50' },
    URGENT: { label: 'Khẩn cấp', color: 'text-red-600 bg-red-50' },
    CRITICAL: { label: 'Nghiêm trọng', color: 'text-red-700 bg-red-100' },
};

const STATUS_LABELS: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
> = {
    PENDING: {
        label: 'Chờ xử lý',
        color: 'text-gray-600 bg-gray-50',
        icon: <Clock className="w-5 h-5" />,
    },
    COMPLETED: {
        label: 'Đã hoàn thành',
        color: 'text-green-600 bg-green-50',
        icon: <CheckCircle className="w-5 h-5" />,
    },
    FAILED: {
        label: 'Thất bại',
        color: 'text-red-600 bg-red-50',
        icon: <AlertCircle className="w-5 h-5" />,
    },
};

const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
    incident,
    onClose,
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const statusConfig = STATUS_LABELS[incident.status];
    const priorityConfig = PRIORITY_LABELS[incident.priority];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Chi tiết báo cáo sự cố
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            ID: {incident.id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status and Priority */}
                    <div className="flex flex-wrap gap-3">
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig.color}`}
                        >
                            {statusConfig.icon}
                            <span className="font-medium">
                                {statusConfig.label}
                            </span>
                        </div>
                        <div
                            className={`px-4 py-2 rounded-lg ${priorityConfig.color}`}
                        >
                            <span className="font-medium">
                                Ưu tiên: {priorityConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                            {incident.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="px-3 py-1 bg-gray-100 rounded-md font-medium">
                                {CATEGORY_LABELS[incident.category] ||
                                    incident.category}
                            </span>
                            {incident.roomNumber && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>Phòng {incident.roomNumber}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                            Mô tả chi tiết
                        </h4>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {incident.description}
                        </p>
                    </div>

                    {/* Image */}
                    {incident.imageUrl && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                                Hình ảnh
                            </h4>
                            <img
                                src={incident.imageUrl}
                                alt="Incident"
                                className="w-full rounded-lg shadow-md"
                            />
                        </div>
                    )}

                    {/* Timeline */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">
                            Thời gian
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Ngày báo cáo
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(incident.reportedDate)}
                                    </p>
                                </div>
                            </div>
                            {incident.resolvedDate && (
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Ngày hoàn thành
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(incident.resolvedDate)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {incident.estimatedTime !== undefined &&
                                incident.estimatedTime > 0 && (
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Thời gian ước tính
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {incident.estimatedTime} giờ
                                            </p>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Cost Info */}
                    {incident.actualCost !== undefined &&
                        incident.actualCost > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3">
                                    Chi phí thực tế
                                </h4>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-lg font-bold text-blue-900">
                                        {incident.actualCost.toLocaleString(
                                            'vi-VN',
                                        )}{' '}
                                        VNĐ
                                    </p>
                                </div>
                            </div>
                        )}

                    {/* Reporter Info */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">
                            Thông tin người báo cáo
                        </h4>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {incident.customerName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Mã KH: {incident.customerId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Staff Response/Note */}
                    {incident.assignedTo && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                                Phản hồi từ nhân viên
                            </h4>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {incident.assignedTo}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                    <Button
                        onClick={onClose}
                        text="Đóng"
                        className="w-full"
                        color="bg-[#CCBDA3]"
                        textColor="text-white"
                        fullWidth
                    />
                </div>
            </div>
        </div>
    );
};

export default IncidentDetailModal;

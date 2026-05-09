
import React from 'react';
import { Eye, Edit, Package, Clock } from 'lucide-react';
import type { BookingService } from '../../types/BookingService';

interface ServiceOrderTableProps {
    orders: BookingService[];
    onViewDetail: (order: BookingService) => void;
    onUpdateStatus: (order: BookingService) => void;
}

const ServiceOrderTable: React.FC<ServiceOrderTableProps> = ({
    orders,
    onViewDetail,
    onUpdateStatus,
}) => {
    const getStatusBadge = (status: string) => {
        const styles = {
            PLACE: 'bg-orange-100 text-orange-800 border-orange-200',
            PREPARING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            READY: 'bg-blue-100 text-blue-800 border-blue-200',
            DELIVERED: 'bg-green-100 text-green-800 border-green-200',
            CANCELLED: 'bg-red-100 text-red-800 border-red-200',
        };

        const labels = {
            PLACE: 'Placed',
            PREPARING: 'Preparing',
            READY: 'Ready',
            DELIVERED: 'Delivered',
            CANCELLED: 'Cancelled',
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    styles[status as keyof typeof styles]
                }`}
            >
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <Package className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">
                        Không có đơn đặt dịch vụ nào
                    </p>
                    <p className="text-sm">
                        Thử thay đổi bộ lọc để xem kết quả khác
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Booking ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Service
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Quantity
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Total Amount
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Order Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order, index) => (
                            <tr
                                key={`${order.booking.bookingID}-${order.service.serviceID}-${index}`}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-blue-600">
                                        #{order.booking.bookingID}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-2">
                                        <Package className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {order.service.serviceName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {order.service.serviceCategory}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {order.booking.customer?.fullName ||
                                                'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {order.booking.customer?.phone ||
                                                ''}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-gray-900">
                                        x{order.quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-green-600">
                                        {formatPrice(order.totalAmount)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(order.orderStatus)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        {formatDate(order.booking.checkInDate)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onViewDetail(order)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        {order.orderStatus !== 'DELIVERED' &&
                                            order.orderStatus !==
                                                'CANCELLED' && (
                                                <button
                                                    onClick={() =>
                                                        onUpdateStatus(order)
                                                    }
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Cập nhật trạng thái"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServiceOrderTable;
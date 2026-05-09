
import React from 'react';
import { X, Package, User, CreditCard, Clock } from 'lucide-react';
import type { BookingService } from '../../types/BookingService';

interface ServiceOrderDetailModalProps {
    order: BookingService;
    onClose: () => void;
}

const ServiceOrderDetailModal: React.FC<ServiceOrderDetailModalProps> = ({
    order,
    onClose,
}) => {
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

    const getStatusBadge = (status: string) => {
        const styles = {
            PLACE: 'bg-orange-100 text-orange-800 border-orange-300',
            PREPARING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            READY: 'bg-blue-100 text-blue-800 border-blue-300',
            DELIVERED: 'bg-green-100 text-green-800 border-green-300',
            CANCELLED: 'bg-red-100 text-red-800 border-red-300',
        };

        const labels = {
            PLACE: 'Mới đặt',
            PREPARING: 'Đang chuẩn bị',
            READY: 'Sẵn sàng',
            DELIVERED: 'Đã giao',
            CANCELLED: 'Đã hủy',
        };

        return (
            <span
                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${
                    styles[status as keyof typeof styles]
                }`}
            >
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels = {
            CASH: 'Cash',
            CREDIT_CARD: 'Credit Card',
            BANK_TRANSFER: 'Bank Transfer',
            E_WALLET: 'E-Wallet',
        };
        return labels[method as keyof typeof labels] || method;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">
                                Service Order Details
                            </h2>
                            <p className="text-blue-100 mt-1">
                                Booking ID: #{order.booking.bookingID}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-700 font-medium">
                            Order Status:
                        </span>
                        {getStatusBadge(order.orderStatus)}
                    </div>

                    {/* Service Info */}
                    <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <Package className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    Service Information
                                </h3>
                            </div>
                        </div>
                        <div className="space-y-3 ml-9">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Service Name:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {order.service.serviceName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium text-gray-700">
                                    {order.service.serviceCategory}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Service Hours:
                                </span>
                                <span className="font-medium text-gray-700">
                                    {order.service.serviceHours || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Description:
                                </span>
                                <span className="font-medium text-gray-700 text-right max-w-md">
                                    {order.service.description}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    {order.booking.customer && (
                        <div className="border-2 border-gray-200 rounded-xl p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <User className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        Thông tin khách hàng
                                    </h3>
                                </div>
                            </div>
                            <div className="space-y-3 ml-9">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Họ tên:
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {order.booking.customer.fullName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Số điện thoại:
                                    </span>
                                    <span className="font-medium text-gray-700">
                                        {order.booking.customer.phone}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Email:
                                    </span>
                                    <span className="font-medium text-gray-700">
                                        {order.booking.customer.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking Info */}
                    <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <Clock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    Booking Information
                                </h3>
                            </div>
                        </div>
                        <div className="space-y-3 ml-9">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-in:</span>
                                <span className="font-medium text-gray-700">
                                    {formatDate(order.booking.checkInDate)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Check-out:
                                </span>
                                <span className="font-medium text-gray-700">
                                    {formatDate(order.booking.checkOutDate)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Booking Status:
                                </span>
                                <span className="font-medium text-gray-700">
                                    {order.booking.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <CreditCard className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    Payment Information
                                </h3>
                            </div>
                        </div>
                        <div className="space-y-3 ml-9">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Payment Method:
                                </span>
                                <span className="font-medium text-gray-700">
                                    {getPaymentMethodLabel(order.paymentMethod)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Unit Price:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {formatPrice(order.servicePrice)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-semibold text-gray-900">
                                    x{order.quantity}
                                </span>
                            </div>
                            <div className="pt-3 border-t-2 border-gray-200 flex justify-between">
                                <span className="text-gray-900 font-bold text-lg">
                                    Total:
                                </span>
                                <span className="font-bold text-xl text-green-600">
                                    {formatPrice(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderDetailModal;

import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import type { BookingService, OrderStatus } from '../../types/BookingService';
import bookingServiceService from '../../services/bookingServiceService';

interface UpdateStatusModalProps {
    order: BookingService;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
    order,
    onClose,
    onSuccess,
}) => {
    const [newStatus, setNewStatus] = useState<OrderStatus>(order.orderStatus);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const statusOptions: {
        value: OrderStatus;
        label: string;
        color: string;
    }[] = [
        { value: 'PLACE', label: 'Placed', color: 'orange' },
        { value: 'PREPARING', label: 'Preparing', color: 'yellow' },
        { value: 'READY', label: 'Ready', color: 'blue' },
        { value: 'DELIVERED', label: 'Delivered', color: 'green' },
        { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newStatus === order.orderStatus) {
            setError('Please select a different status from the current one');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await bookingServiceService.updateOrderStatus(
                order.service.serviceID,
                order.booking.bookingID,
                newStatus,
            );
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Unable to update status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (color: string) => {
        const colors = {
            orange: 'border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700',
            yellow: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
            blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700',
            green: 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700',
            red: 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700',
        };
        return colors[color as keyof typeof colors];
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Update Status</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Current Order Info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Order Information
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                                <span className="font-medium">Booking:</span> #
                                {order.booking.bookingID}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Service:</span>{' '}
                                {order.service.serviceName}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Customer:</span>{' '}
                                {order.booking.customer?.fullName || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                            Select New Status{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setNewStatus(option.value)}
                                    disabled={option.value === 'CANCELLED'}
                                    className={`w-full p-3 rounded-xl border-2 text-left font-semibold transition-all ${
                                        newStatus === option.value
                                            ? 'ring-2 ring-blue-500 scale-105'
                                            : ''
                                    } ${
                                        option.value === 'CANCELLED'
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'cursor-pointer'
                                    } ${getStatusColor(option.color)}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option.label}</span>
                                        {newStatus === option.value && (
                                            <CheckCircle className="w-5 h-5" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            * Cannot select "Cancelled" status from here
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                loading || newStatus === order.orderStatus
                            }
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </span>
                            ) : (
                                'Update'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateStatusModal;

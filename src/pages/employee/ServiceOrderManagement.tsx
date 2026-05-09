
import React, { useEffect, useState } from 'react';
import {
    ShoppingBag,
    Search,
    Clock,
    CheckCircle,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import bookingServiceService from '../../services/bookingServiceService';
import type { BookingService, OrderStatus } from '../../types/BookingService';
import ServiceOrderTable from '../../components/service-order/ServiceOrderTable';
import ServiceOrderDetailModal from '../../components/service-order/ServiceOrderDetailModal';
import UpdateStatusModal from '../../components/service-order/UpdateStatusModal';
import { useToastContext } from '../../hooks/useToastContext';

const ServiceOrderManagement: React.FC = () => {
    const [orders, setOrders] = useState<BookingService[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<BookingService[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>(
        'ALL',
    );
    const [selectedOrder, setSelectedOrder] = useState<BookingService | null>(
        null,
    );
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const toast = useToastContext();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let filtered = [...orders];

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(
                (order) => order.orderStatus === statusFilter,
            );
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (order) =>
                    order.booking.bookingID
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    order.service.serviceName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    order.booking.customer?.fullName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await bookingServiceService.getAll();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Unable to load service orders');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (order: BookingService) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const handleUpdateStatus = (order: BookingService) => {
        setSelectedOrder(order);
        setShowUpdateModal(true);
    };

    const handleStatusUpdated = async () => {
        await fetchOrders();
        toast.success('Status updated successfully');
    };

    const getStatusStats = () => {
        return {
            total: orders.length,
            placed: orders.filter((o) => o.orderStatus === 'PLACE').length,
            preparing: orders.filter((o) => o.orderStatus === 'PREPARING')
                .length,
            ready: orders.filter((o) => o.orderStatus === 'READY').length,
            delivered: orders.filter((o) => o.orderStatus === 'DELIVERED')
                .length,
            cancelled: orders.filter((o) => o.orderStatus === 'CANCELLED')
                .length,
        };
    };

    const stats = getStatusStats();

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <ShoppingBag className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600 animate-pulse" />
                </div>
                <p className="mt-4 text-lg text-gray-700 font-medium">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-blue-600" />
                        Service Order Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage and track service orders from customers
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">
                                Total Orders
                            </p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.total}
                            </p>
                        </div>
                        <ShoppingBag className="w-8 h-8 text-gray-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 font-medium">
                                Placed
                            </p>
                            <p className="text-2xl font-bold text-orange-800">
                                {stats.placed}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">
                                Preparing
                            </p>
                            <p className="text-2xl font-bold text-yellow-800">
                                {stats.preparing}
                            </p>
                        </div>
                        <RefreshCw className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">
                                Ready
                            </p>
                            <p className="text-2xl font-bold text-blue-800">
                                {stats.ready}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">
                                Delivered
                            </p>
                            <p className="text-2xl font-bold text-green-800">
                                {stats.delivered}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">
                                Cancelled
                            </p>
                            <p className="text-2xl font-bold text-red-800">
                                {stats.cancelled}
                            </p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by booking ID, service name, customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                statusFilter === 'ALL'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('PLACE')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                statusFilter === 'PLACE'
                                    ? 'bg-orange-600 text-white shadow-lg'
                                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                            }`}
                        >
                            Placed
                        </button>
                        <button
                            onClick={() => setStatusFilter('PREPARING')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                statusFilter === 'PREPARING'
                                    ? 'bg-yellow-600 text-white shadow-lg'
                                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            }`}
                        >
                            Preparing
                        </button>
                        <button
                            onClick={() => setStatusFilter('READY')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                statusFilter === 'READY'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                        >
                            Ready
                        </button>
                        <button
                            onClick={() => setStatusFilter('DELIVERED')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                statusFilter === 'DELIVERED'
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                        >
                            Delivered
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <ServiceOrderTable
                orders={currentOrders}
                onViewDetail={handleViewDetail}
                onUpdateStatus={handleUpdateStatus}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {indexOfFirstItem + 1} -{' '}
                            {Math.min(indexOfLastItem, filteredOrders.length)} /{' '}
                            {filteredOrders.length} orders
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1),
                                    )
                                }
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-lg ${
                                    currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                Previous
                            </button>
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-lg ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-lg ${
                                    currentPage === totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showDetailModal && selectedOrder && (
                <ServiceOrderDetailModal
                    order={selectedOrder}
                    onClose={() => setShowDetailModal(false)}
                />
            )}

            {showUpdateModal && selectedOrder && (
                <UpdateStatusModal
                    order={selectedOrder}
                    onClose={() => setShowUpdateModal(false)}
                    onSuccess={handleStatusUpdated}
                />
            )}
        </div>
    );
};

export default ServiceOrderManagement;

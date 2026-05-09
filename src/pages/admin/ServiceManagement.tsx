import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit,
    Sparkles,
    Coffee,
    Droplets,
    Car,
    Map,
    Package,
} from 'lucide-react';
import type { Service } from '../../services/serviceService';
import { getAll } from '../../services/serviceService';
import AddServiceModal from '../../components/service/AddServiceModal';
import EditServiceModal from '../../components/service/EditServiceModal';

const ServiceManagement: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(
        null,
    );
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Load danh sách dịch vụ
    useEffect(() => {
        fetchServices();
    }, []);

    // Lọc dịch vụ
    useEffect(() => {
        let filtered = services;

        // Lọc theo danh mục
        if (categoryFilter !== 'ALL') {
            filtered = filtered.filter(
                (s) => s.serviceCategory === categoryFilter,
            );
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            filtered = filtered.filter((s) =>
                s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        setFilteredServices(filtered);
        setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
    }, [services, categoryFilter, searchTerm]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await getAll();
            setServices(data);
            setFilteredServices(data);
        } catch (err) {
            setError('Unable to load service list');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSuccess = (newService: Service) => {
        setServices([...services, newService]);
    };

    const handleEditClick = (service: Service) => {
        setSelectedService(service);
        setShowEditModal(true);
    };

    const handleEditSuccess = (updatedService: Service) => {
        setServices(
            services.map((s) =>
                s.serviceID === updatedService.serviceID ? updatedService : s,
            ),
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            LAUNDRY: 'Laundry',
            FOOD_BEVERAGE: 'Food & Beverage',
            SPA: 'Spa',
            TRANSPORT: 'Transport',
            TOUR: 'Tour',
            OTHER: 'Other',
        };
        return labels[category] || category;
    };

    const getCategoryIcon = (category: string): React.ReactNode => {
        const icons: Record<string, React.ReactNode> = {
            LAUNDRY: <Droplets className="w-5 h-5" />,
            FOOD_BEVERAGE: <Coffee className="w-5 h-5" />,
            SPA: <Sparkles className="w-5 h-5" />,
            TRANSPORT: <Car className="w-5 h-5" />,
            TOUR: <Map className="w-5 h-5" />,
            OTHER: <Package className="w-5 h-5" />,
        };
        return icons[category] || <Package className="w-5 h-5" />;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            LAUNDRY: 'bg-sky-100 text-sky-700 border-sky-200',
            FOOD_BEVERAGE: 'bg-orange-100 text-orange-700 border-orange-200',
            SPA: 'bg-rose-100 text-rose-700 border-rose-200',
            TRANSPORT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            TOUR: 'bg-violet-100 text-violet-700 border-violet-200',
            OTHER: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[category] || colors.OTHER;
    };

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredServices.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#CCBDA3]/30 border-t-[#CCBDA3] rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#CCBDA3] animate-pulse" />
                </div>
                <p className="mt-4 text-lg text-gray-700 font-medium">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Services</h1>
                <p className="text-gray-600 mt-1">View and manage services</p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#CCBDA3]/20 p-4 sm:p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setCategoryFilter('ALL')}
                            className={`group px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                                categoryFilter === 'ALL'
                                    ? 'bg-gradient-to-r from-[#CCBDA3] to-[#b8a88a] text-white shadow-lg scale-105'
                                    : 'bg-amber-50 text-gray-700 hover:bg-amber-100 hover:scale-105'
                            }`}
                        >
                            <Package className="w-4 h-4" />
                            All
                        </button>
                        <button
                            onClick={() => setCategoryFilter('LAUNDRY')}
                            className={`group px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                                categoryFilter === 'LAUNDRY'
                                    ? 'bg-sky-600 text-white shadow-lg scale-105'
                                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 hover:scale-105'
                            }`}
                        >
                            <Droplets className="w-4 h-4" />
                            Laundry
                        </button>
                        <button
                            onClick={() => setCategoryFilter('FOOD_BEVERAGE')}
                            className={`group px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                                categoryFilter === 'FOOD_BEVERAGE'
                                    ? 'bg-orange-600 text-white shadow-lg scale-105'
                                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 hover:scale-105'
                            }`}
                        >
                            <Coffee className="w-4 h-4" />
                            Food & Beverage
                        </button>
                        <button
                            onClick={() => setCategoryFilter('SPA')}
                            className={`group px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                                categoryFilter === 'SPA'
                                    ? 'bg-rose-600 text-white shadow-lg scale-105'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 hover:scale-105'
                            }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            Spa
                        </button>
                        <button
                            onClick={() => setCategoryFilter('TRANSPORT')}
                            className={`group px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                                categoryFilter === 'TRANSPORT'
                                    ? 'bg-emerald-600 text-white shadow-lg scale-105'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105'
                            }`}
                        >
                            <Car className="w-4 h-4" />
                            Transport
                        </button>
                        <button
                            onClick={() => setCategoryFilter('TOUR')}
                            className={`group px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                                categoryFilter === 'TOUR'
                                    ? 'bg-violet-600 text-white shadow-lg scale-105'
                                    : 'bg-violet-50 text-violet-700 hover:bg-violet-100 hover:scale-105'
                            }`}
                        >
                            <Map className="w-4 h-4" />
                            Tour
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 border-2 border-[#CCBDA3]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CCBDA3] focus:border-transparent w-64 transition-all duration-300"
                            />
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-[#CCBDA3] to-[#b8a88a] text-white rounded-xl hover:shadow-lg hover:scale-105 font-medium flex items-center gap-2 transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            Add Service
                        </button>
                    </div>
                </div>
            </div>

            {/* Service Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#CCBDA3]/20 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full table-fixed">
                        <thead className="bg-gradient-to-r from-[#CCBDA3]/20 to-[#b8a88a]/20 border-b-2 border-[#CCBDA3]/30">
                            <tr>
                                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Service ID
                                </th>
                                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Service Name
                                </th>
                                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Service Hours
                                </th>
                                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white/50 divide-y divide-gray-100">
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-8 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 bg-[#CCBDA3]/10 rounded-full flex items-center justify-center mb-4">
                                                <Package className="w-10 h-10 text-[#CCBDA3]" />
                                            </div>
                                            <p className="text-gray-600 text-xl font-medium">
                                                No services found
                                            </p>
                                            <p className="text-gray-400 text-base mt-2">
                                                Try adjusting your filters
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((service, index) => (
                                    <tr
                                        key={service.serviceID}
                                        className="hover:bg-white/80 transition-all duration-200 group"
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                        }}
                                    >
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-base font-bold text-gray-900 bg-gradient-to-r from-[#CCBDA3]/20 to-[#b8a88a]/20 px-4 py-2 rounded-lg border border-[#CCBDA3]/30">
                                                #{service.serviceID}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-base font-semibold text-gray-900">
                                                {service.serviceName}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getCategoryColor(
                                                    service.serviceCategory,
                                                )}`}
                                            >
                                                {getCategoryIcon(
                                                    service.serviceCategory,
                                                )}
                                                {getCategoryLabel(
                                                    service.serviceCategory,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-base font-bold bg-gradient-to-r from-[#CCBDA3] to-[#a89976] bg-clip-text text-transparent">
                                                {formatPrice(service.price)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-base text-gray-600 font-medium">
                                            {service.serviceHours || 'N/A'}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            {service.availability ? (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-bold border border-green-200">
                                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-bold border border-red-200">
                                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                                                    Unavailable
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <button
                                                onClick={() =>
                                                    handleEditClick(service)
                                                }
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-800 rounded-lg hover:bg-[#CCBDA3] hover:text-white font-semibold transition-all duration-300 group-hover:scale-105 border-2 border-amber-200 hover:border-[#CCBDA3]"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filteredServices.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[#CCBDA3]/20 p-6 mt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="px-5 py-3 bg-gradient-to-r from-[#CCBDA3]/10 to-[#b8a88a]/10 rounded-xl border border-[#CCBDA3]/30">
                                <span className="text-base text-gray-700">
                                    Showing{' '}
                                    <span className="font-bold bg-gradient-to-r from-[#CCBDA3] to-[#a89976] bg-clip-text text-transparent">
                                        {indexOfFirstItem + 1}
                                    </span>{' '}
                                    -{' '}
                                    <span className="font-bold bg-gradient-to-r from-[#CCBDA3] to-[#a89976] bg-clip-text text-transparent">
                                        {Math.min(
                                            indexOfLastItem,
                                            filteredServices.length,
                                        )}
                                    </span>{' '}
                                    / {filteredServices.length} services
                                </span>
                            </div>
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(1, prev - 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 text-lg font-bold ${
                                        currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#CCBDA3] hover:to-[#b8a88a] hover:text-white shadow-md hover:scale-105 border border-[#CCBDA3]/20'
                                    }`}
                                >
                                    ‹
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                                            currentPage === page
                                                ? 'bg-gradient-to-r from-[#CCBDA3] to-[#b8a88a] text-white shadow-lg scale-110 border-2 border-[#CCBDA3]'
                                                : 'bg-white text-gray-700 hover:bg-[#CCBDA3]/10 shadow-md hover:scale-105 border border-[#CCBDA3]/20'
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
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 text-lg font-bold ${
                                        currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-[#CCBDA3] hover:to-[#b8a88a] hover:text-white shadow-md hover:scale-105 border border-[#CCBDA3]/20'
                                    }`}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <AddServiceModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}

            {showEditModal && selectedService && (
                <EditServiceModal
                    service={selectedService}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
};

export default ServiceManagement;

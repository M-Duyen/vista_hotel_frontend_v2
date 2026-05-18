/* eslint-disable */
import type React from 'react';
import { useEffect, useState } from 'react';
import AddCustomerModal from '../../components/customer/AddCustomerModal';
import CustomerDetailModal from '../../components/customer/CustomerDetailModal';
import EditCustomerModal from '../../components/customer/EditCustomerModal';
import type { Customer } from '../../types/Customer';
import { getAll, saveCustomer, updateCustomer } from '../../services/customerService';

// Small statistics card component
type StatCardProps = {
    icon: string;
    label: string;
    value: React.ReactNode;
    color?: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition duration-300">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                    {label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg ${color}`}
            >
                <i className={`fa-solid ${icon}`}></i>
            </div>
        </div>
    </div>
);

type FilterSectionProps = {
    onFilterChange: (filterId: string) => void;
};

const FilterSection: React.FC<FilterSectionProps> = ({ onFilterChange }) => {
    const [active, setActive] = useState('all');
    const filters = [
        { id: 'all', label: 'All', icon: 'fa-list' },
        { id: 'bronze', label: 'Bronze', icon: 'fa-medal' },
        { id: 'silver', label: 'Silver', icon: 'fa-certificate' },
        { id: 'gold', label: 'Gold', icon: 'fa-star' },
        { id: 'platinum', label: 'Platinum', icon: 'fa-gem' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
                Filter Customers
            </h3>
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => {
                            setActive(f.id);
                            onFilterChange(f.id);
                        }}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition duration-200 text-xs ${
                            active === f.id
                                ? 'bg-gray-900 text-white shadow-md hover:bg-gray-800'
                                : 'bg-[#F5F0EB] text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                    >
                        <i className={`fa-solid ${f.icon}`}></i>
                        {f.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowEditModal(true);
    };

    const handleViewCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowDetailModal(true);
    };

    const handleSaveEdit = async (updated: Customer) => {
        try {
            const data = await updateCustomer(updated.id, updated);
            setCustomers((prev) =>
                prev.map((c) => (c.id === updated.id ? data : c)),
            );
            setShowEditModal(false);
        } catch (err: any) {
            alert(err.message || 'Error updating customer');
        }
    };

    const handleAddCustomer = async (data: Partial<Customer>) => {
        try {
            // Prepare new customer data
            const customerToSave = {
                ...data,
                userName: data.email?.split('@')[0] || 'user' + Date.now(),
                password: '123456',
                userRole: 'CUSTOMER',
                joinedDate: new Date().toISOString().split('T')[0],
                loyaltyPoints: data.loyaltyPoints ?? 100,
                memberShipLevel: data.memberShipLevel ?? 'BRONZE',
                reputationPoint: data.reputationPoint ?? 100,
            } as Customer;

            const saved = await saveCustomer(customerToSave);
            if (saved) {
                setCustomers((prev) => [...prev, saved]);
            }
            setShowModal(false);
        } catch (err: any) {
            alert(err.message || 'Error adding customer');
        }
    };

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getAll();
                setCustomers(data ?? []);
            } catch (err) {
                setError('Unable to load customer list');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filtered = customers.filter((c) => {
        const name = c.fullName ?? '';
        const email = c.email ?? '';
        const id = c.id ?? '';
        const matchSearch =
            name.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase()) ||
            id.toLowerCase().includes(search.toLowerCase());
        if (filter === 'all') return matchSearch;
        return (
            matchSearch && (c.memberShipLevel ?? '').toLowerCase() === filter
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCustomers = filtered.slice(startIndex, endIndex);

    // Reset to page 1 when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filter]);

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
                Loading customer data...
            </div>
        );

    if (error)
        return (
            <div className="flex justify-center items-center h-screen text-red-600 text-xl">
                {error}
            </div>
        );

    return (
        <div className="min-h-screen">
            <div className="pt-6 px-4 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                            Customer Management
                        </h1>
                        <p className="text-sm text-gray-600 font-light">
                            Manage customer information and data efficiently
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                        <StatCard
                            icon="fa-users"
                            label="Total Customers"
                            value={customers.length.toString()}
                            color="bg-gray-900"
                        />
                        <StatCard
                            icon="fa-medal"
                            label="Bronze Members"
                            value={customers
                                .filter((c) => c.memberShipLevel === 'BRONZE')
                                .length.toString()}
                            color="bg-orange-700"
                        />
                        <StatCard
                            icon="fa-certificate"
                            label="Silver Members"
                            value={customers
                                .filter((c) => c.memberShipLevel === 'SILVER')
                                .length.toString()}
                            color="bg-gray-500"
                        />
                        <StatCard
                            icon="fa-star"
                            label="Gold Members"
                            value={customers
                                .filter((c) => c.memberShipLevel === 'GOLD')
                                .length.toString()}
                            color="bg-yellow-600"
                        />
                        <StatCard
                            icon="fa-gem"
                            label="Platinum Members"
                            value={customers
                                .filter((c) => c.memberShipLevel === 'PLATINUM')
                                .length.toString()}
                            color="bg-gray-700"
                        />
                    </div>

                    {/* Filter Section */}
                    <FilterSection onFilterChange={setFilter} />

                    {/* Search bar */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                            <div className="relative flex-1 w-full">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                                <input
                                    type="text"
                                    placeholder="Search customers by name, ID, email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition bg-gray-50 hover:bg-white text-sm"
                                />
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold transition duration-200 flex items-center gap-2 shadow-md hover:shadow-lg text-sm whitespace-nowrap"
                            >
                                <i className="fa-solid fa-plus text-sm"></i>{' '}
                                Add Customer
                            </button>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F5F0EB] border-b border-gray-300">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                                            No.
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                                            Customer ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                                            Full Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                                            Membership Tier
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide">
                                            Reputation
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wide">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentCustomers.map((c, idx) => (
                                        <tr
                                            key={c.id}
                                            className="hover:bg-[#F5F0EB] transition duration-150 group"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                                {startIndex + idx + 1}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-900 text-sm">
                                                {c.id}
                                            </td>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold shadow-sm text-xs">
                                                    {(c.fullName ?? '?').charAt(
                                                        0,
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semi text-gray-900 text-sm">
                                                        {c.fullName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                                {c.email}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                                {c.phone}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                                                        c.memberShipLevel ===
                                                        'PLATINUM'
                                                            ? 'bg-gray-200 text-gray-900'
                                                            : c.memberShipLevel ===
                                                              'GOLD'
                                                            ? 'bg-yellow-100 text-yellow-900'
                                                            : c.memberShipLevel ===
                                                              'SILVER'
                                                            ? 'bg-gray-100 text-gray-700'
                                                            : 'bg-orange-100 text-orange-900'
                                                    }`}
                                                >
                                                    {c.memberShipLevel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                                {c.reputationPoint}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2 transition duration-200">
                                                    <button
                                                        type="button"
                                                        aria-label="View details"
                                                        onClick={() =>
                                                            handleViewCustomer(
                                                                c,
                                                            )
                                                        }
                                                        className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition hover:scale-110"
                                                    >
                                                        <i className="fa-solid fa-eye text-sm"></i>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        aria-label="Edit"
                                                        onClick={() =>
                                                            handleEditCustomer(
                                                                c,
                                                            )
                                                        }
                                                        className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition hover:scale-110"
                                                    >
                                                        <i className="fa-solid fa-pen text-sm"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-3 border-t border-gray-200 bg-[#F5F0EB] text-sm text-gray-700 font-medium flex justify-between items-center">
                            <span>
                                Showing {startIndex + 1}-
                                {Math.min(endIndex, filtered.length)} /{' '}
                                {filtered.length} customers
                            </span>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(1, prev - 1),
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition border-2 ${
                                            currentPage === 1
                                                ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border-white text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <i className="fa-solid fa-chevron-left text-sm"></i>
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition border-2 ${
                                                currentPage === page
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                    : 'bg-white text-gray-900 border-white hover:bg-gray-100'
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
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition border-2 ${
                                            currentPage === totalPages
                                                ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                                                : 'bg-white border-white text-gray-900 hover:bg-gray-100'
                                        }`}
                                    >
                                        <i className="fa-solid fa-chevron-right text-sm"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
            <AddCustomerModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleAddCustomer}
            />
            <CustomerDetailModal
                show={showDetailModal}
                customer={selectedCustomer}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedCustomer(null);
                }}
            />
            <EditCustomerModal
                show={showEditModal}
                customer={selectedCustomer}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                }}
                onSave={handleSaveEdit}
            />
        </div>
    );
}

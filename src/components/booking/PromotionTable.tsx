import { useState } from 'react';
import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Promotion {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    discountType: string;
    status: 'Available' | 'Inactive';
}

const promotions: Promotion[] = [
    {
        id: 'PM25092401',
        name: 'Dynamic Push',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Available',
    },
    {
        id: 'PM25092402',
        name: 'Vivid Promote',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Available',
    },
    {
        id: 'PM25092403',
        name: 'Peak Impact',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Available',
    },
    {
        id: 'PM25092404',
        name: 'Buzz Promotion',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Inactive',
    },
    {
        id: 'PM25092405',
        name: 'Focus Promotions',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Available',
    },
    {
        id: 'PM25092406',
        name: 'Next level',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Available',
    },
    {
        id: 'PM25092407',
        name: 'Spotlight Sales',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Inactive',
    },
    {
        id: 'PM25092408',
        name: 'Prime Approach',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Available',
    },
    {
        id: 'PM25092409',
        name: 'Fresh Boost',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Available',
    },
    {
        id: 'PM25092410',
        name: 'Innovate Boost',
        startDate: '14:00 24/09/2025',
        endDate: '12:00 28/09/2025',
        discountType: 'Percentage discount',
        status: 'Inactive',
    },
];

export default function PromotionTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(promotions.length / itemsPerPage);

    return (
        <div className="flex-1 bg-[#d4c5b9] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Promotion / Order Management
                    </h2>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-400 rounded-lg text-gray-900 hover:bg-white/50 transition text-sm font-medium">
                        Filter
                    </button>
                    <button className="px-4 py-2 border border-gray-400 rounded-lg text-gray-900 hover:bg-white/50 transition text-sm font-medium">
                        Export
                    </button>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
                        Add Promotion
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Promotion ID
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Promotion Name
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Start Date
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                End Date
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Discount Type
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map((promo) => (
                            <tr
                                key={promo.id}
                                className="border-b border-gray-200 hover:bg-gray-50 transition"
                            >
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    {promo.id}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {promo.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {promo.startDate}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {promo.endDate}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {promo.discountType}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            promo.status === 'Available'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {promo.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-gray-200 rounded-lg transition text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center gap-2 mt-6">
                <button
                    className="p-2 hover:bg-white/50 rounded-lg transition disabled:opacity-50"
                    disabled={currentPage === 1}
                >
                    <ChevronLeft size={18} className="text-gray-900" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg transition ${
                                currentPage === page
                                    ? 'bg-[#c4b5a9] text-gray-900 font-semibold'
                                    : 'hover:bg-white/50 text-gray-900'
                            }`}
                        >
                            {page}
                        </button>
                    ),
                )}
                <button
                    className="p-2 hover:bg-white/50 rounded-lg transition disabled:opacity-50"
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight size={18} className="text-gray-900" />
                </button>
            </div>
        </div>
    );
}

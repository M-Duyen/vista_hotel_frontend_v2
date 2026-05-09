import React from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
}

/**
 * Component phân trang
 * @param currentPage - Trang hiện tại
 * @param totalPages - Tổng số trang
 * @param onPageChange - Callback khi chuyển trang
 * @param itemsPerPage - Số item mỗi trang
 * @param totalItems - Tổng số item
 */
const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[#ebe3d7] flex items-center justify-between">
            {/* Info */}
            <div className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-medium text-gray-900">{startItem}</span>{' '}
                to <span className="font-medium text-gray-900">{endItem}</span>{' '}
                of{' '}
                <span className="font-medium text-gray-900">{totalItems}</span>{' '}
                entries
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <FaAngleLeft />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-3 py-2 text-gray-600"
                                >
                                    ...
                                </span>
                            );
                        }
                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                                    currentPage === page
                                        ? 'bg-[#6b5e4c] text-white'
                                        : 'text-gray-600 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <FaAngleRight />
                </button>
            </div>
        </div>
    );
};

export default Pagination;

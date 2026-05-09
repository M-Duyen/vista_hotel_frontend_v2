import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchFilterProps {
    onSearch: (keyword: string) => void;
    onFilter: (filters: FilterOptions) => void;
}

interface FilterOptions {
    status?: string;
    paymentStatus?: string;
    packageType?: string;
}

function SearchFilter({ onSearch, onFilter }: SearchFilterProps) {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchKeyword(value);
        onSearch(value);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedStatus(value);

        if (value === 'all' || value === '') {
            onFilter({});
        } else {
            onFilter({ status: value });
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-grow">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#CCBDA3]" />
                <input
                    type="text"
                    placeholder="Search by booking ID, guest name or room number..."
                    value={searchKeyword}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-[#EBE3D7] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]/20 focus:border-[#CCBDA3] transition"
                />
            </div>
            <div className="flex items-center gap-2">
                <select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="border border-[#EBE3D7] rounded-md py-2.5 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]/20 focus:border-[#CCBDA3] transition"
                >
                    <option value="all">All Check-ins</option>
                    <option value="PENDING">Pending</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="CHECKED_OUT">Checked Out</option>
                </select>
            </div>
        </div>
    );
}

export default SearchFilter;

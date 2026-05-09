import { useState } from 'react';

interface SearchFilterProps {
    onSearch: (keyword: string) => void;
    onFilter: (status: string) => void;
}

export default function SearchFilter({
    onSearch,
    onFilter,
}: SearchFilterProps) {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const handleSearch = (value: string) => {
        setSearchKeyword(value);
        onSearch(value);
    };

    const handleFilterChange = (value: string) => {
        setFilterStatus(value);
        onFilter(value);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by booking ID, guest name or room number..."
                    className="w-full pl-10 pr-4 py-3 border border-cream rounded-md focus:border-gold focus:outline-none"
                />
            </div>

            <div className="flex items-center gap-3">
                <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="border border-cream rounded-md px-3 py-3 focus:border-gold focus:outline-none bg-white"
                >
                    <option value="all">All Check-outs</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="late">Late Requests</option>
                </select>
            </div>
        </div>
    );
}

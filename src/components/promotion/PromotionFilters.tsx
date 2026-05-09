import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import Dropdown from "../Dropdown";

interface PromotionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  discountTypeFilter: string;
  onDiscountTypeFilterChange: (value: string) => void;
  promotionTypeOptions?: { value: string; label: string }[];
  discountTypeOptions?: { value: string; label: string }[];
}

const PromotionFilters: React.FC<PromotionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  discountTypeFilter,
  onDiscountTypeFilterChange,
  promotionTypeOptions = [],
  discountTypeOptions = [],
}) => {
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    ...promotionTypeOptions,
  ];

  const discountOptions = [
    { value: "all", label: "All Discount Types" },
    ...discountTypeOptions,
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-[#6b5e4c]" />
        <h3 className="text-lg font-bold text-gray-800">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search promotions..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-[#6b5e4c] focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent outline-none transition-all text-gray-700 font-medium text-sm"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={onStatusFilterChange}
            placeholder="Select status"
          />
        </div>

        {/* Promotion Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promotion Type
          </label>
          <Dropdown
            options={typeOptions}
            value={typeFilter}
            onChange={onTypeFilterChange}
            placeholder="Select type"
          />
        </div>

        {/* Discount Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Type
          </label>
          <Dropdown
            options={discountOptions}
            value={discountTypeFilter}
            onChange={onDiscountTypeFilterChange}
            placeholder="Select discount type"
          />
        </div>
      </div>
    </div>
  );
};

export default PromotionFilters;

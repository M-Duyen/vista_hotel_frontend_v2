import React, { useState, useRef, useEffect } from "react";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Tìm label của option được chọn
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        dropdownRef.current &&
        target &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (option?.value != null) {
      onChange(option.value);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`relative ${className} cursor-pointer`}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full bg-white rounded-lg px-4 py-2.5 flex items-center justify-between gap-2 transition-all duration-200 border border-gray-300 hover:border-[#6b5e4c] focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent outline-none cursor-pointer"
      >
        <span className="text-gray-700 font-medium truncate text-sm">
          {displayText}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-[#6b5e4c]" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-h-60 overflow-y-auto"
        >
          {options.map((option, index) => (
            <button
              key={option.value ?? index}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-150 text-left text-sm cursor-pointer ${
                value === option.value
                  ? "bg-[#f5f0eb] text-[#6b5e4c] font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {option.icon && (
                <span className="text-lg flex-shrink-0">{option.icon}</span>
              )}
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {option.label}
              </span>
              {value === option.value && (
                <svg
                  className="w-5 h-5 text-[#6b5e4c] flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMagnifyingGlass,
    faXmark,
    faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import type { SearchSidebarProps } from '../types/Header';

const suggestions = [
    { name: 'Túi xách', category: 'Phụ kiện' },
    { name: 'Quý bà Dior', category: 'Thời trang' },
    { name: 'Ví', category: 'Phụ kiện' },
    { name: 'Khăn choàng cổ', category: 'Phụ kiện' },
    { name: 'Giày', category: 'Giày dép' },
    { name: 'Xô Caro', category: 'Phụ kiện' },
];

const SearchSidebar: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black z-40"
                />
            )}

            {/* Sidebar Search (Slide LEFT → RIGHT) */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white shadow-xl z-50 border-r"
            >
                {/* Header */}
                <div className="px-4 py-4 flex items-center justify-between border-b">
                    <button onClick={onClose} className="text-lg">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>

                    <span className="font-serif text-gray-700">Đóng</span>

                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="text-gray-600 text-lg"
                    />
                </div>

                {/* Input Search */}
                <div className="px-4 py-4 border-b">
                    <div className="relative flex items-center">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3 text-gray-500"
                        />

                        <input
                            type="text"
                            placeholder="Bạn đang tìm kiếm gì?"
                            className="w-full px-10 py-2 border-b focus:outline-none font-serif text-sm"
                        />

                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="absolute right-3 text-gray-700 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Suggestions */}
                <div className="px-4 py-4">
                    <h3 className="font-serif text-gray-700 mb-3">Gợi ý</h3>

                    <div className="space-y-4">
                        {suggestions.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-gray-900 font-serif">
                                    {item.name}
                                </span>

                                <span className="text-gray-400 text-sm font-serif">
                                    {item.category}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default SearchSidebar;

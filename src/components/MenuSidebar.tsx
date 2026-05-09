import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { MenuSidebarProps } from '../types/Header';

const MenuSidebar: React.FC<MenuSidebarProps> = ({
    isOpen,
    onClose,
    navItems,
}) => {
    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black z-40"
                />
            )}

            {/* Sidebar */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 border-r"
            >
                <div className="px-6 py-4 border-b font-semibold text-lg">
                    Menu
                </div>

                <div className="flex flex-col px-6 py-4 space-y-4">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            onClick={onClose}
                            className="text-gray-800 hover:text-amber-600 font-serif text-base"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </motion.div>
        </>
    );
};

export default MenuSidebar;

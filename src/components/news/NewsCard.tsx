/* eslint-disable */
import React from 'react';
import {
    FaTag,
    FaCalendarAlt,
    FaEye,
    FaTrashAlt,
    FaEdit,
    FaRegNewspaper,
    FaBullhorn,
    FaCalendarCheck,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Badge from './Badge';

interface InfoCardProps {
    item: {
        id: string;
        title: string;
        category: 'NEWS' | 'EVENT' | 'PROMOTION';
        status: 'published' | 'draft' | 'archived';
        preview: string;
        image: string;
        updatedDate: string;
        views: number;
    };
    onDelete: () => void;
    onEdit: () => void;
    onView: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({
    item,
    onDelete,
    onEdit,
    onView,
}) => {
    // Chọn icon theo loại tin
    const renderCategoryIcon = () => {
        switch (item.category) {
            case 'EVENT':
                return <FaCalendarCheck size={12} className="mr-2" />;
            case 'PROMOTION':
                return <FaBullhorn size={12} className="mr-2" />;
            default:
                return <FaRegNewspaper size={12} className="mr-2" />;
        }
    };

    // Đổi chữ hiển thị cho category
    const displayCategory = {
        NEWS: 'News',
        EVENT: 'Event',
        PROMOTION: 'Promotion',
    }[item.category];

    return (
        <motion.div
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {/* Image */}
            <div
                onClick={onView}
                className="h-52 bg-cover bg-center relative cursor-pointer"
                style={{ backgroundImage: `url(${item.image})` }}
            >
                <div className="absolute top-4 right-4">
                    <Badge status={item.status} />
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col h-[calc(100%-13rem)]">
                <h3 className="font-playfair text-xl mb-2 line-clamp-1">
                    {item.title}
                </h3>

                {/* Category */}
                <div className="text-gold text-sm flex items-center mb-3">
                    {renderCategoryIcon()}
                    <span>{displayCategory}</span>
                </div>

                {/* Preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {item.preview}
                </p>

                {/* Meta */}
                <div className="flex justify-between text-gray-500 text-xs mb-4">
                    <span className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        Updated: {item.updatedDate}
                    </span>
                    <span className="flex items-center">
                        <FaEye className="mr-1" /> {item.views.toLocaleString()}{' '}
                        views
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onView}
                        className="w-8 h-8 rounded-full bg-light hover:bg-cream flex items-center justify-center transition"
                        title="View"
                    >
                        <FaEye size={14} />
                    </button>

                    <button
                        onClick={onEdit}
                        className="w-8 h-8 rounded-full bg-light hover:bg-cream flex items-center justify-center transition"
                        title="Edit"
                    >
                        <FaEdit size={14} />
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={onDelete}
                        className="w-8 h-8 rounded-full bg-light hover:bg-red-200 flex items-center justify-center transition text-red-600"
                        title="Delete"
                    >
                        <FaTrashAlt size={13} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default InfoCard;

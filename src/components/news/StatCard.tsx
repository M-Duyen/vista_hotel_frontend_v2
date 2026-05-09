import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    icon: ReactNode;
    iconBgColor: string;
    value: string;
    label: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    iconBgColor,
    value,
    label,
}) => {
    return (
        <motion.div
            className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4"
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div
                className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}
            >
                {icon}
            </div>
            <div>
                <h3 className="text-2xl font-playfair font-semibold">
                    {value}
                </h3>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;

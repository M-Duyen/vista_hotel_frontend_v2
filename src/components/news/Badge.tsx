import React from 'react';

interface BadgeProps {
    status: 'published' | 'draft' | 'archived';
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'published':
                return 'bg-green-500 text-white';
            case 'draft':
                return 'bg-blue-500 text-white';
            case 'archived':
                return 'bg-amber-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

export default Badge;

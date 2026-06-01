import React from 'react';
import { Link } from 'react-router-dom';
import type { Service } from '../types/Service';

const ServiceCard: React.FC<{ service: Service; onClick?: () => void; to?: string }> = ({
    service,
    onClick,
    to,
}) => {
    const cardContent = (
        <>
            <img
                src={
                    service.images?.[0] ||
                    'https://via.placeholder.com/400x240?text=Service'
                }
                alt={service.serviceName}
                className="w-full h-40 object-cover"
            />
            <div className="p-4">
                <h4 className="text-base font-semibold mb-2">
                    {service.serviceName}
                </h4>
                {/* <div className="flex items-center gap-3 text-xs mb-2">
                    <span className="flex items-center text-yellow-500">
                        ⭐ {service.rating ?? '—'}
                    </span>
                    <span className="flex items-center text-gray-500">
                        🕐 {service.duration ?? '—'}
                    </span>
                </div> */}

                <div className="text-red-500 font-semibold mb-2 flex items-center gap-1 text-sm">
                    💰 {service.price ?? '—'} vnđ
                </div>

                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {service.description ?? ''}
                </p>
            </div>
        </>
    );

    const cardClassName = "service-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer";

    const card = onClick ? (
        <button type="button" onClick={onClick} className={`${cardClassName} text-left w-full`}>
            {cardContent}
        </button>
    ) : (
        <article className={cardClassName}>{cardContent}</article>
    );

    if (to) {
        return (
            <Link to={to} className="block">
                {card}
            </Link>
        );
    }

    return card;
};

export default ServiceCard;

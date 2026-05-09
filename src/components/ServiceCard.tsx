import React from 'react';
import type { Service } from '../types/Service';

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
    return (
        <article className="service-card bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
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

                <div className="mt-4">
                    <a
                        // href={service.buttonHref ?? '#'}
                        className="block w-full px-6 py-2 rounded-md text-sm font-medium font-serif
                       bg-white text-black border border-gray-300
                       hover:bg-[#CCBDA3] hover:text-black hover:border-transparent
                       transition-all duration-300 text-center"
                    >
                        BOOK SERVICE
                    </a>
                </div>
            </div>
        </article>
    );
};

export default ServiceCard;

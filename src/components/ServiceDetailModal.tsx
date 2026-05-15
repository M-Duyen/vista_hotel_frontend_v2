import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiClock, FiTag, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import type { Service } from '../types/Service';

interface ServiceDetailModalProps {
    service: Service | null;
    onClose: () => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!service) return null;

    const images = service.images && service.images.length > 0 
        ? service.images 
        : ['https://via.placeholder.com/800x600?text=No+Image+Available'];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white md:text-gray-500 md:bg-gray-100 md:hover:bg-gray-200 rounded-full transition-all shadow-lg"
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    {/* Left: Image Gallery */}
                    <div className="relative w-full md:w-3/5 bg-gray-100 flex items-center justify-center group h-[40vh] md:h-auto">
                        <motion.img
                            key={currentImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={images[currentImageIndex]}
                            alt={service.serviceName}
                            className="w-full h-full object-cover"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 p-3 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                                >
                                    <FiChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 p-3 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                                >
                                    <FiChevronRight className="w-6 h-6" />
                                </button>

                                {/* Thumbnails Indicator */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Content */}
                    <div className="w-full md:w-2/5 p-8 sm:p-12 overflow-y-auto bg-white flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full flex items-center gap-1">
                                    <FiTag className="w-3 h-3" />
                                    {service.serviceCategory}
                                </span>
                                {service.availability ? (
                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
                                        <FiCheckCircle className="w-3 h-3" />
                                        Available
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full flex items-center gap-1">
                                        <FiAlertCircle className="w-3 h-3" />
                                        Unavailable
                                    </span>
                                )}
                            </div>

                            <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {service.serviceName}
                            </h2>

                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-3xl font-bold text-red-500">
                                    {service.price.toLocaleString('vi-VN')}
                                </span>
                                <span className="text-sm font-medium text-gray-500">vnđ</span>
                            </div>

                            {service.serviceHours && (
                                <div className="flex items-center gap-2 text-gray-600 mb-6 font-medium">
                                    <FiClock className="w-5 h-5 text-blue-500" />
                                    <span>Operating Hours: {service.serviceHours}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-gray-900">About this service</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-12">
                            <button
                                className="w-full py-5 bg-[#2563eb] text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                disabled={!service.availability}
                            >
                                {service.availability ? 'BOOK NOW' : 'OUT OF SERVICE'}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">
                                * Final price will be calculated at checkout based on your selections.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ServiceDetailModal;

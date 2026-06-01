import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchRooms } from '../../services/roomService';
import { searchServices } from '../../services/serviceService';
import type { Room } from '../../types/Room';
import type { Service } from '../../types/Service';
import RoomCard from '../../components/RoomCard';
import ServiceCard from '../../components/ServiceCard';
import ServiceDetailModal from '../../components/ServiceDetailModal';
import Header from '@/components/Header';
import HeaderHome from '@/components/HeaderHome';
import RoomCompareBar from '@/components/customer/RoomCompareBar';
import RoomCompareModal from '@/components/customer/RoomCompareModal';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function SearchResults() {
    const q = useQuery();
    const query = q.get('q') || '';

    const [rooms, setRooms] = useState<Room[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const [showSolidHeader, setShowSolidHeader] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setShowSolidHeader(true);
            } else {
                setShowSolidHeader(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Compare functionality
    const [compareRooms, setCompareRooms] = useState<Room[]>([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [isModalMinimized, setIsModalMinimized] = useState(false);
    const MAX_COMPARE = 3;

    const handleCompareToggle = (room: Room) => {
        setCompareRooms((prev) => {
            const exists = prev.some((r) => r.roomNumber === room.roomNumber);
            if (exists) {
                return prev.filter((r) => r.roomNumber !== room.roomNumber);
            } else {
                if (prev.length >= MAX_COMPARE) {
                    alert(`Bạn chỉ có thể so sánh tối đa ${MAX_COMPARE} phòng`);
                    return prev;
                }
                return [...prev, room];
            }
        });
    };

    const handleRemoveFromCompare = (roomNumber: string) => {
        setCompareRooms((prev) =>
            prev.filter((r) => r.roomNumber !== roomNumber),
        );
    };

    const handleClearCompare = () => {
        setCompareRooms([]);
    };

    const handleOpenCompareModal = () => {
        if (compareRooms.length < 2) {
            alert('Vui lòng chọn ít nhất 2 phòng để so sánh');
            return;
        }
        setShowCompareModal(true);
    };

    const handleCloseCompareModal = () => {
        setShowCompareModal(false);
        setIsModalMinimized(false);
    };

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const [matchedRooms, matchedServices] = await Promise.all([
                    searchRooms({ q: query }),
                    searchServices({ q: query }),
                ]);

                setRooms(Array.isArray(matchedRooms) ? matchedRooms : []);
                setServices(Array.isArray(matchedServices) ? matchedServices : []);
            } catch (err) {
                console.error('SearchResults error', err);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [query]);

    return (
        <div>
            {/* Header chuyển đổi */}
            <div className="fixed top-0 left-0 w-full z-[9999] transition-all duration-700">
                <div
                    className={`transition-opacity duration-700 ${showSolidHeader
                            ? 'opacity-0 pointer-events-none'
                            : 'opacity-100'
                        }`}
                >
                    <HeaderHome />
                </div>

                <div
                    className={`absolute top-0 left-0 w-full transition-opacity duration-700 ${showSolidHeader
                            ? 'opacity-100'
                            : 'opacity-0 pointer-events-none'
                        }`}
                >
                    <Header />
                </div>
            </div>

            <div className="min-h-screen bg-white pt-24">
            <div className="max-w-5xl  mx-auto px-4">
                <h1 className="text-2xl font-semibold mb-4">Kết quả tìm kiếm</h1>
                <p className="text-sm text-gray-600 mb-6">Tìm cho: <strong>{query}</strong></p>

                {loading && <div>Loading…</div>}

                {!loading && (
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-lg font-medium mb-2">Phòng</h2>
                            {rooms.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {rooms.map((r) => (
                                        <div
                                            key={r.roomNumber}
                                            className="transform transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            <RoomCard
                                                room={r}
                                                to={`/room/${encodeURIComponent(r.roomNumber || "")}`}
                                                onCompareToggle={handleCompareToggle}
                                                isInCompare={compareRooms.some(
                                                    (cr) => cr.roomNumber === r.roomNumber
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Không tìm thấy phòng phù hợp.</div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-lg font-medium mb-2">Dịch vụ</h2>
                            {services.length ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {services.map((s) => (
                                        <ServiceCard
                                            key={s.serviceID || s.serviceName}
                                            service={s}
                                            onClick={() => setSelectedService(s)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Không tìm thấy dịch vụ phù hợp.</div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            <ServiceDetailModal
                service={selectedService}
                onClose={() => setSelectedService(null)}
            />

            {/* Compare Bar - Hidden when modal is minimized */}
            {!isModalMinimized && (
                <RoomCompareBar
                    selectedRooms={compareRooms}
                    onRemove={handleRemoveFromCompare}
                    onCompare={handleOpenCompareModal}
                    onClear={handleClearCompare}
                />
            )}

            {/* Compare Modal */}
            {showCompareModal && (
                <RoomCompareModal
                    rooms={compareRooms}
                    onClose={handleCloseCompareModal}
                    onRemoveRoom={handleRemoveFromCompare}
                    onMinimizeChange={setIsModalMinimized}
                />
            )}
            </div>
        </div>
    );
}

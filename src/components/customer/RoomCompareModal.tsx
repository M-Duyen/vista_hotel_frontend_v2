import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Minus, Minimize2, Maximize2 } from 'lucide-react';
import type { Room } from '../../types/Room';
import {
    addRoomToCart,
    removeRoomFromCart,
    getCartBeanByCustomerId,
} from '../../services/cartBeanService';

interface RoomCompareModalProps {
    rooms: Room[];
    onClose: () => void;
    onRemoveRoom: (roomNumber: string) => void;
    onMinimizeChange?: (isMinimized: boolean) => void;
}

export default function RoomCompareModal({
    rooms,
    onClose,
    onRemoveRoom,
    onMinimizeChange,
}: RoomCompareModalProps) {
    const navigate = useNavigate();
    const [isMinimized, setIsMinimized] = useState(false);
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

    const [cartRoomNumbers, setCartRoomNumbers] = useState<string[]>([]);
    const [cartLoading, setCartLoading] = useState<Record<string, boolean>>({});

    const getCustomerId = (): string | null => {
        try {
            const userDataStr = localStorage.getItem("user");
            const userData = userDataStr ? JSON.parse(userDataStr) : null;
            return userData?.data?.id || userData?.id || null;
        } catch (error) {
            console.debug("Failed to get customer ID", error);
            return null;
        }
    };

    useEffect(() => {
        const customerId = getCustomerId();
        if (!customerId) return;

        getCartBeanByCustomerId(customerId)
            .then((cart) => {
                if (cart?.items) {
                    setCartRoomNumbers(cart.items.map((item: any) => item.roomNumber?.toString()));
                }
            })
            .catch((err) => {
                console.debug("Failed to fetch cart in compare modal", err);
            });
    }, [rooms]);

    const handleToggleCart = async (roomNumber: string) => {
        const customerId = getCustomerId();
        if (!customerId) {
            alert("Please log in to add items to cart");
            navigate("/auth/login");
            return;
        }

        if (cartLoading[roomNumber]) return;

        const inCart = cartRoomNumbers.includes(roomNumber);

        try {
            setCartLoading(prev => ({ ...prev, [roomNumber]: true }));
            if (inCart) {
                await removeRoomFromCart(customerId, roomNumber);
                setCartRoomNumbers(prev => prev.filter(id => id !== roomNumber));
            } else {
                await addRoomToCart(customerId, roomNumber);
                setCartRoomNumbers(prev => [...prev, roomNumber]);
            }

            // Dispatch event to notify RoomCard or other components about cart changes
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            console.error("Failed to update cart", err);
            alert("Failed to update cart. Please try again.");
        } finally {
            setCartLoading(prev => ({ ...prev, [roomNumber]: false }));
        }
    };

    const handleBookNow = (roomNumber: string) => {
        const userDataStr = localStorage.getItem("user");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const isLoggedIn = !!(userData?.data?.id || userData?.id);

        if (!isLoggedIn) {
            alert("Please log in to book a room");
            navigate("/auth/login");
            return;
        }

        navigate("/customer/bookingPage", {
            state: {
                selectedRooms: [roomNumber],
                bookingType: "DAILY"
            }
        });
    };

    const handleMinimize = (minimized: boolean) => {
        setIsMinimized(minimized);
        onMinimizeChange?.(minimized);
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);

    const features = [
        { key: 'typeName', label: 'Room Type', format: (v: string) => v },
        {
            key: 'basePrice',
            label: 'Price / night',
            format: (v: number) => formatPrice(v),
        },
        {
            key: 'maxOccupancy',
            label: 'Max Occupancy',
            format: (v: number) => `${v} guests`,
        },
        {
            key: 'roomSize',
            label: 'Room Size',
            format: (v: number) => `${v} m²`,
        },
        {
            key: 'bedType',
            label: 'Bed Type',
            format: (v: string) => v || 'No information',
        },
        {
            key: 'hasBalcony',
            label: 'Balcony',
            format: (v: boolean) =>
                v ? <Check size={20} /> : <Minus size={20} />,
        },
        {
            key: 'hasSeaView',
            label: 'Sea View',
            format: (v: boolean) =>
                v ? <Check size={20} /> : <Minus size={20} />,
        },
        { key: 'floor', label: 'Floor', format: (v: number) => `Floor ${v}` },
        {
            key: 'description',
            label: 'Description',
            format: (v: string) => v || 'No description',
        },
    ];

    // Helper function to check if feature has differences
    const hasFeatureDifference = (feature: { key: string }) => {
        const values = rooms.map((room) => {
            if (feature.key === 'floor') {
                return room.floor;
            } else if (feature.key === 'description') {
                return room.roomType?.description || room.notes;
            } else {
                return room.roomType?.[
                    feature.key as keyof typeof room.roomType
                ];
            }
        });

        // Check if all values are the same
        const firstValue = JSON.stringify(values[0]);
        return !values.every((val) => JSON.stringify(val) === firstValue);
    };

    // Filter features based on showDifferencesOnly
    const displayedFeatures = showDifferencesOnly
        ? features.filter((feature) => hasFeatureDifference(feature))
        : features;

    // Helper function to determine if a value is the best (advantage)
    const isBestValue = (feature: { key: string }, room: Room) => {
        const values = rooms.map((r) => {
            if (feature.key === 'floor') return r.floor;
            if (feature.key === 'description') return null; // Skip description
            return r.roomType?.[feature.key as keyof typeof r.roomType];
        });

        const currentValue =
            feature.key === 'floor'
                ? room.floor
                : room.roomType?.[feature.key as keyof typeof room.roomType];

        // Skip highlighting for certain fields
        if (
            feature.key === 'typeName' ||
            feature.key === 'description' ||
            feature.key === 'bedType'
        )
            return false;

        // For price: lowest is best
        if (feature.key === 'basePrice') {
            const numValues = values.filter(
                (v) => typeof v === 'number',
            ) as number[];
            return currentValue === Math.min(...numValues);
        }

        // For maxOccupancy and roomSize: highest is best
        if (feature.key === 'maxOccupancy' || feature.key === 'roomSize') {
            const numValues = values.filter(
                (v) => typeof v === 'number',
            ) as number[];
            return currentValue === Math.max(...numValues);
        }

        // For boolean features (hasBalcony, hasSeaView): true is best
        if (feature.key === 'hasBalcony' || feature.key === 'hasSeaView') {
            return currentValue === true;
        }

        return false;
    };

    return (
        <>
            {/* Minimized Button - Bottom Right Corner */}
            {isMinimized && (
                <button
                    onClick={() => handleMinimize(false)}
                    className="fixed bottom-6 right-6 z-50 bg-[#CCBDA3] text-white rounded-full shadow-2xl hover:bg-[#b8a88a] transition-all hover:scale-110 group"
                    aria-label="Expand comparison"
                >
                    <div className="flex items-center gap-3 px-5 py-4">
                        <Maximize2 size={20} />
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold">
                                Compare ({rooms.length})
                            </span>
                            <span className="text-xs opacity-90">
                                Click to expand
                            </span>
                        </div>
                    </div>
                </button>
            )}

            {/* Full Modal */}
            {!isMinimized && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-7xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">
                                        Room Comparison
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Comparing {rooms.length} rooms
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleMinimize(true)}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        aria-label="Minimize"
                                        title="Minimize"
                                    >
                                        <Minimize2
                                            size={20}
                                            className="text-gray-600"
                                        />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        aria-label="Close"
                                        title="Close"
                                    >
                                        <X
                                            size={24}
                                            className="text-gray-600"
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Checkbox filter */}
                            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={showDifferencesOnly}
                                        onChange={(e) =>
                                            setShowDifferencesOnly(
                                                e.target.checked,
                                            )
                                        }
                                        className="w-4 h-4 rounded border-gray-300 text-[#CCBDA3] focus:ring-[#CCBDA3] cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 select-none">
                                        Show differences only
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="sticky left-0 w-40 px-4 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 bg-gray-50 z-10">
                                            Features
                                        </th>
                                        {rooms.map((room) => (
                                            <th
                                                key={room.roomNumber}
                                                className="px-6 py-4 text-center border-b border-l border-gray-200 min-w-[280px]"
                                            >
                                                <div className="relative">
                                                    <button
                                                        onClick={() =>
                                                            room.roomNumber &&
                                                            onRemoveRoom(
                                                                room.roomNumber,
                                                            )
                                                        }
                                                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                                                        aria-label="Remove room"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                    <div className="w-full h-48 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                                                        {room.images &&
                                                        room.images.length >
                                                            0 ? (
                                                            <img
                                                                src={
                                                                    room
                                                                        .images[0]
                                                                }
                                                                alt={
                                                                    room
                                                                        .roomType
                                                                        ?.typeName ||
                                                                    room.roomNumber
                                                                }
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                                No image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {room.roomType
                                                            ?.typeName ||
                                                            room.roomNumber}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Room {room.roomNumber}
                                                    </p>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedFeatures.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={rooms.length + 1}
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <Check
                                                        size={48}
                                                        className="text-green-500"
                                                    />
                                                    <p className="text-lg font-medium">
                                                        All rooms have identical
                                                        information
                                                    </p>
                                                    <p className="text-sm">
                                                        No differences found
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedFeatures.map(
                                            (feature, idx) => (
                                                <tr
                                                    key={feature.key}
                                                    className={
                                                        idx % 2 === 0
                                                            ? 'bg-white'
                                                            : 'bg-gray-50'
                                                    }
                                                >
                                                    <td className="sticky left-0 px-4 py-4 text-sm font-medium text-gray-700 border-b border-gray-200 z-10 bg-inherit">
                                                        {feature.label}
                                                    </td>
                                                    {rooms.map((room) => {
                                                        let value: unknown;
                                                        if (
                                                            feature.key ===
                                                            'floor'
                                                        ) {
                                                            value = room.floor;
                                                        } else if (
                                                            feature.key ===
                                                            'description'
                                                        ) {
                                                            value =
                                                                room.roomType
                                                                    ?.description ||
                                                                room.notes;
                                                        } else {
                                                            value =
                                                                room.roomType?.[
                                                                    feature.key as keyof typeof room.roomType
                                                                ];
                                                        }

                                                        const isAdvantage =
                                                            showDifferencesOnly &&
                                                            isBestValue(
                                                                feature,
                                                                room,
                                                            );

                                                        return (
                                                            <td
                                                                key={
                                                                    room.roomNumber
                                                                }
                                                                className={`px-6 py-4 text-center text-sm border-b border-l border-gray-200 ${
                                                                    isAdvantage
                                                                        ? 'bg-green-50 text-green-700 font-semibold'
                                                                        : 'text-gray-600'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-center gap-1">
                                                                    {feature.format(
                                                                        value as never,
                                                                    )}
                                                                    {isAdvantage && (
                                                                        <span className="text-green-600">
                                                                            ✓
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            )
                                        )
                                    )}
                                    {/* Actions Row */}
                                    <tr className="bg-white">
                                        <td className="sticky left-0 px-4 py-4 text-sm font-medium text-gray-700 border-b border-gray-200 z-10 bg-inherit">
                                            Actions
                                        </td>
                                        {rooms.map((room) => (
                                            <td
                                                key={room.roomNumber}
                                                className="px-6 py-4 text-center border-b border-l border-gray-200"
                                            >
                                                <div className="flex flex-col gap-2 px-2">
                                                    <button
                                                        onClick={() => room.roomNumber && handleBookNow(room.roomNumber)}
                                                        className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#CCBDA3] rounded-lg hover:bg-[#b8a88a] transition-all duration-200 shadow-sm hover:shadow"
                                                    >
                                                        Book Now
                                                    </button>
                                                    <button
                                                        onClick={() => room.roomNumber && handleToggleCart(room.roomNumber)}
                                                        disabled={room.roomNumber ? cartLoading[room.roomNumber] : false}
                                                        className={`w-full px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${
                                                            room.roomNumber && cartRoomNumbers.includes(room.roomNumber)
                                                                ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                                                                : 'bg-white border-[#CCBDA3] text-[#CCBDA3] hover:bg-[#CCBDA3]/10'
                                                        }`}
                                                    >
                                                        {room.roomNumber && cartLoading[room.roomNumber] ? (
                                                            <span className="animate-spin text-xs">⏳ Loading...</span>
                                                        ) : room.roomNumber && cartRoomNumbers.includes(room.roomNumber) ? (
                                                            'Remove from Cart'
                                                        ) : (
                                                            'Add to Cart'
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar & Animation Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #CCBDA3;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #b8a88a;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #CCBDA3 #f1f1f1;
                }
                
                /* Pulse animation for minimized button */
                @keyframes pulse-soft {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(204, 189, 163, 0.7);
                    }
                    50% {
                        box-shadow: 0 0 0 10px rgba(204, 189, 163, 0);
                    }
                }
                
                .fixed.bottom-6.right-6 {
                    animation: pulse-soft 2s infinite;
                }
            `}</style>
        </>
    );
}

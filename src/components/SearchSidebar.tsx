import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMagnifyingGlass,
    faXmark,
    faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import type { SearchSidebarProps } from '../types/Header';

// Project-specific default suggestions (rooms, room types, services)
const defaultSuggestions = [
    { name: 'Deluxe King', category: 'Room Type' },
    { name: '101', category: 'Room' },
    { name: 'Laundry Express', category: 'Service' },
    { name: 'Breakfast Buffet', category: 'Service' },
    { name: 'Family Suite', category: 'Room Type' },
];

import { getAllRoomTypes, searchRooms } from '../services/roomService';
import { getAll as getAllServices, searchServices } from '../services/serviceService';

const SearchSidebar: React.FC<SearchSidebarProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Array<{ name: string; category: string }>>(
        defaultSuggestions,
    );
    const debounceRef = useRef<number | null>(null);

    const runSearch = useCallback(
        async (q: string) => {
            if (!q) {
                setResults(defaultSuggestions);
                return;
            }

            try {
                const [roomsRes, typesRes] = await Promise.all([
                    searchRooms({ q }),
                    getAllRoomTypes(),
                ]);
                // services: prefer server-side search
                let servicesRes: any[] = [];
                try {
                    servicesRes = await searchServices({ q });
                } catch (error) {
                    console.error('Search services error', error);
                    const allSvc = await getAllServices();
                    servicesRes = Array.isArray(allSvc) ? allSvc : [];
                }

                const flattened: Array<{ name: string; category: string }> = [];

                if (Array.isArray(roomsRes)) {
                    roomsRes.slice(0, 5).forEach((r: any) =>
                        flattened.push({
                            name: r.roomNumber || r.name || r.title || String(r.id),
                            category: 'Room',
                        }),
                    );
                }

                if (Array.isArray(typesRes)) {
                    typesRes
                        .filter((t: any) =>
                            (t.typeName || t.name || '')
                                .toLowerCase()
                                .includes(q.toLowerCase()),
                        )
                        .slice(0, 5)
                        .forEach((t: any) =>
                            flattened.push({
                                name: t.typeName || t.name || String(t.id),
                                category: 'Room Type',
                            }),
                        );
                }

                if (Array.isArray(servicesRes)) {
                    servicesRes.slice(0, 5).forEach((s: any) =>
                        flattened.push({ name: s.serviceName || s.name || String(s.serviceID || s.id), category: 'Service' }),
                    );
                }

                setResults(flattened.length ? flattened : defaultSuggestions);
            } catch (err) {
                console.error('Search error', err);
                setResults(defaultSuggestions);
            }
        },
        [],
    );

    useEffect(() => {
        // simple debounce
        if (debounceRef.current) {
            globalThis.clearTimeout(debounceRef.current);
        }
        // @ts-ignore
        debounceRef.current = globalThis.setTimeout(() => runSearch(query), 300);

        return () => {
            if (debounceRef.current) globalThis.clearTimeout(debounceRef.current as number);
        };
    }, [query, runSearch]);

    const navigate = useNavigate();

    const handleSelect = (item: { name: string; category: string }) => {
        // Close sidebar first
        onClose();

        if (item.category === 'Room Type') {
            // Navigate to room list and pre-select room type via query param
            navigate(`/room?type=${encodeURIComponent(item.name)}`);
            return;
        }

        if (item.category === 'Room') {
            // Try to open room detail (room id/number)
            navigate(`/room/${encodeURIComponent(item.name)}`);
            return;
        }

        if (item.category === 'Service') {
            navigate(`/service?q=${encodeURIComponent(item.name)}`);
            return;
        }

        // For other categories, open search results
        navigate(`/search?q=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.category)}`);
    };

    const handleSearchEnter = () => {
        const trimmedQuery = query.trim();

        globalThis.dispatchEvent(
            new CustomEvent('searchSidebarEnter', {
                detail: {
                    query: trimmedQuery,
                    hasResults: results.length > 0,
                },
            }),
        );

        if (trimmedQuery) {
            onClose();
            navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
            return;
        }

        if (results.length > 0) {
            handleSelect(results[0]);
        }
    };

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
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearchEnter();
                                }
                            }}
                            type="text"
                            placeholder="Tìm phòng, loại phòng hoặc dịch vụ..."
                            className="w-full px-10 py-2 border-b focus:outline-none font-serif text-sm"
                        />

                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="absolute right-3 text-gray-700 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Suggestions / Results */}
                <div className="px-4 py-4">
                    <h3 className="font-serif text-gray-700 mb-3">Gợi ý</h3>

                    <div className="space-y-3">
                        {results.map((item) => (
                            <button
                                key={`${item.category}-${item.name}`}
                                onClick={() => handleSelect(item)}
                                className="w-full text-left flex justify-between py-2 px-2 rounded hover:bg-gray-50"
                            >
                                <span className="text-gray-900 font-serif">
                                    {item.name}
                                </span>

                                <span className="text-gray-400 text-sm font-serif">
                                    {item.category}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default SearchSidebar;

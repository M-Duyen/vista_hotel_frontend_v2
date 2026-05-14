/*eslint-disable*/
import React, { useEffect, useState, useMemo } from 'react';
import type { RoomType } from '../../../types/RoomType';
import {
    getAllRoomTypes,
    getRoomTypeById,
    saveRoomType,
} from '../../../services/roomTypeService';
import {
    getAllSeasonalPrices_RoomType,
    saveSeasonalPriceWithRoomTypes,
    deleteSeasonalPrice,
} from '@/services/SeasonPriceService';

import type { SeasonPrice } from '../../../types/SeasonPrice';

// Replace large per-tab JSX with component usage — keep logic/state in this file
import BasePricesTab from './components/BasePricesTab';
import SeasonalTab from './components/SeasonalTab';
import ByHourTab from './components/ByHourTab';
import ExtraFeesTab from './components/ExtraFeesTab';
import ConfirmDialog from '../../../components/dialog/ConfirmDialog';

export default function PricingManager() {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editing, setEditing] = useState<any | null>(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [yearForHolidays, setYearForHolidays] = useState<string>(
        String(new Date().getFullYear()),
    );
    const [msg, setMsg] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<
        'base' | 'season' | 'byHour' | 'extra'
    >('base');

    const [rowEditing, setRowEditing] = useState<string | null>(null);
    const [priceEdits, setPriceEdits] = useState<Record<string, number>>({});

    // SEASONAL PRICING state
    const [seasonalPrices, setSeasonalPrices] = useState<SeasonPrice[]>([]);
    const [newSeason, setNewSeason] = useState<{
        name?: string;
        multiplier?: number;
        startDate?: string;
        endDate?: string;
        description?: string;
        roomTypes?: string[]; // new: selected room type ids or ["ALL"]
    }>({
        roomTypes: [],
    });
    const [seasonLoading, setSeasonLoading] = useState(false);

    // sort by price state
    const [sortOrder, setSortOrder] = useState<'price_asc' | 'price_desc' | ''>(
        '',
    );

    // dropdown options (used by custom Dropdown)
    const sortOptions = [
        { value: '', label: 'All' },
        { value: 'price_asc', label: 'Price: Low → High' },
        { value: 'price_desc', label: 'Price: High → Low' },
    ];

    const getPrice = (rt: RoomType) =>
        Number((rt as any).basePrice ?? (rt as any).roomPrice ?? 0);

    // memoized sorted list (empty = original order)
    const sortedRooms = useMemo(() => {
        const list = [...roomTypes];
        if (sortOrder === 'price_asc') {
            list.sort((a, b) => getPrice(a) - getPrice(b));
        } else if (sortOrder === 'price_desc') {
            list.sort((a, b) => getPrice(b) - getPrice(a));
        }
        return list;
    }, [roomTypes, sortOrder]);

    useEffect(() => {
        loadRoomTypes();
    }, []);

    useEffect(() => {
        if (selectedId) loadRoomType(selectedId);
        else setEditing(null);
    }, [selectedId]);

    // load seasonal prices when component mounts or when user switches to season tab
    useEffect(() => {
        if (activeTab === 'season') loadSeasonalPrices();
    }, [activeTab]);

    async function loadRoomTypes() {
        setLoading(true);
        try {
            const data = await getAllRoomTypes();
            setRoomTypes(data || []);
            if (data?.length && !selectedId) {
                setSelectedId(String(data[0].id ?? data[0].typeId));
            }
        } catch (e) {
            console.error(e);
            setMsg('Failed to load room types');
        } finally {
            setLoading(false);
        }
    }

    async function loadRoomType(id: string) {
        setLoading(true);
        try {
            const rt = await getRoomTypeById(id);
            const normalized = {
                ...rt,
                pricingRules: rt.pricingRules ?? [],
                specialPrices: rt.specialPrices ?? [],
                basePrice: rt.basePrice ?? rt.roomPrice ?? 0,
            };
            setEditing(normalized);
        } catch (e) {
            console.error(e);
            setMsg('Failed to load room type');
            setEditing(null);
        } finally {
            setLoading(false);
        }
    }

    async function loadSeasonalPrices() {
        setSeasonLoading(true);
        try {
            // Use the API that returns PriceDTO with room type details
            const data = await getAllSeasonalPrices_RoomType();

            console.log('Loaded seasonal prices with room types:', data);

            // Transform PriceDTO[] to SeasonPrice[] if needed
            // Backend returns: { seasonalPrice: {...}, roomTypeIDs: [...] }
            const seasonalPrices = data.map((dto: any) => {
                console.log('Processing DTO:', dto);
                // If backend returns PriceDTO format
                if (dto.seasonalPrice && dto.roomTypeIDs !== undefined) {
                    const result = {
                        ...dto.seasonalPrice,
                        roomTypes: dto.roomTypeIDs || [], // ensure it's an array
                    };
                    console.log('  -> Transformed to:', result);
                    return result;
                }
                // If backend already returns SeasonPrice format
                const result = {
                    ...dto,
                    roomTypes: dto.roomTypes || [], // ensure it's an array
                };
                console.log('  -> Using direct format:', result);
                return result;
            });

            console.log('Normalized seasonal prices:', seasonalPrices);
            setSeasonalPrices(seasonalPrices);
        } catch (err) {
            console.error('Failed to load seasonal prices', err);
        } finally {
            setSeasonLoading(false);
        }
    }

    function startRowEdit(roomTypeID: string, currentPrice: number) {
        if (!roomTypeID) return;
        setSelectedId(String(roomTypeID));
        setRowEditing(roomTypeID);
        setPriceEdits((p) => ({ ...p, [roomTypeID]: currentPrice }));
    }

    function cancelRowEdit(roomTypeID?: string) {
        // clear edit state and selected room type
        const key = roomTypeID ?? selectedId;
        setRowEditing(null);
        setSelectedId(null);
        setPriceEdits((p) => {
            const c = { ...p };
            if (key) delete c[String(key)];
            return c;
        });
    }
    async function saveRowPrice() {
        const targetId = rowEditing;
        if (!targetId) return;

        const newPrice = priceEdits[targetId];
        if (newPrice == null) return;

        setSaving(true);
        try {
            const currentRoomType = await getRoomTypeById(targetId);

            const payload: RoomType = {
                ...currentRoomType,
                basePrice: Number(newPrice),
            };

            await saveRoomType(payload);
            await loadRoomTypes();
            setMsg('Saved price');
            cancelRowEdit(targetId);
        } catch (err: any) {
            console.error('Error saving room type:', err);
            alert('Save failed');
        } finally {
            setSaving(false);
        }
    }

    // Success dialog state
    const [successDialog, setSuccessDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
    });

    async function handleAddSeason() {
        // basic validation
        if (
            !newSeason.name ||
            !newSeason.startDate ||
            !newSeason.endDate ||
            !newSeason.multiplier
        ) {
            alert('Please fill name, start/end dates and multiplier');
            return;
        }

        // Build PriceDTO payload: roomTypeIDs empty array means "apply to all"
        let roomTypeIDs: string[] = [];

        if (newSeason.roomTypes && newSeason.roomTypes.length > 0) {
            if (newSeason.roomTypes.includes('ALL')) {
                // "ALL" selected -> send empty array (backend interprets as apply to all)
                roomTypeIDs = [];
            } else {
                // Specific rooms selected -> send those IDs
                roomTypeIDs = newSeason.roomTypes.filter((id) => id !== 'ALL');
            }
        }

        const payload = {
            seasonalPrice: {
                // No id -> backend will create new
                seasonName: newSeason.name,
                priceMultiplier: Number(newSeason.multiplier),
                startDate: newSeason.startDate,
                endDate: newSeason.endDate,
                description: newSeason.description ?? '',
            },
            roomTypeIDs: roomTypeIDs,
        };

        console.log('Creating seasonal price:', payload);

        try {
            await saveSeasonalPriceWithRoomTypes(payload);
            setNewSeason({ roomTypes: [] });
            await loadSeasonalPrices();
            // Show success dialog
            setSuccessDialog({
                isOpen: true,
                title: 'Success!',
                message: `Seasonal pricing rule "${newSeason.name}" has been created successfully.`,
            });
        } catch (err: any) {
            console.error('Error adding seasonal price', err);
            alert(err?.message ?? 'Add failed');
        }
    }

    async function handleEditSeason(id: number) {
        console.log('=== handleEditSeason called ===');
        console.log('Editing season ID:', id);
        console.log('Current newSeason state:', newSeason);
        console.log('Available roomTypes:', roomTypes);

        // basic validation
        if (
            !newSeason.name ||
            !newSeason.startDate ||
            !newSeason.endDate ||
            !newSeason.multiplier
        ) {
            alert('Please fill name, start/end dates and multiplier');
            return;
        }

        // Build PriceDTO payload - same logic as add
        let roomTypeIDs: string[] = [];

        console.log('newSeason.roomTypes:', newSeason.roomTypes);

        if (newSeason.roomTypes && newSeason.roomTypes.length > 0) {
            if (newSeason.roomTypes.includes('ALL')) {
                console.log('  -> User selected ALL, sending empty array');
                roomTypeIDs = [];
            } else {
                console.log('  -> User selected specific rooms');
                // Ensure we're sending the correct ID format
                roomTypeIDs = newSeason.roomTypes
                    .filter((id) => id !== 'ALL')
                    .map((id) => {
                        // Find the room type to verify it exists
                        const rt = roomTypes.find(
                            (r) =>
                                String(r.roomTypeID ?? r.id ?? r.typeId) ===
                                String(id),
                        );
                        if (!rt) {
                            console.warn(`Room type not found for ID: ${id}`);
                        } else {
                            console.log(`  -> Mapping ${id} to room type:`, rt);
                        }
                        // Return the ID as-is (backend should handle the format)
                        return String(id);
                    });
                console.log('  -> Filtered roomTypeIDs:', roomTypeIDs);
            }
        } else {
            console.log(
                '  -> newSeason.roomTypes is empty/null, sending empty array',
            );
            roomTypeIDs = [];
        }

        const payload = {
            seasonalPrice: {
                id: id,
                seasonName: newSeason.name,
                priceMultiplier: Number(newSeason.multiplier),
                startDate: newSeason.startDate,
                endDate: newSeason.endDate,
                description: newSeason.description ?? '',
            },
            roomTypeIDs: roomTypeIDs,
        };

        console.log('Final payload to send:', JSON.stringify(payload, null, 2));

        try {
            await saveSeasonalPriceWithRoomTypes(payload);
            console.log('Update successful, reloading data...');
            setNewSeason({ roomTypes: [] });
            await loadSeasonalPrices();
            console.log('Data reloaded, checking result...');
            // Show success dialog
            setSuccessDialog({
                isOpen: true,
                title: 'Updated Successfully!',
                message: `Seasonal pricing rule "${newSeason.name}" has been updated successfully.`,
            });
        } catch (err: any) {
            console.error('Error updating seasonal price', err);
            alert(err?.message ?? 'Update failed');
        }
    }

    async function handleDeleteSeason(id: number) {
        if (!confirm('Delete this seasonal price?')) return;
        try {
            await deleteSeasonalPrice(id);
            await loadSeasonalPrices();
        } catch (err: any) {
            console.error('Error deleting seasonal price', err);
            alert(err?.message ?? 'Delete failed');
        }
    }

    const fmt = (v: number | undefined) =>
        typeof v === 'number'
            ? v.toLocaleString('vi-VN', { maximumFractionDigits: 0 })
            : '-';

    // add new state near other useState declarations
    const [roomSelectOpen, setRoomSelectOpen] = useState(false);

    // helper to toggle selection; supports "ALL"
    function toggleRoomOption(id: string) {
        const cur = newSeason.roomTypes ?? [];

        if (id === 'ALL') {
            // Toggle ALL: if already ALL, clear all; otherwise set to ALL only
            setNewSeason((s) => ({
                ...s,
                roomTypes: cur.includes('ALL') ? [] : ['ALL'],
            }));
            return;
        }

        // If ALL is currently selected, clear it first and select only this room
        if (cur.includes('ALL')) {
            setNewSeason((s) => ({ ...s, roomTypes: [id] }));
            return;
        }

        // Toggle individual room: add if not present, remove if present
        if (cur.includes(id)) {
            // Remove this room from selection
            setNewSeason((s) => ({
                ...s,
                roomTypes: cur.filter((x) => x !== id),
            }));
        } else {
            // Add this room to selection (keep existing selections)
            setNewSeason((s) => ({
                ...s,
                roomTypes: [...cur, id],
            }));
        }
    }

    function roomSelectionLabel(): string {
        const cur = newSeason.roomTypes ?? [];
        if (cur.length === 0) return 'Select room types';
        if (cur.includes('ALL')) return 'All room types';

        const first = roomTypes.find(
            (r) => String(r.roomTypeID ?? r.id ?? r.typeId) === cur[0],
        );
        const firstLabel = first
            ? String(first.typeName ?? first.name ?? cur[0])
            : String(cur[0]);
        return cur.length === 1
            ? firstLabel
            : `${firstLabel} +${cur.length - 1} more`;
    }

    // helper: map season.roomTypes (ids) -> readable labels
    function getSeasonRoomLabels(s: SeasonPrice): string[] {
        const ids = s.roomTypes ?? [];

        if (ids.length === 0) {
            return ['All room types'];
        }

        // Map room type IDs to readable labels
        const labels: string[] = ids.map((rid) => {
            const rt = roomTypes.find(
                (r) => String(r.roomTypeID ?? r.id ?? r.typeId) === String(rid),
            );
            const label = rt
                ? String(rt.typeName ?? rt.name ?? rid)
                : String(rid);
            return label;
        });

        return labels;
    }

    // helper: render up to 3 labels then "+N more"
    function renderRoomBadges(labels: unknown[]) {
        if (!labels || (labels as any).length === 0) return null;
        const arr = labels as unknown[];
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {arr.slice(0, 3).map((l, i) => (
                    <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                    >
                        {String(l)}
                    </span>
                ))}
                {arr.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-50 text-gray-600">
                        +{arr.length - 3} more
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 py-2">
            <h1 className="text-2xl font-semibold mb-4">Pricing Management</h1>

            {/* TABS */}
            <div className="mb-6">
                <div className="bg-gray-100/80 p-2 rounded-full shadow-sm">
                    <div className="max-w-4xl mx-auto grid grid-cols-4 gap-3">
                        {[
                            { key: 'base', label: 'Base Prices' },
                            { key: 'season', label: 'Seasonal' },
                            { key: 'byHour', label: 'By Hour' },
                            { key: 'extra', label: 'Extra Fees' },
                        ].map((t) => {
                            const active = activeTab === (t.key as any);
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveTab(t.key as any)}
                                    className={`w-full text-sm py-2 rounded-full ${
                                        active
                                            ? 'bg-white shadow-md font-semibold'
                                            : 'text-gray-600 hover:bg-white/50'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Render tabs using extracted components */}
            {activeTab === 'base' && (
                <BasePricesTab
                    sortedRooms={sortedRooms}
                    rowEditing={rowEditing}
                    priceEdits={priceEdits}
                    setPriceEdits={setPriceEdits}
                    startRowEdit={startRowEdit}
                    cancelRowEdit={cancelRowEdit}
                    saveRowPrice={saveRowPrice}
                    fmt={fmt}
                />
            )}

            {activeTab === 'season' && (
                <SeasonalTab
                    seasonLoading={seasonLoading}
                    seasonalPrices={seasonalPrices}
                    newSeason={newSeason}
                    setNewSeason={setNewSeason}
                    roomTypes={roomTypes}
                    roomSelectOpen={roomSelectOpen}
                    setRoomSelectOpen={setRoomSelectOpen}
                    toggleRoomOption={toggleRoomOption}
                    roomSelectionLabel={roomSelectionLabel}
                    handleAddSeason={handleAddSeason}
                    handleEditSeason={handleEditSeason}
                    handleDeleteSeason={handleDeleteSeason}
                    getSeasonRoomLabels={getSeasonRoomLabels}
                    renderRoomBadges={renderRoomBadges}
                />
            )}

            {activeTab === 'byHour' && <ByHourTab />}

            {activeTab === 'extra' && <ExtraFeesTab />}

            {/* Success Dialog */}
            <ConfirmDialog
                isOpen={successDialog.isOpen}
                onClose={() =>
                    setSuccessDialog({ isOpen: false, title: '', message: '' })
                }
                onConfirm={() =>
                    setSuccessDialog({ isOpen: false, title: '', message: '' })
                }
                title={successDialog.title}
                message={successDialog.message}
                type="success"
                confirmText="OK"
                cancelText=""
            />
        </div>
    );
}

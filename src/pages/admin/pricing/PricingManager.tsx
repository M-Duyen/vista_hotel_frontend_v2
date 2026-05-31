import { useEffect, useState, useMemo } from 'react';
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

import type {
    SeasonPrice,
    SeasonalPriceDTO,
} from '../../../types/SeasonPrice';

// Replace large per-tab JSX with component usage — keep logic/state in this file
import BasePricesTab from './components/BasePricesTab';
import SeasonalTab from './components/SeasonalTab';
import ByHourTab from './components/ByHourTab';
import ExtraFeesTab from './components/ExtraFeesTab';
import ConfirmDialog from '../../../components/dialog/ConfirmDialog';

function toIdString(value: unknown): string {
    return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : '';
}

function toLabelString(value: unknown, fallback: string): string {
    return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : fallback;
}

export default function PricingManager() {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editing, setEditing] = useState<RoomType | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

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

    function normalizeSeasonPrice(dto: any): SeasonPrice {
        const source =
            dto?.seasonalPrice && typeof dto.seasonalPrice === 'object'
                ? dto.seasonalPrice
                : dto ?? {};

        const roomTypeIdsSource =
            dto?.roomTypeIds ??
            dto?.roomTypeIDs ??
            dto?.roomTypes ??
            source.roomTypeIds ??
            source.roomTypeIDs ??
            source.roomTypes ??
            [];

        const roomTypes = Array.isArray(roomTypeIdsSource)
            ? roomTypeIdsSource.map(String)
            : roomTypeIdsSource instanceof Set
                ? Array.from(roomTypeIdsSource).map(String)
                : [];

        return {
            id: Number(source.id ?? 0),
            seasonName: String(source.seasonName ?? ''),
            priceMultiplier: Number(source.priceMultiplier ?? 0),
            startDate: String(source.startDate ?? ''),
            endDate: String(source.endDate ?? ''),
            description: String(source.description ?? ''),
            roomTypes,
        };
    }

    const allRoomTypeIds = useMemo(
        () =>
            roomTypes
                .map((rt) =>
                    toIdString(rt.roomTypeID ?? rt.id ?? rt.typeId ?? ''),
                )
                .filter(Boolean),
        [roomTypes],
    );

    function isAllRoomTypesSelected(roomTypeIds: string[]) {
        return (
            allRoomTypeIds.length > 0 &&
            roomTypeIds.length === allRoomTypeIds.length &&
            allRoomTypeIds.every((id) => roomTypeIds.includes(id))
        );
    }

    function resolveSelectedRoomTypeIds() {
        const selected = newSeason.roomTypes ?? [];

        if (selected.includes('ALL')) {
            return [...allRoomTypeIds];
        }

        return selected.filter((id) => id !== 'ALL');
    }

    const sortedRooms = useMemo(
        () => [...roomTypes],
        [roomTypes, editing, loading, saving],
    );

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
                setSelectedId(
                    toIdString(data[0].id ?? data[0].typeId ?? '') || null,
                );
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function loadRoomType(id: string) {
        setLoading(true);
        try {
            const rt = await getRoomTypeById(id);
            const normalized: RoomType = {
                ...(rt as RoomType),
                basePrice: Number((rt as any).basePrice ?? (rt as any).roomPrice ?? 0),
            };
            setEditing(normalized);
        } catch (e) {
            console.error(e);
            setEditing(null);
        } finally {
            setLoading(false);
        }
    }

    async function loadSeasonalPrices() {
        setSeasonLoading(true);
        try {
            const data = await getAllSeasonalPrices_RoomType();
            setSeasonalPrices(data.map((dto: any) => normalizeSeasonPrice(dto)));
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
        if (
            !newSeason.name ||
            !newSeason.startDate ||
            !newSeason.endDate ||
            !newSeason.multiplier
        ) {
            alert('Please fill name, start/end dates and multiplier');
            return;
        }

        const roomTypeIds = resolveSelectedRoomTypeIds();

        if (roomTypeIds.length === 0) {
            alert('Please select at least one room type');
            return;
        }

        const payload: SeasonalPriceDTO = {
            seasonName: newSeason.name,
            priceMultiplier: Number(newSeason.multiplier),
            startDate: newSeason.startDate,
            endDate: newSeason.endDate,
            description: newSeason.description ?? '',
            roomTypeIds,
        };

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
        if (
            !newSeason.name ||
            !newSeason.startDate ||
            !newSeason.endDate ||
            !newSeason.multiplier
        ) {
            alert('Please fill name, start/end dates and multiplier');
            return;
        }

        const roomTypeIds = resolveSelectedRoomTypeIds();

        if (roomTypeIds.length === 0) {
            alert('Please select at least one room type');
            return;
        }

        const payload: SeasonalPriceDTO = {
            id,
            seasonName: newSeason.name,
            priceMultiplier: Number(newSeason.multiplier),
            startDate: newSeason.startDate,
            endDate: newSeason.endDate,
            description: newSeason.description ?? '',
            roomTypeIds,
        };

        try {
            await saveSeasonalPriceWithRoomTypes(payload);
            setNewSeason({ roomTypes: [] });
            await loadSeasonalPrices();
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
            (r) =>
                toIdString(r.roomTypeID ?? r.id ?? r.typeId ?? '') === cur[0],
        );
        const firstLabel = first
            ? toLabelString(first.typeName ?? first.name ?? cur[0], cur[0])
            : cur[0];
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

        if (isAllRoomTypesSelected(ids)) {
            return ['All room types'];
        }

        // Map room type IDs to readable labels
        const labels: string[] = ids.map((rid) => {
            const rt = roomTypes.find(
                (r) => toIdString(r.roomTypeID ?? r.id ?? r.typeId ?? '') === rid,
            );
            const label = rt
                ? toLabelString(rt.typeName ?? rt.name ?? rid, rid)
                : rid;
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
                {arr.slice(0, 3).map((l) => (
                    <span
                        key={String(l)}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                    >
                        {toLabelString(l, String(l))}
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
                                    className={`w-full text-sm py-2 rounded-full ${active
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

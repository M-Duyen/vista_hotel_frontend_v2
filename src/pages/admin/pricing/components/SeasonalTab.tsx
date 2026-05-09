import React, { useState, useMemo, type FC } from 'react';
import type { SeasonPrice } from '@/types/SeasonPrice';
import type { RoomType } from '@/types/RoomType';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/my-card/components/ui/card';
import { Button } from '@/components/my-button/components/ui/button';
import { Input } from '@/components/my-input/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/Table';
import type { JSX } from 'react/jsx-runtime';
import { CiEdit } from 'react-icons/ci';
import Dropdown from '@/components/Dropdown';
import ModernCalendar from '@/components/common/ModernCalendar';
import { Calendar } from 'lucide-react';

type Props = {
    seasonLoading: boolean;
    seasonalPrices: SeasonPrice[];
    newSeason: {
        name?: string;
        multiplier?: number;
        startDate?: string;
        endDate?: string;
        description?: string;
        roomTypes?: string[];
    };
    setNewSeason: (s: {
        name?: string;
        multiplier?: number;
        startDate?: string;
        endDate?: string;
        description?: string;
        roomTypes?: string[];
    }) => void;
    roomTypes: RoomType[];
    roomSelectOpen: boolean;
    setRoomSelectOpen: (v: boolean) => void;
    toggleRoomOption: (id: string) => void;
    roomSelectionLabel: () => string;
    handleAddSeason: () => Promise<void>;
    handleEditSeason?: (id: number) => Promise<void>;
    handleDeleteSeason: (id: number) => Promise<void>;
    getSeasonRoomLabels: (s: SeasonPrice) => string[];
    renderRoomBadges: (labels: unknown[]) => JSX.Element | null;
};

const SeasonalTab: FC<Props> = (props) => {
    const {
        seasonLoading,
        seasonalPrices,
        newSeason,
        setNewSeason,
        roomTypes,
        roomSelectOpen,
        setRoomSelectOpen,
        toggleRoomOption,
        roomSelectionLabel,
        handleAddSeason,
        handleEditSeason,
        getSeasonRoomLabels,
    } = props;

    // local modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSeasonId, setEditingSeasonId] = useState<number | null>(null);
    // calendar states
    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [showFilterStartCalendar, setShowFilterStartCalendar] =
        useState(false);
    const [showFilterEndCalendar, setShowFilterEndCalendar] = useState(false);

    const startCalendarRef = React.useRef<HTMLDivElement>(null);
    const endCalendarRef = React.useRef<HTMLDivElement>(null);
    const filterStartCalendarRef = React.useRef<HTMLDivElement>(null);
    const filterEndCalendarRef = React.useRef<HTMLDivElement>(null);

    // filter states
    const [searchName, setSearchName] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterRoomType, setFilterRoomType] = useState('');

    // Fix: close dropdown when clicking outside within modal
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setRoomSelectOpen(false);
            }
            if (
                startCalendarRef.current &&
                !startCalendarRef.current.contains(event.target as Node)
            ) {
                setShowStartCalendar(false);
            }
            if (
                endCalendarRef.current &&
                !endCalendarRef.current.contains(event.target as Node)
            ) {
                setShowEndCalendar(false);
            }
            if (
                filterStartCalendarRef.current &&
                !filterStartCalendarRef.current.contains(event.target as Node)
            ) {
                setShowFilterStartCalendar(false);
            }
            if (
                filterEndCalendarRef.current &&
                !filterEndCalendarRef.current.contains(event.target as Node)
            ) {
                setShowFilterEndCalendar(false);
            }
        }
        if (
            roomSelectOpen ||
            showStartCalendar ||
            showEndCalendar ||
            showFilterStartCalendar ||
            showFilterEndCalendar
        ) {
            document.addEventListener('mousedown', handleClickOutside);
            return () =>
                document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [
        roomSelectOpen,
        showStartCalendar,
        showEndCalendar,
        showFilterStartCalendar,
        showFilterEndCalendar,
        setRoomSelectOpen,
    ]);

    // Helper: format date for display
    const formatDisplayDate = (dateStr?: string) => {
        if (!dateStr) return 'Select date';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Helper: format date to YYYY-MM-DD
    const formatDateToString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // filtered & sorted seasonal prices
    const filteredSeasonalPrices = useMemo(() => {
        return seasonalPrices.filter((s) => {
            // filter by name
            if (
                searchName &&
                !s.seasonName.toLowerCase().includes(searchName.toLowerCase())
            ) {
                return false;
            }
            // filter by start date
            if (filterStartDate && s.startDate < filterStartDate) {
                return false;
            }
            // filter by end date
            if (filterEndDate && s.endDate > filterEndDate) {
                return false;
            }
            // filter by room type
            if (filterRoomType) {
                if (filterRoomType === 'ALL') {
                    // show rules that apply to all
                    if (s.roomTypes && s.roomTypes.length > 0) return false;
                } else {
                    // show rules that include this specific room type
                    if (!s.roomTypes || !s.roomTypes.includes(filterRoomType))
                        return false;
                }
            }
            return true;
        });
    }, [
        seasonalPrices,
        searchName,
        filterStartDate,
        filterEndDate,
        filterRoomType,
    ]);

    // Open modal for editing
    function openEditModal(season: SeasonPrice) {
        console.log('Opening edit modal for season:', season);
        console.log('  - seasonName:', season.seasonName);
        console.log('  - roomTypes from backend:', season.roomTypes);
        console.log(
            '  - is empty?',
            !season.roomTypes || season.roomTypes.length === 0,
        );
        console.log(
            '  - roomTypes detail:',
            season.roomTypes?.map((id) => {
                const rt = roomTypes.find(
                    (r) =>
                        String(r.roomTypeID ?? r.id ?? r.typeId) === String(id),
                );
                return { id, roomType: rt?.typeName ?? 'NOT FOUND' };
            }),
        );

        setEditingSeasonId(season.id);

        // Determine roomTypes for UI:
        // - If backend roomTypes is empty/null -> user selected "ALL"
        // - Otherwise -> use the specific IDs
        const uiRoomTypes =
            !season.roomTypes || season.roomTypes.length === 0
                ? ['ALL']
                : season.roomTypes;

        console.log('  - UI roomTypes set to:', uiRoomTypes);

        setNewSeason({
            name: season.seasonName,
            multiplier: season.priceMultiplier,
            startDate: season.startDate,
            endDate: season.endDate,
            description: season.description,
            roomTypes: uiRoomTypes,
        });
        setModalOpen(true);
    }

    // Close modal and reset
    function closeModal() {
        setModalOpen(false);
        setEditingSeasonId(null);
        setNewSeason({ roomTypes: [] });
        setRoomSelectOpen(false);
        setShowStartCalendar(false);
        setShowEndCalendar(false);
    }

    // helper used inside modal to submit and close on success
    async function onModalSubmit() {
        try {
            if (editingSeasonId && handleEditSeason) {
                await handleEditSeason(editingSeasonId);
            } else {
                await handleAddSeason();
            }
            closeModal();
        } catch {
            // keep modal open for user to retry / fix
        }
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="m-2 bg-gray-50/50">
                    <div className="flex items-center justify-between mt-3">
                        <div>
                            <CardTitle className="text-xl font-semibold text-gray-900">
                                Seasonal Pricing
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-500 mt-1">
                                Create dynamic pricing rules based on seasons
                                and dates
                            </CardDescription>
                        </div>

                        <Button
                            onClick={() => setModalOpen(true)}
                            className="bg-[--color-primary] hover:bg-[ --color-secondary] text-white shadow-sm"
                        >
                            + Add Rule
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className=" bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    Active Rules
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 mt-1.5">
                                    {filteredSeasonalPrices.length} of{' '}
                                    {seasonalPrices.length}{' '}
                                    {seasonalPrices.length === 1
                                        ? 'rule'
                                        : 'rules'}
                                </CardDescription>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                                <label className="w-full block text-xs font-medium text-gray-700 mb-1.5">
                                    Search by name
                                </label>
                                <Input
                                    placeholder="Search by name..."
                                    value={searchName}
                                    onChange={(e) =>
                                        setSearchName(e.target.value)
                                    }
                                    className="h-10"
                                />
                            </div>
                            <div
                                className="relative"
                                ref={filterStartCalendarRef}
                            >
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Start date from
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFilterStartCalendar(
                                            !showFilterStartCalendar,
                                        );
                                        setShowFilterEndCalendar(false);
                                    }}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex items-center justify-between transition-all text-sm"
                                >
                                    <span className="text-gray-700">
                                        {filterStartDate
                                            ? formatDisplayDate(filterStartDate)
                                            : 'Select date'}
                                    </span>
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                </button>
                                {showFilterStartCalendar && (
                                    <div className="absolute z-[100] mt-2 left-0 drop-shadow-2xl">
                                        <ModernCalendar
                                            selected={
                                                filterStartDate
                                                    ? new Date(filterStartDate)
                                                    : new Date()
                                            }
                                            onSelect={(date) => {
                                                setFilterStartDate(
                                                    formatDateToString(date),
                                                );
                                                setShowFilterStartCalendar(
                                                    false,
                                                );
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div
                                className="relative"
                                ref={filterEndCalendarRef}
                            >
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    End date until
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFilterEndCalendar(
                                            !showFilterEndCalendar,
                                        );
                                        setShowFilterStartCalendar(false);
                                    }}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex items-center justify-between transition-all text-sm"
                                >
                                    <span className="text-gray-700">
                                        {filterEndDate
                                            ? formatDisplayDate(filterEndDate)
                                            : 'Select date'}
                                    </span>
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                </button>
                                {showFilterEndCalendar && (
                                    <div className="absolute z-[100] mt-2 left-0 drop-shadow-2xl">
                                        <ModernCalendar
                                            selected={
                                                filterEndDate
                                                    ? new Date(filterEndDate)
                                                    : filterStartDate
                                                    ? new Date(filterStartDate)
                                                    : new Date()
                                            }
                                            onSelect={(date) => {
                                                setFilterEndDate(
                                                    formatDateToString(date),
                                                );
                                                setShowFilterEndCalendar(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                    Filter by room type
                                </label>
                                <Dropdown
                                    options={[
                                        { value: '', label: 'All room types' },
                                        {
                                            value: 'ALL',
                                            label: 'Applied to all',
                                        },
                                        ...roomTypes.map((rt) => ({
                                            value: String(
                                                rt.roomTypeID ??
                                                    rt.id ??
                                                    rt.typeId ??
                                                    '',
                                            ),
                                            label: rt.typeName ?? '',
                                        })),
                                    ]}
                                    value={filterRoomType}
                                    onChange={(val) => setFilterRoomType(val)}
                                    placeholder="All room types"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {(searchName ||
                            filterStartDate ||
                            filterEndDate ||
                            filterRoomType) && (
                            <button
                                onClick={() => {
                                    setSearchName('');
                                    setFilterStartDate('');
                                    setFilterEndDate('');
                                    setFilterRoomType('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {seasonLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8"></div>
                        </div>
                    ) : filteredSeasonalPrices.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">
                                {seasonalPrices.length === 0
                                    ? 'No seasonal rules yet'
                                    : 'No rules match your filters'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {seasonalPrices.length === 0
                                    ? 'Click "Add Rule" to create your first pricing rule'
                                    : 'Try adjusting your search criteria'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[color:var(--color-secondary)]/25 ">
                                        <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">
                                            Season Name
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-700">
                                            Multiplier
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-700">
                                            Start Date
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-700">
                                            End Date
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">
                                            Applies To
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-700 w-32">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredSeasonalPrices.map((s) => {
                                        const labels = getSeasonRoomLabels(s);
                                        return (
                                            <TableRow
                                                key={s.id}
                                                className="border-b hover:bg-gray-50/50 transition-colors"
                                            >
                                                <TableCell className="py-4 px-6">
                                                    <div>
                                                        <span className="font-semibold text-gray-900 text-[15px]">
                                                            {s.seasonName}
                                                        </span>
                                                        {s.description && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {s.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4 px-6 text-left">
                                                    <span className="inline-flex items-left px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        ×{s.priceMultiplier}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="py-4 px-6 text-left text-gray-700">
                                                    {s.startDate}
                                                </TableCell>

                                                <TableCell className="py-4 px-6 text-left text-gray-700">
                                                    {s.endDate}
                                                </TableCell>

                                                <TableCell className="py-4 px-6">
                                                    {labels.length === 1 &&
                                                    labels[0] ===
                                                        'All room types' ? (
                                                        <span className="inline-flex items-left px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                            All types
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {labels
                                                                .slice(0, 3)
                                                                .map((l, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                                                                    >
                                                                        {String(
                                                                            l,
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            {labels.length >
                                                                3 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-600">
                                                                    +
                                                                    {labels.length -
                                                                        3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                <TableCell className="py-4 px-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                openEditModal(s)
                                                            }
                                                            className="h-8 w-8 p-0 flex items-center bg-white justify-center border-0 shadow-2xs"
                                                            title="Edit"
                                                        >
                                                            <CiEdit className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal: Add/Edit Seasonal Price */}
            {modalOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-6 py-5 border-b bg-gray-50/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-900">
                                            {editingSeasonId ? 'Edit' : 'Add'}{' '}
                                            Seasonal Rule
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1.5">
                                            Configure pricing adjustments for
                                            specific periods
                                        </p>
                                    </div>
                                    <button
                                        className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 duration-200"
                                        onClick={closeModal}
                                    >
                                        <svg
                                            className="w-5 h-5 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Season Name
                                        </label>
                                        <Input
                                            value={newSeason.name ?? ''}
                                            onChange={(e) =>
                                                setNewSeason({
                                                    ...newSeason,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="e.g., Summer 2025"
                                            className="h-12 text-base rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        />
                                    </div>

                                    <div
                                        className="relative"
                                        ref={startCalendarRef}
                                    >
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Start Date
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowStartCalendar(
                                                    !showStartCalendar,
                                                );
                                                setShowEndCalendar(false);
                                            }}
                                            className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex items-center justify-between transition-all shadow-sm"
                                        >
                                            <span className="text-base text-gray-800 font-medium">
                                                {formatDisplayDate(
                                                    newSeason.startDate,
                                                )}
                                            </span>
                                            <Calendar className="w-5 h-5 text-gray-500" />
                                        </button>
                                        {showStartCalendar && (
                                            <div className="absolute z-50 mt-2 left-0">
                                                <ModernCalendar
                                                    selected={
                                                        newSeason.startDate
                                                            ? new Date(
                                                                  newSeason.startDate,
                                                              )
                                                            : new Date()
                                                    }
                                                    onSelect={(date) => {
                                                        setNewSeason({
                                                            ...newSeason,
                                                            startDate:
                                                                formatDateToString(
                                                                    date,
                                                                ),
                                                        });
                                                        setShowStartCalendar(
                                                            false,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        className="relative"
                                        ref={endCalendarRef}
                                    >
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            End Date
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEndCalendar(
                                                    !showEndCalendar,
                                                );
                                                setShowStartCalendar(false);
                                            }}
                                            className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex items-center justify-between transition-all shadow-sm"
                                        >
                                            <span className="text-base text-gray-800 font-medium">
                                                {formatDisplayDate(
                                                    newSeason.endDate,
                                                )}
                                            </span>
                                            <Calendar className="w-5 h-5 text-gray-500" />
                                        </button>
                                        {showEndCalendar && (
                                            <div className="absolute z-50 mt-2 left-0">
                                                <ModernCalendar
                                                    selected={
                                                        newSeason.endDate
                                                            ? new Date(
                                                                  newSeason.endDate,
                                                              )
                                                            : newSeason.startDate
                                                            ? new Date(
                                                                  newSeason.startDate,
                                                              )
                                                            : new Date()
                                                    }
                                                    onSelect={(date) => {
                                                        setNewSeason({
                                                            ...newSeason,
                                                            endDate:
                                                                formatDateToString(
                                                                    date,
                                                                ),
                                                        });
                                                        setShowEndCalendar(
                                                            false,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Price Multiplier
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.05"
                                            min="0.1"
                                            value={newSeason.multiplier ?? ''}
                                            onChange={(e) =>
                                                setNewSeason({
                                                    ...newSeason,
                                                    multiplier: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            placeholder="e.g., 1.25"
                                            className="h-12 text-base rounded-lg border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1.5">
                                            Base prices will be multiplied by
                                            this value
                                        </p>
                                    </div>
                                    <div className="w-full relative">
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Description
                                        </label>

                                        <textarea
                                            rows={4}
                                            value={newSeason.description ?? ''}
                                            onChange={(e) =>
                                                setNewSeason({
                                                    ...newSeason,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Description"
                                            className="w-full text-base rounded-lg border border-gray-300 
                   px-3 py-2 resize-none
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none
                   transition-all"
                                        />
                                    </div>

                                    <div
                                        className="md:col-span-2 relative"
                                        ref={dropdownRef}
                                    >
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Apply to Room Types
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setRoomSelectOpen(
                                                    !roomSelectOpen,
                                                )
                                            }
                                            className="w-full h-12 text-left px-4 border-2 border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 flex items-center justify-between transition-all shadow-sm"
                                        >
                                            <span className="text-base truncate text-gray-800 font-medium">
                                                {roomSelectionLabel()}
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                                    roomSelectOpen
                                                        ? 'rotate-180'
                                                        : ''
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>

                                        {roomSelectOpen && (
                                            <div className="absolute z-50 mt-2 left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="sticky top-0 p-4 border-b-2 border-gray-200 bg-gradient-to-b from-blue-50 to-white">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={(
                                                                newSeason.roomTypes ??
                                                                []
                                                            ).includes('ALL')}
                                                            onChange={() =>
                                                                toggleRoomOption(
                                                                    'ALL',
                                                                )
                                                            }
                                                            className="w-5 h-5 text-blue-600 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                                All Room Types
                                                            </span>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Apply this rule
                                                                to all available
                                                                room types
                                                            </p>
                                                        </div>
                                                        {(
                                                            newSeason.roomTypes ??
                                                            []
                                                        ).includes('ALL') && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </label>
                                                </div>

                                                <div className="p-2 max-h-56 overflow-y-auto">
                                                    {roomTypes.length === 0 ? (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <p className="text-sm">
                                                                No room types
                                                                available
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        roomTypes.map((rt) => {
                                                            const id = String(
                                                                rt.roomTypeID ??
                                                                    rt.id ??
                                                                    rt.typeId ??
                                                                    '',
                                                            );
                                                            const label =
                                                                rt.typeName ??
                                                                rt.name ??
                                                                id;
                                                            const checked = (
                                                                newSeason.roomTypes ??
                                                                []
                                                            ).includes(id);
                                                            // disable individual checkboxes when ALL is selected
                                                            const isDisabled = (
                                                                newSeason.roomTypes ??
                                                                []
                                                            ).includes('ALL');

                                                            return (
                                                                <label
                                                                    key={id}
                                                                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all cursor-pointer group ${
                                                                        isDisabled
                                                                            ? 'opacity-50 cursor-not-allowed'
                                                                            : checked
                                                                            ? 'bg-blue-50 hover:bg-blue-100'
                                                                            : 'hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                checked
                                                                            }
                                                                            disabled={
                                                                                isDisabled
                                                                            }
                                                                            onChange={() =>
                                                                                toggleRoomOption(
                                                                                    id,
                                                                                )
                                                                            }
                                                                            className={`w-5 h-5 text-blue-600 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                                                                                isDisabled
                                                                                    ? 'cursor-not-allowed'
                                                                                    : 'cursor-pointer'
                                                                            }`}
                                                                        />
                                                                        <span
                                                                            className={`text-sm font-medium ${
                                                                                checked &&
                                                                                !isDisabled
                                                                                    ? 'text-blue-700'
                                                                                    : 'text-gray-700'
                                                                            } group-hover:text-gray-900`}
                                                                        >
                                                                            {String(
                                                                                label,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    {checked &&
                                                                        !isDisabled && (
                                                                            <svg
                                                                                className="w-5 h-5 text-blue-600"
                                                                                fill="currentColor"
                                                                                viewBox="0 0 20 20"
                                                                            >
                                                                                <path
                                                                                    fillRule="evenodd"
                                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                    clipRule="evenodd"
                                                                                />
                                                                            </svg>
                                                                        )}
                                                                </label>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                <div className="sticky bottom-0 p-3 bg-gray-50 border-t text-xs text-gray-600 text-center">
                                                    {(
                                                        newSeason.roomTypes ??
                                                        []
                                                    ).includes('ALL')
                                                        ? 'All room types are selected'
                                                        : `${
                                                              (
                                                                  newSeason.roomTypes ??
                                                                  []
                                                              ).length
                                                          } room type(s) selected`}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-5 border-t bg-white flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Note:</span>{' '}
                                    All fields are required
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={closeModal}
                                        className="border-gray-300 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={onModalSubmit}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                                    >
                                        {editingSeasonId ? 'Update' : 'Create'}{' '}
                                        Rule
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SeasonalTab;

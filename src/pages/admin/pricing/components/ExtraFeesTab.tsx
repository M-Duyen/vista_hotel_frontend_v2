/*eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/my-card/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/Table';
import { Button } from '@/components/my-button/components/ui/button';
import { Input } from '@/components/my-input/components/ui/input';
import {
    getAllRules,
    saveRule,
} from '@/services/CheckInCheckOutPolicyRuleService';
import type {
    CheckInCheckOutPolicyRule,
    RuleType,
} from '@/types/CheckInCheckOutPolicyRule';
import { CiEdit } from 'react-icons/ci';
import { FiPlus, FiFilter } from 'react-icons/fi';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';

export default function ExtraFeesTab() {
    const [rules, setRules] = useState<CheckInCheckOutPolicyRule[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRule, setEditingRule] =
        useState<CheckInCheckOutPolicyRule | null>(null);
    const [formData, setFormData] = useState<
        Partial<CheckInCheckOutPolicyRule>
    >({});

    // filter state
    const [filterType, setFilterType] = useState<RuleType | ''>('');
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

    // notification dialog
    const [notify, setNotify] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'danger' | 'warning' | 'info' | 'success';
        confirmText?: string;
        cancelText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'OK',
        cancelText: '',
    });

    useEffect(() => {
        loadRules();
    }, []);

    async function loadRules() {
        setLoading(true);
        try {
            const data = await getAllRules();
            console.log('Loaded check-in/out rules:', data);
            setRules(data || []);
        } catch (err) {
            console.error('Failed to load rules:', err);
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingRule(null);
        setFormData({
            type: 'EARLY_CHECKIN',
            startTime: '',
            endTime: '',
            surchargePercentage: 0,
            isDayCharge: false,
            freeForMinRankLevel: undefined,
        });
        setModalOpen(true);
    }

    function openEditModal(rule: CheckInCheckOutPolicyRule) {
        setEditingRule(rule);
        setFormData({ ...rule });
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingRule(null);
        setFormData({});
    }

    async function handleSubmit() {
        if (!formData.type || !formData.startTime || !formData.endTime) {
            alert(
                'Please fill all required fields (type, start time, end time)',
            );
            return;
        }

        const payload: Partial<CheckInCheckOutPolicyRule> = {
            ...formData,
            id: editingRule?.id,
        };

        console.log('Submitting rule:', payload);

        try {
            await saveRule(payload);
            closeModal();
            await loadRules();
            setNotify({
                isOpen: true,
                title: 'Saved',
                message: `Rule "${formData.type}" saved successfully.`,
                type: 'success',
                confirmText: 'OK',
                cancelText: '',
            });
        } catch (err: any) {
            console.error('Error saving rule:', err);
            const serverMsg =
                err?.response?.data?.message ?? err?.message ?? 'Unknown error';
            setNotify({
                isOpen: true,
                title: 'Save failed',
                message: String(serverMsg),
                type: 'danger',
                confirmText: 'OK',
                cancelText: '',
            });
        }
    }

    // filtered rules
    const filteredRules = filterType
        ? rules.filter((r) => r.type === filterType)
        : rules;

    // format time
    const fmtTime = (t?: string) => (t ? t.slice(0, 5) : '—');

    // Helper to map rank level number to name
    function getRankLevelName(level?: number): string {
        if (level == null) return '—';
        const rankMap: Record<number, string> = {
            1: 'Silver',
            2: 'Gold',
            3: 'Platinum',
            4: 'Diamond',
        };
        return rankMap[level] ?? `Level ${level}`;
    }

    // Helper to get filter label
    function getFilterLabel() {
        if (!filterType) return 'All Types';
        if (filterType === 'EARLY_CHECKIN') return 'Early Check-in';
        if (filterType === 'LATE_CHECKOUT') return 'Late Check-out';
        return 'All Types';
    }

    // Close dropdown when clicking outside
    const filterDropdownRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(event.target as Node)
            ) {
                setFilterDropdownOpen(false);
            }
        }
        if (filterDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () =>
                document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [filterDropdownOpen]);

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="shadow-sm border-0">
                <CardHeader className="px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    Check-in / Check-out Policy Rules
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 mt-1">
                                    Manage surcharges for early check-in and
                                    late check-out
                                </CardDescription>
                            </div>
                        </div>

                        <Button
                            onClick={openAddModal}
                            className="bg-[--color-primary] hover:bg-[--color-secondary] text-white shadow-sm flex items-center gap-2"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add Rule
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Main Content Card */}
            <Card className="shadow-sm border-0">
                <CardHeader className="bg-gray-50/50 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-medium text-gray-900">
                                Policy Rules
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 mt-1">
                                {filteredRules.length} of {rules.length}{' '}
                                {rules.length === 1 ? 'rule' : 'rules'}
                            </CardDescription>
                        </div>

                        {/* Filter */}
                        <div className="w-full sm:w-auto">
                            <div
                                className="relative sm:w-56"
                                ref={filterDropdownRef}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFilterDropdownOpen(
                                            !filterDropdownOpen,
                                        )
                                    }
                                    className="w-full bg-white rounded-lg px-4 py-2.5 flex items-center justify-between gap-2 transition-all duration-200 border border-gray-300 hover:border-[#6b5e4c] focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent outline-none cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <FiFilter className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700 font-medium truncate text-sm">
                                            {getFilterLabel()}
                                        </span>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                                            filterDropdownOpen
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {filterDropdownOpen && (
                                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="py-1">
                                            {/*
                                             * Refactor options into a separate array
                                             * for easier mapping and maintenance
                                             */}
                                            {(
                                                [
                                                    {
                                                        value: '',
                                                        label: 'All Types',
                                                    },
                                                    {
                                                        value: 'EARLY_CHECKIN',
                                                        label: 'Early Check-in',
                                                    },
                                                    {
                                                        value: 'LATE_CHECKOUT',
                                                        label: 'Late Check-out',
                                                    },
                                                ] as const
                                            ).map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setFilterType(
                                                            option.value as
                                                                | RuleType
                                                                | '',
                                                        );
                                                        setFilterDropdownOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                                        filterType ===
                                                        option.value
                                                            ? 'bg-[#6b5e4c] text-white font-medium'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                        </div>
                    ) : filteredRules.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-base text-gray-600 font-medium">
                                {rules.length === 0
                                    ? 'No rules yet'
                                    : 'No rules match your filter'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {rules.length === 0
                                    ? 'Click "Add Rule" to create your first policy rule'
                                    : 'Try adjusting your filter'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[color:var(--color-secondary)]/25 ">
                                        <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">
                                            Type
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">
                                            Time Range
                                        </TableHead>
                                        <TableHead className="flex justify-center py-4 px-6 text-center text-sm font-semibold text-gray-700">
                                            Surcharge
                                        </TableHead>
                                        <TableHead className=" py-4 px-6 text-center text-sm font-semibold text-gray-700">
                                            Day Charge
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-700">
                                            Free Rank
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-700 w-24">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredRules.map((rule) => (
                                        <TableRow
                                            key={rule.id}
                                            className=" hover:bg-gray-50/50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                                            rule.type ===
                                                            'EARLY_CHECKIN'
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                                                        }`}
                                                    >
                                                        {rule.type ===
                                                        'EARLY_CHECKIN'
                                                            ? 'Early Check-in'
                                                            : 'Late Check-out'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <span className="font-medium">
                                                        {fmtTime(
                                                            rule.startTime,
                                                        )}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        →
                                                    </span>
                                                    <span className="font-medium">
                                                        {fmtTime(rule.endTime)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 ">
                                                    {rule.surchargePercentage ??
                                                        0}
                                                    %
                                                </span>
                                            </TableCell>

                                            <TableCell className="py-4 px-6 text-left ">
                                                {rule.isDayCharge ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700">
                                                        Full Day
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="py-4 px-6 text-left">
                                                {rule.freeForMinRankLevel !=
                                                null ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                                        {getRankLevelName(
                                                            rule.freeForMinRankLevel,
                                                        )}
                                                        +
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center justify-center">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditModal(rule)
                                                        }
                                                        className="h-8 w-8 p-0 flex items-center justify-center bg-white shadow-sm"
                                                        title="Edit"
                                                    >
                                                        <CiEdit className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal: Add/Edit Rule */}
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
                        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-6 py-5 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {editingRule ? 'Edit' : 'Add'}{' '}
                                                Policy Rule
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Configure surcharge details
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 hover:bg-gray-100 rounded-full transition-all"
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

                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                {/* Rule Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Rule Type *
                                    </label>
                                    <select
                                        value={formData.type ?? ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                type: e.target
                                                    .value as RuleType,
                                            })
                                        }
                                        className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="">Select type</option>
                                        <option value="EARLY_CHECKIN">
                                            Early Check-in
                                        </option>
                                        <option value="LATE_CHECKOUT">
                                            Late Check-out
                                        </option>
                                    </select>
                                </div>

                                {/* Time Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            Start Time *
                                        </label>
                                        <Input
                                            type="time"
                                            value={formData.startTime ?? ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    startTime: e.target.value,
                                                })
                                            }
                                            className="h-11"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                                            End Time *
                                        </label>
                                        <Input
                                            type="time"
                                            value={formData.endTime ?? ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    endTime: e.target.value,
                                                })
                                            }
                                            className="h-11"
                                        />
                                    </div>
                                </div>

                                {/* Surcharge Percentage */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Surcharge (%)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={
                                            formData.surchargePercentage ?? 0
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                surchargePercentage: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        placeholder="e.g., 50"
                                        className="h-11"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Percentage of nightly rate charged as
                                        surcharge
                                    </p>
                                </div>

                                {/* Is Day Charge */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDayCharge ?? false}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                isDayCharge: e.target.checked,
                                            })
                                        }
                                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                    />
                                    <div>
                                        <label className="text-sm font-semibold text-gray-800">
                                            Charge as Full Day (100%)
                                        </label>
                                        <p className="text-xs text-gray-500">
                                            If checked, charge equals one full
                                            night rate
                                        </p>
                                    </div>
                                </div>

                                {/* Free for Min Rank Level */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Free for Member Rank (optional)
                                    </label>
                                    <select
                                        value={
                                            formData.freeForMinRankLevel ?? ''
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                freeForMinRankLevel: e.target
                                                    .value
                                                    ? Number(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="">No exemption</option>
                                        <option value="1">Silver+</option>
                                        <option value="2">Gold+</option>
                                        <option value="3">Platinum+</option>
                                        <option value="4">Diamond+</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Members with this rank or higher are
                                        exempt from this surcharge
                                    </p>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={closeModal}
                                    className="border-gray-300"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {editingRule ? 'Update' : 'Create'} Rule
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Notification Dialog */}
            <ConfirmDialog
                isOpen={notify.isOpen}
                onClose={() =>
                    setNotify((s) => ({
                        ...s,
                        isOpen: false,
                        title: '',
                        message: '',
                    }))
                }
                onConfirm={() =>
                    setNotify((s) => ({
                        ...s,
                        isOpen: false,
                        title: '',
                        message: '',
                    }))
                }
                title={notify.title}
                message={notify.message}
                type={notify.type}
                confirmText={notify.confirmText}
                cancelText={notify.cancelText}
            />
        </div>
    );
}

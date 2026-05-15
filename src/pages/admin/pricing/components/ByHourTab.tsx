/*eslint-disable*/
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
    getAllPolicyBaseRates,
    saveHourlyRatePolicy,
} from '@/services/hourlyRatePolicyService';
import { CiEdit } from 'react-icons/ci';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import type { HourlyRatePolicy, BaseRateItem } from '@/types/HourlyRatePolicy';
import ConfirmDialog from '@/components/dialog/ConfirmDialog';

export default function ByHourTab() {
    // notification dialog state
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

    const [policies, setPolicies] = useState<HourlyRatePolicy[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<HourlyRatePolicy | null>(
        null,
    );
    const [formData, setFormData] = useState<Partial<HourlyRatePolicy>>({
        baseRates: [],
        weekendDays: [],
    });

    // Fetch data on mount
    useEffect(() => {
        loadPolicies();
    }, []);

    // helper: normalize baseRates to BaseRateItem[]
    function normalizeBaseRates(policy: HourlyRatePolicy) {
        if (!policy) return [];
        const br = policy.baseRates;
        // already array of items
        if (Array.isArray(br)) return br;
        // map/object form: { "1": 150000, "2": 250000 }
        if (br && typeof br === 'object') {
            return Object.entries(br).map(([k, v]) => ({
                baseHours: Number(k),
                baseRate: Number(v),
            }));
        }
        // single object form { baseHours: 1, baseRate: 150000 }
        if (br && typeof br === 'number') {
            // unlikely numeric alone, return empty
            return [];
        }
        if (br && typeof br === 'object') return [br];
        return [];
    }

    async function loadPolicies() {
        setLoading(true);
        try {
            const data = await getAllPolicyBaseRates();
            console.log('Loaded policies:', data);

            // Normalize data: ensure baseRates is always an array of items and weekendDays array
            const normalized = (data || []).map((policy: HourlyRatePolicy) => ({
                ...policy,
                baseRates: normalizeBaseRates(policy),
                weekendDays: Array.isArray(policy.weekendDays)
                    ? policy.weekendDays.map((d: string) =>
                        String(d).toUpperCase(),
                    )
                    : policy.weekendDays
                        ? [String(policy.weekendDays).toUpperCase()]
                        : [],
            }));

            console.log('Normalized policies:', normalized);
            setPolicies(normalized);
        } catch (err) {
            console.error('Failed to load hourly rate policies:', err);
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingPolicy(null);
        setFormData({
            policyName: '',
            weekendSurcharge: 0,
            weekendDays: [],
            baseRates: [{ baseHours: 1, baseRate: 0 }],
        });
        setModalOpen(true);
    }

    function openEditModal(policy: HourlyRatePolicy) {
        setEditingPolicy(policy);
        setFormData({
            ...policy,
            // ensure formData.baseRates is an array of items for editing
            baseRates: normalizeBaseRates(policy).length
                ? normalizeBaseRates(policy)
                : [{ baseHours: 1, baseRate: 0 }],
            weekendDays: policy.weekendDays || [],
        });
        setModalOpen(true);
    }

    // Open edit modal for a specific policy and hour.
    function openEditModalForHour(policy: HourlyRatePolicy, hour: number) {
        const items = normalizeBaseRates(policy);
        // ensure there is an entry for this hour
        if (!items.some((r) => Number(r.baseHours) === hour)) {
            items.push({ baseHours: hour, baseRate: 0 });
            // sort by baseHours for nicer UI
            items.sort((a, b) => Number(a.baseHours) - Number(b.baseHours));
        }

        setEditingPolicy(policy);
        setFormData({
            ...policy,
            baseRates: items,
            weekendDays: policy.weekendDays || [],
        });
        setModalOpen(true);
    }

    // Add Hourly Pricing (start with empty policy and one baseRate row)
    function openAddHourlyPricing() {
        setEditingPolicy(null);
        setFormData({
            policyName: '',
            weekendSurcharge: 0,
            weekendDays: [],
            baseRates: [{ baseHours: 1, baseRate: 0 }],
        });
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingPolicy(null);
        setFormData({ baseRates: [], weekendDays: [] });
    }

    function addBaseRateRow() {
        setFormData((prev) => {
            const existing = Array.isArray(prev.baseRates)
                ? prev.baseRates
                : normalizeBaseRates({ baseRates: prev.baseRates });
            return {
                ...prev,
                baseRates: [...existing, { baseHours: 1, baseRate: 0 }],
            };
        });
    }

    // Remove a base rate row
    function removeBaseRateRow(index: number) {
        setFormData((prev) => {
            const existing = Array.isArray(prev.baseRates)
                ? prev.baseRates
                : normalizeBaseRates({ baseRates: prev.baseRates });
            return {
                ...prev,
                baseRates: existing.filter((_, i) => i !== index),
            };
        });
    }

    // Update a base rate row
    function updateBaseRateRow(
        index: number,
        field: 'baseHours' | 'baseRate',
        value: number,
    ) {
        setFormData((prev) => ({
            ...prev,
            baseRates: (Array.isArray(prev.baseRates) ? prev.baseRates : []).map(
                (row: BaseRateItem, i: number) =>
                    i === index ? { ...row, [field]: value } : row,
            ),
        }));
    }

    // Toggle weekend day
    function toggleWeekendDay(day: string) {
        setFormData((prev) => {
            const days = prev.weekendDays || [];
            if (days.includes(day)) {
                return { ...prev, weekendDays: days.filter((d) => d !== day) };
            } else {
                return { ...prev, weekendDays: [...days, day] };
            }
        });
    }

    async function handleSubmit() {
        if (
            !formData.policyName ||
            !formData.baseRates ||
            formData.baseRates.length === 0
        ) {
            alert('Please fill policy name and at least one base rate');
            return;
        }

        // normalize to array first (UI uses array)
        const baseRatesArray = Array.isArray(formData.baseRates)
            ? formData.baseRates
            : normalizeBaseRates({ baseRates: formData.baseRates });

        // convert array -> map as backend requires:
        const baseRatesMap: Record<string, number> = {};
        (baseRatesArray || []).forEach((r) => {
            if (r && r.baseHours != null) {
                baseRatesMap[String(r.baseHours)] = Number(r.baseRate ?? 0);
            }
        });

        // build final payload with baseRates as map
        const payload = {
            ...formData,
            baseRates: baseRatesMap,
            id: editingPolicy?.id,
        };

        console.log('Submitting hourly policy payload (map):', payload);

        try {
            await saveHourlyRatePolicy(payload);
            closeModal();
            await loadPolicies();
            setNotify({
                isOpen: true,
                title: 'Saved',
                message: `Policy "${formData.policyName}" saved successfully.`,
                type: 'success',
                confirmText: 'OK',
                cancelText: '',
            });
        } catch (err: any) {
            console.error('Error saving policy', err);
            // show server-provided message if available
            const serverMsg =
                err?.response?.data?.message ??
                err?.response?.data ??
                err?.message ??
                'Unknown error';
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

    // Format currency
    const fmt = (v?: number) =>
        typeof v === 'number'
            ? v.toLocaleString('vi-VN', { maximumFractionDigits: 0 })
            : '—';

    // Day options: value = backend enum (UPPERCASE), label = short UI label
    const WEEK_DAYS = [
        { value: 'MONDAY', label: 'Mon' },
        { value: 'TUESDAY', label: 'Tue' },
        { value: 'WEDNESDAY', label: 'Wed' },
        { value: 'THURSDAY', label: 'Thu' },
        { value: 'FRIDAY', label: 'Fri' },
        { value: 'SATURDAY', label: 'Sat' },
        { value: 'SUNDAY', label: 'Sun' },
    ];

    function getDayLabel(code?: string) {
        if (!code) return '-';
        const found = WEEK_DAYS.find(
            (d) => d.value === String(code).toUpperCase(),
        );
        return found ? found.label : String(code).slice(0, 3);
    }

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="shadow-sm border-0 ">
                <CardHeader className=" px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    Hourly Rate Policies
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 mt-1">
                                    Configure pricing for hourly room rentals
                                </CardDescription>
                            </div>
                        </div>

                        <Button
                            onClick={openAddModal}
                            className="bg-[--color-primary] hover:bg-[ --color-secondary] text-white shadow-sm flex items-center gap-2"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add Policy
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Main Content Card */}
            <Card className="shadow-sm border-0 ">
                <CardHeader className=" bg-gray-50/50 px-6 py-4 rounded-t-2xl">
                    <CardTitle className="text-lg font-medium text-gray-900">
                        Policy List
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1">
                        {policies.length}{' '}
                        {policies.length === 1 ? 'policy' : 'policies'}{' '}
                        configured
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : policies.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-base text-gray-600 font-medium">
                                No policies yet
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Click "Add Policy" to create your first hourly
                                rate policy
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-[color:var(--color-secondary)]/25 ">
                                        <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">
                                            Policy Name
                                        </TableHead>
                                        <TableHead className="py-4 px-6 flex justify-center text-center text-sm font-semibold text-gray-700">
                                            Weekend Surcharge
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-sm font-semibold text-gray-700">
                                            Weekend Days
                                        </TableHead>
                                        <TableHead className="py-4 px-6 text-center text-sm font-semibold text-gray-700 w-24">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {policies.map((policy) => (
                                        <TableRow
                                            key={policy.id}
                                            className=" border-b hover:bg-gray-50/50 transition-colors"
                                        >
                                            <TableCell className="py-4 px-6">
                                                <span className="font-semibold text-gray-900 text-[15px]">
                                                    {policy.policyName || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                                    +
                                                    {policy.weekendSurcharge ||
                                                        0}
                                                    %
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(
                                                        policy.weekendDays,
                                                    )
                                                        ? policy.weekendDays
                                                        : []
                                                    ).map((day, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                                                        >
                                                            {getDayLabel(
                                                                String(day),
                                                            )}
                                                        </span>
                                                    ))}
                                                    {(!policy.weekendDays ||
                                                        (Array.isArray(
                                                            policy.weekendDays,
                                                        ) &&
                                                            policy.weekendDays
                                                                .length ===
                                                            0)) && (
                                                            <span className="text-gray-400 text-sm">
                                                                —
                                                            </span>
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center justify-center">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditModal(
                                                                policy,
                                                            )
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

            {/* Hourly Pricing Table (English) */}
            <Card className="shadow-sm border-0">
                <CardHeader className="bg-white px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                Hourly Pricing Table
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 mt-1">
                                Prices are expressed as percentage of the
                                nightly rate.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[color:var(--color-secondary)]/25 border-b">
                                    <th className="py-3 px-4 text-sm font-medium text-gray-700">
                                        Hours
                                    </th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-700 text-center">
                                        Percent (%)
                                    </th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-700">
                                        Notes
                                    </th>
                                    <th className="py-3 px-4 text-sm font-medium text-gray-700 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 9 }, (_, i) => i + 1).map(
                                    (h) => {
                                        // find policies that have a baseRate for this hour using normalized baseRates
                                        const matches = policies.filter((p) =>
                                            normalizeBaseRates(p).some(
                                                (r) =>
                                                    Number(r.baseHours) === h,
                                            ),
                                        );

                                        return (
                                            <tr
                                                key={h}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-4 px-4 text-sm text-gray-800">
                                                    {h}
                                                    {h === 9 ? '+' : ''} hour
                                                    {h > 1 ? 's' : ''}
                                                </td>

                                                {/* show per-policy rate for this hour (fallback '-' when none) */}
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {matches.length > 0 ? (
                                                        <div className="flex flex-col gap-1 items-center">
                                                            {matches.map(
                                                                (mp) => {
                                                                    const rateObj =
                                                                        normalizeBaseRates(
                                                                            mp,
                                                                        ).find(
                                                                            (
                                                                                r,
                                                                            ) =>
                                                                                Number(
                                                                                    r.baseHours,
                                                                                ) ===
                                                                                h,
                                                                        );
                                                                    return (
                                                                        <div
                                                                            key={`${mp.id}-${h}`}
                                                                            className="text-sm text-gray-800 gap-3"
                                                                        >
                                                                            <span className="text-gray-600 flex justify-center">
                                                                                {rateObj
                                                                                    ? `${fmt(
                                                                                        rateObj.baseRate,
                                                                                    )}`
                                                                                    : '—'}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {h === 9
                                                        ? 'Equivalent to overnight stay'
                                                        : '-'}
                                                </td>

                                                {/* Actions: edit each matching policy's hour entry */}
                                                <td className="py-4 px-4 text-sm text-gray-600 text-center">
                                                    {matches.length > 0 ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            {matches.map(
                                                                (mp) => (
                                                                    <Button
                                                                        key={`act-${mp.id}-${h}`}
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            openEditModalForHour(
                                                                                mp,
                                                                                h,
                                                                            )
                                                                        }
                                                                        className="h-8 px-3 text-xs bg-white"
                                                                        title={`Edit ${mp.policyName ??
                                                                            'Policy'
                                                                            } - ${h}h`}
                                                                    >
                                                                        <CiEdit className="w-4 h-4" />
                                                                    </Button>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                openAddHourlyPricing()
                                                            }
                                                            className="h-8 px-3 text-xs"
                                                            title="Add pricing"
                                                        >
                                                            Add
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    },
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal: Add/Edit Policy */}
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
                        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-6 py-5 border-b ">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {editingPolicy ? 'Edit' : 'Add'}{' '}
                                                Hourly Policy
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-0.5">
                                                Configure hourly rate details
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
                                {/* Policy Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Policy Name *
                                    </label>
                                    <Input
                                        value={formData.policyName ?? ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                policyName: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Standard Hourly Rate"
                                        className="h-11"
                                    />
                                </div>

                                {/* Base Rates */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-semibold text-gray-800">
                                            Base Rates *
                                        </label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={addBaseRateRow}
                                            className="h-8 text-xs flex items-center gap-1"
                                        >
                                            <FiPlus className="w-3 h-3" /> Add
                                            Rate
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {(Array.isArray(formData.baseRates)
                                            ? formData.baseRates
                                            : []
                                        ).map((rate: BaseRateItem, idx: number) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex-1">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            rate.baseHours
                                                        }
                                                        onChange={(e) =>
                                                            updateBaseRateRow(
                                                                idx,
                                                                'baseHours',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="Hours"
                                                        className="h-10"
                                                    />
                                                </div>
                                                <span className="text-gray-400">
                                                    →
                                                </span>
                                                <div className="flex-1">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            rate.baseRate
                                                        }
                                                        onChange={(e) =>
                                                            updateBaseRateRow(
                                                                idx,
                                                                'baseRate',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        placeholder="Rate (VND)"
                                                        className="h-10"
                                                    />
                                                </div>
                                                {(formData.baseRates || [])
                                                    .length > 1 && (
                                                        <button
                                                            onClick={() =>
                                                                removeBaseRateRow(
                                                                    idx,
                                                                )
                                                            }
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                            </div>
                                        ),
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Set different rates for different hour
                                        durations
                                    </p>
                                </div>

                                {/* Weekend Surcharge */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                        Weekend Surcharge (%)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.weekendSurcharge ?? 0}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                weekendSurcharge: Number(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                        placeholder="e.g., 20"
                                        className="h-11 "
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Additional percentage charged on weekend
                                        days
                                    </p>
                                </div>

                                {/* Weekend Days */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3 ">
                                        Weekend Days
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {WEEK_DAYS.map((d) => {
                                            const isSelected = (
                                                formData.weekendDays || []
                                            ).includes(d.value);
                                            return (
                                                <button
                                                    key={d.value}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleWeekendDay(
                                                            d.value,
                                                        )
                                                    }
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isSelected
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {d.label}
                                                </button>
                                            );
                                        })}
                                    </div>
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
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {editingPolicy ? 'Update' : 'Create'} Policy
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Notification dialog */}
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
                type={notify.type as any}
                confirmText={notify.confirmText}
                cancelText={notify.cancelText}
            />
        </div>
    );
}

/* eslint-disable */
import { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import {
    getAllLateCheckouts,
    approveLateCheckout,
} from '../../services/lateCheckoutService';
import type { LateCheckoutResponse } from '../../types/LateCheckout';

type LateCheckoutTabProps = {
    onViewDetails: (req: LateCheckoutResponse | any) => void;
    onRefresh?: () => void;
};

const LateCheckoutTab = ({ onViewDetails, onRefresh }: LateCheckoutTabProps) => {
    const [requests, setRequests] = useState<LateCheckoutResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getAllLateCheckouts();
                setRequests(res);
            } catch (e) {
                setError('Unable to load late check-out requests');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleApprove = async (
        id: string,
        status: 'APPROVED' | 'REJECTED',
    ) => {
        setProcessingId(id);
        try {
            const request = requests.find((req) => req.requestID === id);

            if (!request) {
                console.error('Request not found:', id);
                return;
            }

            await approveLateCheckout(id, status, 'Staff');

            setRequests((prev) =>
                prev.map((req) =>
                    req.requestID === id
                        ? { ...req, approvalStatus: status }
                        : req,
                ),
            );
            onRefresh?.();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (value: number) =>
        `${(value || 0).toLocaleString('vi-VN')} VND`;

    const formatTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'N/A';

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getGuestName = (req: LateCheckoutResponse) =>
        req.booking?.customer?.fullName ||
        req.booking?.customer?.username ||
        'N/A';

    const getGuestEmail = (req: LateCheckoutResponse) =>
        req.booking?.customer?.email || 'No email';

    const getRoomLabel = (req: LateCheckoutResponse) => {
        const details = req.booking?.bookingDetails || [];
        if (!details.length) return 'N/A - N/A';

        return details
            .map((detail) => {
                const hydratedDetail = detail as any;
                const roomNumber =
                    hydratedDetail.room?.roomNumber ||
                    hydratedDetail.roomNumber ||
                    'N/A';
                const roomType =
                    hydratedDetail.room?.roomType?.typeName ||
                    hydratedDetail.room?.roomType?.name ||
                    'N/A';
                return `${roomNumber} - ${roomType}`;
            })
            .join(', ');
    };

    const getRegularCheckoutTime = (req: LateCheckoutResponse) => {
        if (!req.booking?.checkOutDate) return '12:00';

        const checkout = new Date(req.booking.checkOutDate);
        if (Number.isNaN(checkout.getTime())) return '12:00';

        const hasExplicitTime =
            checkout.getHours() !== 0 || checkout.getMinutes() !== 0;
        return hasExplicitTime ? formatTime(req.booking.checkOutDate) : '12:00';
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        Pending
                    </span>
                );
            case 'APPROVED':
                return (
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Approved
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {status}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-center text-sm text-gray-500">
                Loading late check-out requests...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-sm text-red-600">{error}</div>
        );
    }

    if (!requests.length) {
        return (
            <div className="p-6 text-center text-sm text-gray-500">
                No late check-out requests.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead>
                    <tr className="bg-[#EBE3D7]/30 text-left">
                        <th className="py-4 px-4 font-semibold">Request ID</th>
                        <th className="py-4 px-4 font-semibold">Guest</th>
                        <th className="py-4 px-4 font-semibold">Room</th>
                        <th className="py-4 px-4 font-semibold">
                            Regular Checkout
                        </th>
                        <th className="py-4 px-4 font-semibold">
                            Requested Time
                        </th>
                        <th className="py-4 px-4 font-semibold">Fee</th>
                        <th className="py-4 px-4 font-semibold">Status</th>
                        <th className="py-4 px-4 font-semibold">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {requests.map((req) => (
                        <tr
                            key={req.requestID}
                            className="border-b border-[#EBE3D7]/50 hover:bg-[#EBE3D7]/10"
                        >
                            <td className="py-4 px-4">{req.requestID}</td>

                            <td className="py-4 px-4">
                                <div>
                                    <p className="font-medium">
                                        {getGuestName(req)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {getGuestEmail(req)}
                                    </p>
                                </div>
                            </td>

                            <td className="py-4 px-4">{getRoomLabel(req)}</td>

                            <td className="py-4 px-4">
                                {getRegularCheckoutTime(req)}
                            </td>

                            <td className="py-4 px-4">
                                {formatTime(req.requestTime)}
                            </td>

                            <td className="py-4 px-4">
                                {formatCurrency(req.additionalFee)}
                            </td>

                            <td className="py-4 px-4">
                                {renderStatusBadge(req.approvalStatus)}
                            </td>

                            <td className="py-4 px-4">
                                <div className="flex gap-2 items-center">
                                    {req.approvalStatus === 'PENDING' && (
                                        <>
                                            <button
                                                disabled={
                                                    processingId ===
                                                    req.requestID
                                                }
                                                onClick={() =>
                                                    handleApprove(
                                                        req.requestID,
                                                        'APPROVED',
                                                    )
                                                }
                                                className="p-2.5 rounded-full bg-[#F5F0EB] hover:bg-green-100 text-green-600"
                                                title="Approve"
                                            >
                                                <FaCheck size={14} />
                                            </button>

                                            <button
                                                disabled={
                                                    processingId ===
                                                    req.requestID
                                                }
                                                onClick={() =>
                                                    handleApprove(
                                                        req.requestID,
                                                        'REJECTED',
                                                    )
                                                }
                                                className="p-2.5 rounded-full bg-[#F5F0EB] hover:bg-red-100 text-red-600"
                                                title="Reject"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() =>
                                            onViewDetails(req.booking || req)
                                        }
                                        className="p-2.5 rounded-full bg-[#F5F0EB] hover:bg-[#b9ad96] hover:text-white text-gray-600"
                                        title="View Details"
                                    >
                                        <FaEye size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LateCheckoutTab;

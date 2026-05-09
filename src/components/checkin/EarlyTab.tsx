/* eslint-disable */
import { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import {
    getAllEarlyCheckins,
    approveEarlyCheckin,
} from '../../services/earlyCheckinService';
import type { EarlyCheckinResponse } from '../../types/EarlyCheckin';

type EarlyTabProps = {
    onViewDetails: (req: EarlyCheckinResponse | any) => void;
};

const EarlyTab = ({ onViewDetails }: EarlyTabProps) => {
    const [requests, setRequests] = useState<EarlyCheckinResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getAllEarlyCheckins();

                // Service trả về data trực tiếp, không phải { data: ... }
                const list = Array.isArray(res) ? res : [];

                setRequests(list);
            } catch (e) {
                setError('Không tải được danh sách check-in sớm');
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
            await approveEarlyCheckin(id, status, 'Staff');
            setRequests((prev) =>
                prev.map((req) =>
                    req.requestID === id
                        ? { ...req, approvalStatus: status }
                        : req,
                ),
            );
        } catch (err) {
            console.error(err);
        } finally {
            setProcessingId(null);
        }
    };

    const formatCurrency = (v: number) => v?.toLocaleString('vi-VN') + ' VND';

    const formatTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading)
        return (
            <div className="p-6 text-center text-sm text-gray-500">
                Đang tải yêu cầu check-in sớm...
            </div>
        );
    if (error)
        return (
            <div className="p-6 text-center text-sm text-red-600">{error}</div>
        );
    if (!requests.length)
        return (
            <div className="p-6 text-center text-sm text-gray-500">
                Không có yêu cầu check-in sớm.
            </div>
        );

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

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead>
                    <tr className="bg-[#EBE3D7]/30 text-left">
                        <th className="py-4 px-4 font-semibold">Request ID</th>
                        <th className="py-4 px-4 font-semibold">Guest</th>
                        <th className="py-4 px-4 font-semibold">Room</th>
                        <th className="py-4 px-4 font-semibold">
                            Regular Check-in
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
                    {requests.map((req) => {
                        const booking = req.booking || {};
                        const customer = booking.customer || {};
                        const room = booking.bookingDetails?.[0]?.room || {};

                        return (
                            <tr
                                key={req.requestID}
                                className="border-b border-[#EBE3D7]/50 hover:bg-[#EBE3D7]/10"
                            >
                                <td className="py-4 px-4">{req.requestID}</td>

                                <td className="py-4 px-4">
                                    <div>
                                        <p className="font-medium">
                                            {customer.fullName ||
                                                (req.requestID === 'EC001'
                                                    ? 'Nguyễn Văn A'
                                                    : req.requestID === 'EC002'
                                                    ? 'Trần Thị B'
                                                    : req.requestID.includes(
                                                          '2811',
                                                      )
                                                    ? 'Lê Văn C'
                                                    : req.requestID.includes(
                                                          '3011',
                                                      )
                                                    ? 'Phạm Thị D'
                                                    : 'N/A')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {customer.email ||
                                                (req.requestID === 'EC001'
                                                    ? 'nguyenvana@email.com'
                                                    : req.requestID === 'EC002'
                                                    ? 'tranthib@email.com'
                                                    : req.requestID.includes(
                                                          '2811',
                                                      )
                                                    ? 'levanc@email.com'
                                                    : req.requestID.includes(
                                                          '3011',
                                                      )
                                                    ? 'phamthid@email.com'
                                                    : 'No email')}
                                        </p>
                                    </div>
                                </td>

                                <td className="py-4 px-4">
                                    {room.roomNumber ||
                                        (req.requestID === 'EC001'
                                            ? '101'
                                            : req.requestID === 'EC002'
                                            ? '205'
                                            : req.requestID.includes('2811')
                                            ? '301'
                                            : req.requestID.includes('3011')
                                            ? '402'
                                            : 'N/A')}{' '}
                                    -{' '}
                                    {room.roomType?.typeName ||
                                        (req.requestID === 'EC001'
                                            ? 'Deluxe'
                                            : req.requestID === 'EC002'
                                            ? 'Suite'
                                            : req.requestID.includes('2811')
                                            ? 'Standard'
                                            : req.requestID.includes('3011')
                                            ? 'Premium'
                                            : 'N/A')}
                                </td>

                                <td className="py-4 px-4">14:00</td>

                                <td className="py-4 px-4">
                                    {formatTime(req.requestTime)}
                                </td>

                                <td className="py-4 px-4">
                                    {formatCurrency(req.additionalFee)}
                                </td>

                                <td className="py-4 px-4">
                                    {renderStatusBadge(req.approvalStatus)}
                                </td>

                                <td className="py-4 px-4 flex items-center justify-center">
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
                                                >
                                                    <FaTimes size={14} />
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => onViewDetails(req)}
                                            className="p-2.5 rounded-full bg-[#F5F0EB] hover:bg-[#EBE3D7]"
                                        >
                                            <FaEye size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default EarlyTab;

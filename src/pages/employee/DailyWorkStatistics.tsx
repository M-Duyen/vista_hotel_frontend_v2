/*eslint-disable */
import { useState, useEffect } from 'react';
import {
    Wrench,
    Clock,
    CheckCircle2,
    ClipboardList,
    BookOpenCheck,
    Search,
    Calendar,
    LogOut,
} from 'lucide-react';
import { getBookingsByCheckInDate } from '../../services/bookingService';
import { getAllEarlyCheckins } from '../../services/earlyCheckinService';
import { getAllLateCheckouts } from '../../services/lateCheckoutService';
import { incidentService } from '../../services/incidentService';
import type { Booking } from '../../types/Booking';

export interface Task {
    id: string;
    name: string;
    type: string;
    time: string;
    status: string;
    completedTime?: string;
    roomInfo?: string;
}

export default function DailyWorkStatistics() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('');

    // Lấy employee ID từ localStorage khi component mount
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                const employeeId = parsedUser.id || parsedUser.employeeId || '';
                setCurrentEmployeeId(employeeId);
                console.log('Current Employee ID:', employeeId);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    useEffect(() => {
        if (currentEmployeeId) {
            fetchDailyTasks();
        }
    }, [date, currentEmployeeId]);

    const fetchDailyTasks = async () => {
        if (!currentEmployeeId) {
            console.warn('⚠️ No employee ID found');
            return;
        }

        setLoading(true);
        try {
            const tasksArray: Task[] = [];

            // 1. Lấy bookings check-in trong ngày
            const bookings: Booking[] = await getBookingsByCheckInDate(date);
            bookings.forEach((booking) => {
                const roomNumbers =
                    booking.bookingDetails
                        ?.map((bd) => bd.room?.roomNumber)
                        .filter(Boolean)
                        .join(', ') || 'N/A';

                tasksArray.push({
                    id: booking.bookingID,
                    name: `Check-in: ${
                        booking.customer?.fullName || 'Khách'
                    } - Phòng ${roomNumbers}`,
                    type: 'Booking',
                    roomInfo: roomNumbers,
                    time: new Date(booking.checkInDate).toLocaleTimeString(
                        'vi-VN',
                        {
                            hour: '2-digit',
                            minute: '2-digit',
                        },
                    ),
                    completedTime:
                        booking.status === 'CHECKED_OUT' && booking.checkOutDate
                            ? new Date(booking.checkOutDate).toLocaleString(
                                  'vi-VN',
                                  {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  },
                              )
                            : undefined,
                    status:
                        booking.status === 'CHECKED_OUT'
                            ? 'Hoàn tất'
                            : booking.status === 'PENDING'
                            ? 'Chờ xác nhận'
                            : 'Đang xử lý',
                });
            });

            // 2. Lấy early check-in requests - CHỈ CỦA EMPLOYEE NÀY
            const earlyCheckins: any[] = await getAllEarlyCheckins();
            const todayEarlyCheckins = earlyCheckins.filter((ec: any) => {
                // ✅ Filter theo employee ID
                if (ec.employee?.id !== currentEmployeeId) return false;

                if (!ec.requestedTime) return false;
                try {
                    const requestDate = new Date(ec.requestedTime)
                        .toISOString()
                        .split('T')[0];
                    return requestDate === date;
                } catch {
                    return false;
                }
            });

            todayEarlyCheckins.forEach((ec: any) => {
                try {
                    const roomNumbers =
                        ec.booking?.bookingDetails
                            ?.map((bd: any) => bd.room?.roomNumber)
                            .filter(Boolean)
                            .join(', ') || 'N/A';

                    tasksArray.push({
                        id: ec.id,
                        name: `Early-Check-in: ${
                            ec.booking?.customer?.fullName || 'Khách'
                        } - Phòng ${roomNumbers}`,
                        type: 'Check-in sớm',
                        roomInfo: roomNumbers,
                        time: new Date(ec.requestedTime).toLocaleTimeString(
                            'vi-VN',
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        ),
                        completedTime:
                            ec.status === 'APPROVED' && ec.approvedTime
                                ? new Date(ec.approvedTime).toLocaleString(
                                      'vi-VN',
                                      {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      },
                                  )
                                : undefined,
                        status:
                            ec.status === 'APPROVED'
                                ? 'Hoàn tất'
                                : ec.status === 'PENDING'
                                ? 'Chờ xác nhận'
                                : ec.status === 'REJECTED'
                                ? 'Từ chối'
                                : 'Đang xử lý',
                    });
                } catch (error) {
                    console.warn('Invalid early checkin data:', ec);
                }
            });

            // 3. Lấy late checkout requests - CHỈ CỦA EMPLOYEE NÀY
            const lateCheckouts: any[] = await getAllLateCheckouts();
            const todayLateCheckouts = lateCheckouts.filter((lc: any) => {
                // ✅ Filter theo employee ID
                if (lc.employee?.id !== currentEmployeeId) return false;

                if (!lc.requestedTime) return false;
                try {
                    const requestDate = new Date(lc.requestedTime)
                        .toISOString()
                        .split('T')[0];
                    return requestDate === date;
                } catch {
                    return false;
                }
            });

            todayLateCheckouts.forEach((lc: any) => {
                try {
                    const roomNumbers =
                        lc.booking?.bookingDetails
                            ?.map((bd: any) => bd.room?.roomNumber)
                            .filter(Boolean)
                            .join(', ') || 'N/A';

                    tasksArray.push({
                        id: lc.id,
                        name: `Late-Check-out: ${
                            lc.booking?.customer?.fullName || 'Khách'
                        } - Phòng ${roomNumbers}`,
                        type: 'Checkout muộn',
                        roomInfo: roomNumbers,
                        time: new Date(lc.requestedTime).toLocaleTimeString(
                            'vi-VN',
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        ),
                        completedTime:
                            lc.status === 'APPROVED' && lc.approvedTime
                                ? new Date(lc.approvedTime).toLocaleString(
                                      'vi-VN',
                                      {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      },
                                  )
                                : undefined,
                        status:
                            lc.status === 'APPROVED'
                                ? 'Hoàn tất'
                                : lc.status === 'PENDING'
                                ? 'Chờ xác nhận'
                                : lc.status === 'REJECTED'
                                ? 'Từ chối'
                                : 'Đang xử lý',
                    });
                } catch (error) {
                    console.warn('Invalid late checkout data:', lc);
                }
            });

            // 4. Lấy maintenance incidents - CHỈ CỦA EMPLOYEE NÀY (nếu có field assignedTo)
            const incidents = await incidentService.getAllIncidents();
            const todayIncidents = incidents.filter((inc) => {
                // ✅ Uncomment dòng dưới nếu muốn filter theo assigned employee
                // if (inc.assignedEmployeeId !== currentEmployeeId) return false;

                if (!inc.reportedDate) return false;
                try {
                    const incidentDate = new Date(inc.reportedDate)
                        .toISOString()
                        .split('T')[0];
                    return incidentDate === date;
                } catch {
                    return false;
                }
            });

            todayIncidents.forEach((inc) => {
                try {
                    const priorityLabel =
                        inc.priority === 'URGENT'
                            ? '🔴'
                            : inc.priority === 'HIGH'
                            ? '🟠'
                            : inc.priority === 'MEDIUM'
                            ? '🟡'
                            : '🟢';

                    tasksArray.push({
                        id: inc.id,
                        name: `${priorityLabel} Report: ${
                            inc.customerName || 'Khách'
                        } - Phòng ${inc.roomNumber || 'N/A'} (${
                            inc.title || inc.description || 'Sự cố'
                        })`,
                        type: 'Bảo trì',
                        roomInfo: inc.roomNumber,
                        time: new Date(inc.reportedDate).toLocaleTimeString(
                            'vi-VN',
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                            },
                        ),
                        completedTime:
                            inc.status === 'COMPLETED' && inc.resolvedDate
                                ? new Date(inc.resolvedDate).toLocaleString(
                                      'vi-VN',
                                      {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      },
                                  )
                                : undefined,
                        status:
                            inc.status === 'COMPLETED'
                                ? 'Hoàn tất'
                                : inc.status === 'FAILED'
                                ? 'Thất bại'
                                : 'Chờ xác nhận',
                    });
                } catch (error) {
                    console.warn('Invalid incident data:', inc);
                }
            });

            // Sắp xếp theo thời gian
            tasksArray.sort((a, b) => a.time.localeCompare(b.time));

            setTasks(tasksArray);
        } catch (error) {
            console.error('Error fetching daily tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = tasks.filter(
        (t) =>
            t.id.toLowerCase().includes(search.toLowerCase()) ||
            t.name.toLowerCase().includes(search.toLowerCase()),
    );

    const stats = [
        {
            label: 'Tổng công việc',
            value: tasks.length,
            icon: ClipboardList,
            bg: 'bg-slate-700',
        },
        {
            label: 'Hoàn tất',
            value: tasks.filter((t) => t.status === 'Hoàn tất').length,
            icon: CheckCircle2,
            bg: 'bg-green-600',
        },
        {
            label: 'Check-in sớm',
            value: tasks.filter((t) => t.type === 'Check-in sớm').length,
            icon: Clock,
            bg: 'bg-blue-500',
        },
        {
            label: 'Checkout muộn',
            value: tasks.filter((t) => t.type === 'Checkout muộn').length,
            icon: LogOut,
            bg: 'bg-purple-500',
        },
        {
            label: 'Bảo trì',
            value: tasks.filter((t) => t.type === 'Bảo trì').length,
            icon: Wrench,
            bg: 'bg-orange-500',
        },
        {
            label: 'Booking',
            value: tasks.filter((t) => t.type === 'Booking').length,
            icon: BookOpenCheck,
            bg: 'bg-amber-500',
        },
    ];

    return (
        <div className="min-h-screen ">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">
                                Thống kê công việc hằng ngày
                            </h1>
                            <p className="text-sm text-slate-600">
                                Quản lý và theo dõi tiến độ công việc một cách
                                hiệu quả
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="text-sm font-medium text-slate-700 focus:outline-none bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                        {s.label}
                                    </p>
                                    <p className="text-3xl font-bold text-slate-900">
                                        {s.value}
                                    </p>
                                </div>
                                <div
                                    className={`${s.bg} p-3 rounded-lg shadow-sm`}
                                >
                                    <s.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã booking hoặc tên công việc..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
                                <p className="text-sm font-medium text-slate-500">
                                    Đang tải dữ liệu...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Mã
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Tên công việc
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Loại
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Thời gian tiếp nhận
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Thời gian hoàn thành
                                            </span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Trạng thái
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <ClipboardList className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-500">
                                                        Không tìm thấy công việc
                                                        nào
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((t) => (
                                            <tr
                                                key={t.id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                                                        {t.id}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 max-w-md">
                                                    <span className="text-sm font-medium text-slate-900 line-clamp-2">
                                                        {t.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                                                            t.type ===
                                                            'Check-in sớm'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : t.type ===
                                                                  'Checkout muộn'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : t.type ===
                                                                  'Bảo trì'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}
                                                    >
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        <span className="text-sm text-slate-600">
                                                            {t.time}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {t.completedTime ? (
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            <span className="text-sm text-slate-600">
                                                                {
                                                                    t.completedTime
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400 italic">
                                                            Chưa hoàn thành
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                                                            t.status ===
                                                            'Hoàn tất'
                                                                ? 'bg-green-100 text-green-700'
                                                                : t.status ===
                                                                  'Đang xử lý'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : t.status ===
                                                                  'Từ chối'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-orange-100 text-orange-700'
                                                        }`}
                                                    >
                                                        {t.status ===
                                                            'Hoàn tất' && (
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        )}
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Hiển thị{' '}
                        <span className="font-semibold text-slate-700">
                            {filtered.length}
                        </span>{' '}
                        /{' '}
                        <span className="font-semibold text-slate-700">
                            {tasks.length}
                        </span>{' '}
                        công việc
                    </p>
                </div>
            </div>
        </div>
    );
}

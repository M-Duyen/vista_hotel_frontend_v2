/*eslint-disable*/
import type React from 'react';
import { useEffect, useState } from 'react';
import type { Employee } from '../../types/Employee';
import { getAll, deleteEmployee } from '../../services/employeeService';
import AddEmployeeModal from '../../components/employee/AddEmployeeModal';
import EditEmployeeModal from '../../components/employee/EditEmployeeModal';
import { useToastContext } from '../../hooks/useToastContext';

/* ---------------------------- Stat Card ---------------------------- */
type StatCardProps = {
    icon: string;
    label: string;
    value: React.ReactNode;
    color?: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition duration-300">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-600 text-sm font-medium mb-2">
                    {label}
                </p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg ${color}`}
            >
                <i className={`fa-solid ${icon}`}></i>
            </div>
        </div>
    </div>
);

// EMPLOYEE LIST PAGE

export default function EmployeeList() {
    const toast = useToastContext();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null,
    );

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const handleEditEmployee = (emp: Employee) => {
        console.log('Opening edit modal for employee:', emp);
        if (!emp.id) {
            console.error('Employee missing ID:', emp);
            toast.error('Nhân viên không có ID hợp lệ');
            return;
        }
        setSelectedEmployee(emp);
        setShowEditModal(true);
    };

    const handleDeleteEmployee = async (employeeId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;

        try {
            await deleteEmployee(employeeId);
            setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
        } catch (error) {
            console.error('Delete employee error:', error);
            toast.error('Không thể xóa nhân viên');
        }
    };

    /* ------------------------- LOAD EMPLOYEES ------------------------- */
    const loadEmployees = async () => {
        try {
            const data = await getAll();
            setEmployees(data ?? []);
        } catch (error) {
            console.error('Load employees error:', error);
            toast.error('Không thể tải danh sách nhân viên');
        }
    };

    /* ------------------------- FETCH DATA ------------------------- */
    useEffect(() => {
        const load = async () => {
            try {
                await loadEmployees();
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    /* ------------------------- FILTER + SEARCH ------------------------- */
    const filtered = employees.filter((e) => {
        const key =
            (e.fullName ?? '') +
            (e.email ?? '') +
            (e.id ?? '') +
            (e.department ?? '');

        return key.toLowerCase().includes(search.toLowerCase());
    });

    /* ------------------------- PAGINATION ------------------------- */
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEmployees = filtered.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    /* ------------------------- LOADING & ERROR ------------------------- */
    if (loading)
        return (
            <div className="flex justify-center items-center h-screen text-gray-700 text-xl">
                Đang tải dữ liệu nhân viên...
            </div>
        );

    if (error)
        return (
            <div className="flex justify-center items-center h-screen text-red-600 text-xl">
                {error}
            </div>
        );

    /* ===================================================================
                                UI RENDER
    =================================================================== */
    return (
        <div className="min-h-screen">
            <div className="pt-6 px-4 pb-8">
                <div className="max-w-7xl mx-auto">
                    {/* Title */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                            Quản lý nhân viên
                        </h1>
                        <p className="text-sm text-gray-600 font-light">
                            Quản lý dữ liệu nhân viên một cách hiệu quả
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <StatCard
                            icon="fa-users"
                            label="Tổng nhân viên"
                            value={employees.length}
                            color="bg-gray-900"
                        />
                        <StatCard
                            icon="fa-building"
                            label="Bộ phận"
                            value={
                                [...new Set(employees.map((e) => e.department))]
                                    .length
                            }
                            color="bg-blue-700"
                        />
                        <StatCard
                            icon="fa-id-badge"
                            label="Vị trí công việc"
                            value={
                                [...new Set(employees.map((e) => e.position))]
                                    .length
                            }
                            color="bg-green-700"
                        />
                        <StatCard
                            icon="fa-dollar-sign"
                            label="Tổng lương"
                            value={employees
                                .reduce((t, e) => t + (e.salary ?? 0), 0)
                                .toLocaleString()}
                            color="bg-yellow-700"
                        />
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                            <div className="relative flex-1 w-full">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên, email, mã, bộ phận..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-gray-50 hover:bg-white text-sm"
                                />
                            </div>

                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md hover:shadow-lg text-sm flex items-center gap-2"
                            >
                                <i className="fa-solid fa-plus text-sm"></i>
                                Thêm nhân viên
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F5F0EB] border-b border-gray-300">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                                            ID
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                                            Full name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                                            Department
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                                            Position
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase">
                                            Address
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {currentEmployees.map((e) => (
                                        <tr
                                            key={e.id}
                                            className="hover:bg-[#F5F0EB] transition group"
                                        >
                                            <td className="px-4 py-3 font-bold text-gray-900 text-sm">
                                                {e.id}
                                            </td>

                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">
                                                    {e.fullName.charAt(0)}
                                                </div>
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {e.fullName}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                                {e.department}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                                {e.position}
                                            </td>

                                            <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                                {e.phone}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                                {e.email}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-green-700">
                                                {e.address}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <div className="flex gap-2 transition">
                                                    <button className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition">
                                                        <i className="fa-solid fa-eye text-sm"></i>
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleEditEmployee(
                                                                e,
                                                            )
                                                        }
                                                        className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition"
                                                    >
                                                        <i className="fa-solid fa-pen text-sm"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t bg-[#F5F0EB] text-sm flex justify-between">
                            <span>
                                Hiển thị {startIndex + 1}–
                                {Math.min(endIndex, filtered.length)} /{' '}
                                {filtered.length} nhân viên
                            </span>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.max(1, p - 1),
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className="w-9 h-9 rounded-full flex items-center justify-center border bg-white hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        <i className="fa-solid fa-chevron-left text-sm"></i>
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border transition ${
                                                currentPage === page
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-white text-gray-900 hover:bg-gray-200'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.min(totalPages, p + 1),
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className="w-9 h-9 rounded-full flex items-center justify-center border bg-white hover:bg-gray-100 disabled:opacity-40"
                                    >
                                        <i className="fa-solid fa-chevron-right text-sm"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FontAwesome */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />

            <AddEmployeeModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    setShowModal(false);
                    loadEmployees();
                }}
            />

            <EditEmployeeModal
                show={showEditModal}
                employee={selectedEmployee}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                }}
                onSuccess={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                    loadEmployees();
                }}
            />
        </div>
    );
}

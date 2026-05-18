import type { Employee } from '../../types/Employee';

type Props = {
    show: boolean;
    employee: Employee | null;
    onClose: () => void;
};

const InfoRow = ({ label, value }: { label: string; value?: unknown }) => (
    <div className="border-b border-gray-100 py-3">
        <p className="text-xs font-semibold uppercase text-gray-500">
            {label}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-900">
            {value === null || value === undefined || value === '' ? '-' : String(value)}
        </p>
    </div>
);

export default function EmployeeDetailModal({ show, employee, onClose }: Props) {
    if (!show || !employee) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Employee Details
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {employee.id}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Close"
                    >
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                    <InfoRow label="Full Name" value={employee.fullName} />
                    <InfoRow label="Username" value={employee.username || employee.userName} />
                    <InfoRow label="Email" value={employee.email} />
                    <InfoRow label="Phone Number" value={employee.phone} />
                    <InfoRow label="Department" value={employee.department} />
                    <InfoRow label="Job Position" value={employee.position} />
                    <InfoRow label="Salary" value={employee.salary?.toLocaleString()} />
                    <InfoRow label="Hire Date" value={employee.hireDate} />
                    <InfoRow label="Status" value={employee.employeeStatus || employee.status} />
                    <InfoRow label="Role" value={employee.roles?.join(', ') || employee.userRole} />
                    <InfoRow label="Address" value={employee.address} />
                </div>
            </div>
        </div>
    );
}

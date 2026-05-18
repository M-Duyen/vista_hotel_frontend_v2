import type { Customer } from '../../types/Customer';

type Props = {
    show: boolean;
    customer: Customer | null;
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

export default function CustomerDetailModal({ show, customer, onClose }: Props) {
    if (!show || !customer) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Customer Details
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {customer.id}
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
                    <InfoRow label="Full Name" value={customer.fullName} />
                    <InfoRow label="Username" value={customer.username || customer.userName} />
                    <InfoRow label="Email" value={customer.email} />
                    <InfoRow label="Phone Number" value={customer.phone} />
                    <InfoRow label="Date of Birth" value={customer.birthDate} />
                    <InfoRow label="Gender" value={customer.gender} />
                    <InfoRow label="Address" value={customer.address} />
                    <InfoRow label="Joined Date" value={customer.joinedDate} />
                    <InfoRow label="Loyalty Points" value={customer.loyaltyPoints} />
                    <InfoRow label="Membership Tier" value={customer.memberShipLevel} />
                    <InfoRow label="Reputation Point" value={customer.reputationPoint} />
                </div>
            </div>
        </div>
    );
}

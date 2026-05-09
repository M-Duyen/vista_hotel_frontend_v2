import { useState } from 'react';
import type { CustomerVoucher } from '../../types/CustomerVoucher';

interface CustomerVoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectVoucher?: (vouchers: CustomerVoucher[]) => void;
    availableVouchers: CustomerVoucher[];
}

function CustomerVoucherModal({
    isOpen,
    onClose,
    onSelectVoucher,
    availableVouchers,
}: CustomerVoucherModalProps) {
    const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);

    const handleClose = () => {
        setSelectedVoucherIds([]);
        if (onSelectVoucher) {
            onSelectVoucher([]);
        }
        onClose();
    };

    const toggleVoucher = (voucherId: string) => {
        setSelectedVoucherIds((prev) =>
            prev.includes(voucherId)
                ? prev.filter((id) => id !== voucherId)
                : [...prev, voucherId],
        );
    };

    const handleSubmit = () => {
        if (onSelectVoucher) {
            if (selectedVoucherIds.length > 0) {
                const selectedVouchers = availableVouchers.filter((v) =>
                    selectedVoucherIds.includes(v.voucher.voucherID),
                );
                onSelectVoucher(selectedVouchers);
            }
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/70 z-[60]"
                onClick={handleClose}
            ></div>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
                <div
                    className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-[modalFadeIn_0.3s] my-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-5 border-b border-[#EBE3D7] sticky top-0 bg-white z-10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-playfair font-semibold">
                                Available Vouchers
                            </h3>
                        </div>
                    </div>

                    <div className="p-6">
                        {availableVouchers.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-gray-500">
                                    No vouchers available
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableVouchers.map((custVoucher, index) => {
                                    const isChecked =
                                        selectedVoucherIds.includes(
                                            custVoucher.voucher.voucherID,
                                        );
                                    const discountType =
                                        custVoucher.voucher.discountType;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() =>
                                                toggleVoucher(
                                                    custVoucher.voucher
                                                        .voucherID,
                                                )
                                            }
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                                                isChecked
                                                    ? 'border-[#CCBDA3] bg-[#CCBDA3]/10'
                                                    : 'border-gray-200 hover:border-[#CCBDA3]/50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {
                                                            custVoucher.voucher
                                                                .voucherName
                                                        }
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {discountType ===
                                                        'PERCENT' ? (
                                                            <>
                                                                Discount:{' '}
                                                                <span className="font-semibold text-[#CCBDA3]">
                                                                    {
                                                                        custVoucher
                                                                            .voucher
                                                                            .discountPercentage
                                                                    }
                                                                    %
                                                                </span>{' '}
                                                                of total
                                                            </>
                                                        ) : (
                                                            <>
                                                                Discount:{' '}
                                                                <span className="font-semibold text-[#CCBDA3]">
                                                                    {custVoucher.voucher.discountValue?.toLocaleString() ||
                                                                        0}{' '}
                                                                    VND
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Valid until:{' '}
                                                        {new Date(
                                                            custVoucher.voucher.endDate,
                                                        ).toLocaleDateString(
                                                            'en-GB',
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="ml-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() =>
                                                            toggleVoucher(
                                                                custVoucher
                                                                    .voucher
                                                                    .voucherID,
                                                            )
                                                        }
                                                        className="w-5 h-5 cursor-pointer accent-[#CCBDA3]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-5 border-t border-[#EBE3D7] flex justify-end gap-3 sticky bottom-0 bg-white">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 border border-[#EBE3D7] rounded-md hover:bg-[#EBE3D7]/50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedVoucherIds.length === 0}
                            className="px-6 py-2.5 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply Voucher ({selectedVoucherIds.length} selected)
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CustomerVoucherModal;

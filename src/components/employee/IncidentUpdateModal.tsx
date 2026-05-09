import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { IncidentReport, IncidentStatus } from '../../types/Incident';
import IncidentStatusBadge from './IncidentStatusBadge';
import IncidentPriorityBadge from './IncidentPriorityBadge';
import { formatDate } from '../../utils/formatters';

interface IncidentUpdateModalProps {
    incident: IncidentReport;
    onClose: () => void;
    onUpdate: (
        id: string,
        status: IncidentStatus,
        note?: string,
    ) => Promise<void>;
}

const IncidentUpdateModal: React.FC<IncidentUpdateModalProps> = ({
    incident,
    onClose,
    onUpdate,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(
        incident.status,
    );
    const [staffNote, setStaffNote] = useState<string>(
        incident.assignedTo || '',
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await onUpdate(
                incident.id,
                selectedStatus,
                staffNote.trim() || undefined,
            );
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'An error occurred while updating status',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Update Incident Status
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Incident Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Incident Code
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {incident.id}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Customer
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {incident.customerName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Booking ID
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {incident.bookingId}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Report Date
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {formatDate(incident.reportedDate)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">Title</p>
                            <p className="font-semibold text-gray-900">
                                {incident.title}
                            </p>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">
                                Description
                            </p>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {incident.description}
                            </p>
                        </div>

                        {/* Image Display */}
                        {incident.imageUrl && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">
                                    Image
                                </p>
                                <a
                                    href={incident.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <img
                                        src={incident.imageUrl}
                                        alt="Incident"
                                        className="w-full max-w-md h-auto object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                                    />
                                </a>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Priority
                                </p>
                                <IncidentPriorityBadge
                                    priority={incident.priority}
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">
                                    Current Status
                                </p>
                                <IncidentStatusBadge status={incident.status} />
                            </div>
                        </div>

                        {/* Show existing staff note */}
                        {incident.assignedTo && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-600 font-medium mb-1">
                                    Current Note:
                                </p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {incident.assignedTo}
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Status Update Form */} {/* Status Update Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Update Status
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#CCBDA3] transition-colors">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="PENDING"
                                        checked={selectedStatus === 'PENDING'}
                                        onChange={(e) =>
                                            setSelectedStatus(
                                                e.target
                                                    .value as IncidentStatus,
                                            )
                                        }
                                        className="w-4 h-4 text-[#CCBDA3] focus:ring-[#CCBDA3]"
                                    />
                                    <span className="ml-3 flex items-center gap-2">
                                        <IncidentStatusBadge status="PENDING" />
                                        <span className="text-sm text-gray-600">
                                            - Awaiting processing
                                        </span>
                                    </span>
                                </label>

                                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#CCBDA3] transition-colors">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="COMPLETED"
                                        checked={selectedStatus === 'COMPLETED'}
                                        onChange={(e) =>
                                            setSelectedStatus(
                                                e.target
                                                    .value as IncidentStatus,
                                            )
                                        }
                                        className="w-4 h-4 text-[#CCBDA3] focus:ring-[#CCBDA3]"
                                    />
                                    <span className="ml-3 flex items-center gap-2">
                                        <IncidentStatusBadge status="COMPLETED" />
                                        <span className="text-sm text-gray-600">
                                            - Processing completed
                                        </span>
                                    </span>
                                </label>

                                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#CCBDA3] transition-colors">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="FAILED"
                                        checked={selectedStatus === 'FAILED'}
                                        onChange={(e) =>
                                            setSelectedStatus(
                                                e.target
                                                    .value as IncidentStatus,
                                            )
                                        }
                                        className="w-4 h-4 text-[#CCBDA3] focus:ring-[#CCBDA3]"
                                    />
                                    <span className="ml-3 flex items-center gap-2">
                                        <IncidentStatusBadge status="FAILED" />
                                        <span className="text-sm text-gray-600">
                                            - Unable to process
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Staff Note/Response */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note / Response to Customer
                                <span className="text-gray-500 font-normal ml-2">
                                    (Optional)
                                </span>
                            </label>
                            <textarea
                                value={staffNote}
                                onChange={(e) => setStaffNote(e.target.value)}
                                placeholder="Enter processing notes, customer response or leave blank if not needed..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CCBDA3] focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This note will be saved and customers can view
                                it
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-[#CCBDA3] text-white rounded-lg font-medium hover:bg-[#B8A890] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IncidentUpdateModal;

import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { IncidentStatus } from '../../types/Incident';

interface IncidentStatusBadgeProps {
    status: IncidentStatus;
    className?: string;
}

const IncidentStatusBadge: React.FC<IncidentStatusBadgeProps> = ({
    status,
    className = '',
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'PENDING':
                return {
                    icon: Clock,
                    text: 'Pending',
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-600',
                };
            case 'COMPLETED':
                return {
                    icon: CheckCircle,
                    text: 'Completed',
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-600',
                };
            case 'FAILED':
                return {
                    icon: XCircle,
                    text: 'Failed',
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-600',
                };
            default:
                return {
                    icon: Clock,
                    text: status,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    iconColor: 'text-gray-600',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor} ${className}`}
        >
            <Icon className={`w-4 h-4 ${config.iconColor}`} />
            {config.text}
        </span>
    );
};

export default IncidentStatusBadge;

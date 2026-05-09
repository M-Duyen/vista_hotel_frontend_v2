import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { IncidentPriority } from '../../types/Incident';

interface IncidentPriorityBadgeProps {
    priority: IncidentPriority;
    className?: string;
}

const IncidentPriorityBadge: React.FC<IncidentPriorityBadgeProps> = ({
    priority,
    className = '',
}) => {
    const getPriorityConfig = () => {
        switch (priority) {
            case 'CRITICAL':
                return {
                    text: 'Critical',
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-300',
                };
            case 'URGENT':
                return {
                    text: 'Urgent',
                    bgColor: 'bg-orange-100',
                    textColor: 'text-orange-800',
                    borderColor: 'border-orange-300',
                };
            case 'HIGH':
                return {
                    text: 'High',
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    borderColor: 'border-yellow-300',
                };
            case 'MEDIUM':
                return {
                    text: 'Medium',
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    borderColor: 'border-blue-300',
                };
            case 'LOW':
                return {
                    text: 'Low',
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-300',
                };
            default:
                return {
                    text: priority,
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-300',
                };
        }
    };

    const config = getPriorityConfig();

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
        >
            <AlertCircle className="w-3.5 h-3.5" />
            {config.text}
        </span>
    );
};

export default IncidentPriorityBadge;

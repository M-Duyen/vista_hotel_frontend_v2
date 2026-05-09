// Types for Incident Reporting System (MaintenanceRequest)
// Mapped to backend MaintenanceRequest model

export type IncidentPriority =
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT'
    | 'CRITICAL';
export type IncidentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

// Frontend categories for user selection
export type IncidentCategory =
    | 'ROOM_MAINTENANCE'
    | 'CLEANLINESS'
    | 'NOISE'
    | 'EQUIPMENT_FAILURE'
    | 'SAFETY_SECURITY'
    | 'SERVICE_COMPLAINT'
    | 'OTHER';

// Backend MaintenanceRequest model
export interface MaintenanceRequest {
    requestID: string;
    requestDate: string; // LocalDateTime from backend
    description: string;
    prioty: IncidentPriority;
    status: IncidentStatus;
    assignedTo?: string;
    completionDate?: string; // LocalDateTime from backend
    estimatedTime?: number;
    actualCost?: number;
    imageUrl?: string; // URL ảnh từ Cloudinary
    bookingId?: string; // Direct bookingId field (when booking object not populated)
    booking?: {
        bookingID: string;
        customer?: {
            id: string;
            fullName: string;
        };
    };
}

// Frontend display model (mapped from MaintenanceRequest)
export interface IncidentReport {
    id: string;
    customerId: string;
    customerName: string;
    bookingId?: string;
    roomNumber?: string;
    category: IncidentCategory;
    priority: IncidentPriority;
    title: string; // Extracted from description
    description: string;
    imageUrl?: string; // URL ảnh từ Cloudinary
    status: IncidentStatus;
    reportedDate: string;
    resolvedDate?: string;
    assignedTo?: string; // Used for staff notes/response
    estimatedTime?: number;
    actualCost?: number;
}

// Update request (to backend)
export interface UpdateIncidentRequest {
    status: IncidentStatus;
    assignedTo?: string; // Staff notes/response
}

// Create request (to backend)
export interface CreateIncidentRequest {
    requestID?: string;
    description: string;
    prioty: IncidentPriority;
    status?: IncidentStatus;
    bookingId: string; // Required by backend
    estimatedTime?: number;
    imageUrl?: string; // URL ảnh từ Cloudinary
}

// Frontend form data
export interface IncidentFormData {
    bookingId: string;
    category: IncidentCategory;
    priority: IncidentPriority;
    title: string;
    description: string;
    imageUrl?: string; // URL ảnh từ Cloudinary
}

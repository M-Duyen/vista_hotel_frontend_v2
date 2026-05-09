import { api } from './apiClient';
import type {
    CreateIncidentRequest,
    IncidentReport,
    MaintenanceRequest,
    IncidentFormData,
} from '../types/Incident';

const MAINTENANCE_BASE_URL = '/maintenance';

// Helper function to map MaintenanceRequest to IncidentReport
const mapMaintenanceToIncident = (
    maintenance: MaintenanceRequest,
): IncidentReport => {
    // Extract title from description (first line or first 50 chars)
    const descLines = maintenance.description.split('\n');
    const title =
        descLines[0]?.substring(0, 50) ||
        maintenance.description.substring(0, 50);
    const description =
        descLines.length > 1
            ? descLines.slice(1).join('\n')
            : maintenance.description;

    // Try to get bookingId from root level first, then from booking object
    const bookingId = maintenance.bookingId || maintenance.booking?.bookingID;

    return {
        id: maintenance.requestID,
        customerId: maintenance.booking?.customer?.id || '',
        customerName: maintenance.booking?.customer?.fullName || 'N/A',
        bookingId: bookingId,
        category: 'OTHER', // Default category since backend doesn't have category field
        priority: maintenance.prioty,
        title: title,
        description: description,
        imageUrl: maintenance.imageUrl, // URL ảnh từ Cloudinary
        status: maintenance.status,
        reportedDate: maintenance.requestDate,
        resolvedDate: maintenance.completionDate,
        assignedTo: maintenance.assignedTo,
        estimatedTime: maintenance.estimatedTime,
        actualCost: maintenance.actualCost,
    };
};

// Helper function to generate request ID
const generateRequestID = (): string => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `MR${timestamp}${random}`;
};

export const incidentService = {
    // Get all maintenance requests
    getAllIncidents: async (): Promise<IncidentReport[]> => {
        const response = await api.get<MaintenanceRequest[]>(
            MAINTENANCE_BASE_URL,
        );
        return response.data.map(mapMaintenanceToIncident);
    },

    // Get incidents for a specific customer (filter by customer ID or booking ID)
    getCustomerIncidents: async (
        customerId: string,
        bookingId?: string,
    ): Promise<IncidentReport[]> => {
        const response = await api.get<MaintenanceRequest[]>(
            MAINTENANCE_BASE_URL,
        );

        console.log('🔍 Total incidents from API:', response.data.length);
        console.log(
            '🔍 Looking for customer ID:',
            customerId,
            'or booking ID:',
            bookingId,
        );
        console.log(
            '🔍 All incidents:',
            response.data.map((req) => ({
                id: req.requestID,
                bookingId: req.booking?.bookingID,
                customerId: req.booking?.customer?.id,
                customerName: req.booking?.customer?.fullName,
            })),
        );

        // Filter by customer ID OR booking ID (fallback if customer data not populated)
        const filtered = response.data.filter((req) => {
            const matchesCustomer = req.booking?.customer?.id === customerId;
            // Check both root level bookingId and nested booking.bookingID
            const reqBookingId = req.bookingId || req.booking?.bookingID;
            const matchesBooking = bookingId
                ? reqBookingId === bookingId
                : false;

            console.log('🔍 Checking incident:', {
                requestId: req.requestID,
                rootBookingId: req.bookingId,
                nestedBookingId: req.booking?.bookingID,
                finalBookingId: reqBookingId,
                searchBookingId: bookingId,
                bookingIdMatch: matchesBooking,
                customerId: req.booking?.customer?.id,
                customerIdMatch: matchesCustomer,
                willInclude: matchesCustomer || matchesBooking,
            });

            return matchesCustomer || matchesBooking;
        });

        console.log('🔍 Filtered incidents:', filtered.length);
        console.log(
            '🔍 Filtered data:',
            filtered.map((req) => ({
                id: req.requestID,
                bookingId: req.booking?.bookingID,
                customerId: req.booking?.customer?.id,
            })),
        );

        return filtered.map(mapMaintenanceToIncident);
    },

    // Get incident by ID
    getIncidentById: async (id: string): Promise<IncidentReport> => {
        const response = await api.get<MaintenanceRequest>(
            `${MAINTENANCE_BASE_URL}/${id}`,
        );
        return mapMaintenanceToIncident(response.data);
    },

    // Create a new incident (MaintenanceRequest)
    createIncident: async (
        formData: IncidentFormData,
    ): Promise<IncidentReport> => {
        // Combine title and description with category prefix
        const fullDescription = `[${formData.category}] ${formData.title}\n${formData.description}`;

        const requestData: CreateIncidentRequest = {
            requestID: generateRequestID(),
            description: fullDescription,
            prioty: formData.priority,
            status: 'PENDING',
            bookingId: formData.bookingId,
            estimatedTime: 0,
            imageUrl: formData.imageUrl, // Gửi URL ảnh từ Cloudinary
        };

        console.log('📤 Sending incident to backend:', requestData);

        const response = await api.post<MaintenanceRequest>(
            `${MAINTENANCE_BASE_URL}/create`,
            requestData,
        );

        console.log('📥 Backend response:', response.data);

        const incident = mapMaintenanceToIncident(response.data);

        // IMPORTANT: Backend might not return booking object, so preserve bookingId
        if (!incident.bookingId && formData.bookingId) {
            console.log('⚠️ Backend did not return bookingId, using form data');
            incident.bookingId = formData.bookingId;
        }

        console.log('✅ Final incident object:', incident);
        return incident;
    },

    // Update incident status and notes
    updateIncident: async (
        id: string,
        status: 'PENDING' | 'COMPLETED' | 'FAILED',
        assignedTo?: string,
    ): Promise<IncidentReport> => {
        // Get current incident data first
        const currentResponse = await api.get<MaintenanceRequest>(
            `${MAINTENANCE_BASE_URL}/${id}`,
        );

        // Update with new values
        const updateData: MaintenanceRequest = {
            ...currentResponse.data,
            status: status,
            assignedTo:
                assignedTo !== undefined
                    ? assignedTo
                    : currentResponse.data.assignedTo,
        };

        // Use /save endpoint which handles both insert and update
        const response = await api.post<MaintenanceRequest>(
            `${MAINTENANCE_BASE_URL}/save`,
            updateData,
        );

        return mapMaintenanceToIncident(response.data);
    },

    // Legacy method for backward compatibility
    updateStatus: async (
        id: string,
        status: 'PENDING' | 'COMPLETED' | 'FAILED',
    ): Promise<IncidentReport> => {
        const response = await api.put<MaintenanceRequest>(
            `${MAINTENANCE_BASE_URL}/update-status/${id}`,
            null,
            { params: { status } },
        );
        return mapMaintenanceToIncident(response.data);
    },

    // Delete incident
    deleteIncident: async (id: string): Promise<void> => {
        await api.delete(`${MAINTENANCE_BASE_URL}/delete/${id}`);
    },

    // Send email notification about incident status
    sendStatusEmail: async (
        customerEmail: string,
        customerName: string,
        incident: IncidentReport,
    ): Promise<void> => {
        const { sendEmail } = await import('./emailService');

        const statusText =
            incident.status === 'PENDING'
                ? 'is being processed'
                : incident.status === 'COMPLETED'
                ? 'has been completed'
                : 'could not be resolved';

        const statusColor =
            incident.status === 'PENDING'
                ? '#f59e0b'
                : incident.status === 'COMPLETED'
                ? '#10b981'
                : '#ef4444';

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #CCBDA3 0%, #b8a88a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 10px 20px; background: ${statusColor}; color: white; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #CCBDA3; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #CCBDA3; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Incident Status Update</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>We would like to update you on the status of your reported incident:</p>
            
            <div class="info-box">
                <p><strong>Incident ID:</strong> ${incident.id}</p>
                <p><strong>Title:</strong> ${incident.title}</p>
                <p><strong>Category:</strong> ${incident.category}</p>
                <p><strong>Room:</strong> ${incident.roomNumber || 'N/A'}</p>
                <p><strong>Reported Date:</strong> ${new Date(
                    incident.reportedDate,
                ).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}</p>
            </div>

            <div class="status-badge">${incident.status}</div>
            <p><strong>Status:</strong> Your incident ${statusText}</p>

            ${
                incident.estimatedTime
                    ? `<p><strong>Estimated Completion Time:</strong> ${incident.estimatedTime} minutes</p>`
                    : ''
            }
            
            ${
                incident.assignedTo
                    ? `<div class="info-box">
                <p><strong>Staff Response:</strong></p>
                <p>${incident.assignedTo}</p>
            </div>`
                    : ''
            }

            ${
                incident.resolvedDate
                    ? `<p><strong>Resolved Date:</strong> ${new Date(
                          incident.resolvedDate,
                      ).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                      })}</p>`
                    : ''
            }

            <p>If you have any questions or concerns, please don't hesitate to contact our front desk.</p>
            
            <a href="http://localhost:5173/incident-report" class="button">View All Incidents</a>
        </div>
        <div class="footer">
            <p>Vista Hotel - Luxury & Comfort</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>`;

        await sendEmail({
            to: customerEmail,
            subject: `Incident Status Update - ${incident.id}`,
            htmlContent,
        });
    },
};

export default incidentService;

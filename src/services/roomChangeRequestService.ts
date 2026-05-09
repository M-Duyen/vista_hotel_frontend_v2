import { api } from './apiClient';

const ENDPOINT = '/room-change-requests';

export interface RoomChangeRequestDTO {
    bookingId: string;
    currentRoomNumber: string;
    newRoomNumber: string;
    reason: string;
}

export interface RoomChangeResponseDTO {
    approve: boolean;
    responseNote: string;
    processedBy: string;
}

export interface BookingRef {
    bookingID: string;
}

export interface RoomRef {
    roomNumber: string;
}

export interface RoomChangeRequestResponse {
    requestID: string;
    booking: BookingRef;
    currentRoom: RoomRef;
    newRoom: RoomRef;
    reason: string;
    requestDate: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    responseNote?: string;
    responseDate?: string;
    processedBy?: string;
}

// Get all requests
export const getAllRequests = async (): Promise<
    RoomChangeRequestResponse[]
> => {
    try {
        const response = await api.get(ENDPOINT);
        return response.data;
    } catch (error) {
        console.error('Error fetching room change requests:', error);
        throw error;
    }
};

// Get request by ID
export const getRequestById = async (
    id: string,
): Promise<RoomChangeRequestResponse> => {
    try {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching request ${id}:`, error);
        throw error;
    }
};

// Get requests by booking ID
export const getRequestsByBookingId = async (
    bookingId: string,
): Promise<RoomChangeRequestResponse[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/booking/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching requests for booking ${bookingId}:`,
            error,
        );
        throw error;
    }
};

// Get requests by customer ID
export const getRequestsByCustomerId = async (
    customerId: string,
): Promise<RoomChangeRequestResponse[]> => {
    try {
        const response = await api.get(`${ENDPOINT}/customer/${customerId}`);
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching requests for customer ${customerId}:`,
            error,
        );
        throw error;
    }
};

// Get pending requests
export const getPendingRequests = async (): Promise<
    RoomChangeRequestResponse[]
> => {
    try {
        const response = await api.get(`${ENDPOINT}/pending`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        throw error;
    }
};

// Create new request
export const createRequest = async (
    dto: RoomChangeRequestDTO,
): Promise<RoomChangeRequestResponse> => {
    try {
        const response = await api.post(ENDPOINT, dto);
        return response.data;
    } catch (error) {
        console.error('Error creating room change request:', error);
        throw error;
    }
};

// Process request (approve or reject)
export const processRequest = async (
    requestId: string,
    response: RoomChangeResponseDTO,
): Promise<RoomChangeRequestResponse> => {
    try {
        const res = await api.put(`${ENDPOINT}/${requestId}/process`, response);
        return res.data;
    } catch (error) {
        console.error(`Error processing request ${requestId}:`, error);
        throw error;
    }
};

// Delete request
export const deleteRequest = async (requestId: string): Promise<void> => {
    try {
        await api.delete(`${ENDPOINT}/${requestId}`);
    } catch (error) {
        console.error(`Error deleting request ${requestId}:`, error);
        throw error;
    }
};

// Send email notification for room change request
export const sendRoomChangeEmail = async (
    customerEmail: string,
    customerName: string,
    request: RoomChangeRequestResponse,
    isApproved: boolean,
): Promise<void> => {
    const { sendEmail } = await import('./emailService');

    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const statusText = isApproved ? 'APPROVED' : 'REJECTED';
    const statusIcon = isApproved ? '✅' : '❌';

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
        .room-change { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .room-box { display: inline-block; padding: 15px 25px; background: #f0f0f0; border-radius: 5px; margin: 5px; font-size: 18px; font-weight: bold; }
        .arrow { display: inline-block; margin: 0 10px; font-size: 24px; color: #CCBDA3; }
        .info-box { background: white; padding: 20px; border-left: 4px solid #CCBDA3; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #CCBDA3; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${statusIcon} Room Change Request ${statusText}</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${customerName}</strong>,</p>
            <p>Your room change request has been <strong>${statusText.toLowerCase()}</strong>.</p>
            
            <div class="room-change">
                <h3 style="color: #CCBDA3; margin-top: 0;">Room Change Details</h3>
                <div style="text-align: center; margin: 20px 0;">
                    <span class="room-box">Room ${
                        request.currentRoom?.roomNumber || 'N/A'
                    }</span>
                    <span class="arrow">→</span>
                    <span class="room-box">Room ${
                        request.newRoom?.roomNumber || 'N/A'
                    }</span>
                </div>
            </div>

            <div class="status-badge">${statusText}</div>

            <div class="info-box">
                <p><strong>Request ID:</strong> ${request.requestID}</p>
                <p><strong>Booking ID:</strong> ${
                    request.booking?.bookingID || 'N/A'
                }</p>
                <p><strong>Request Date:</strong> ${new Date(
                    request.requestDate,
                ).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}</p>
                <p><strong>Reason:</strong> ${request.reason}</p>
            </div>

            ${
                request.responseNote
                    ? `<div class="info-box">
                <p><strong>Staff Response:</strong></p>
                <p>${request.responseNote}</p>
            </div>`
                    : ''
            }

            ${
                request.responseDate
                    ? `<p><strong>Response Date:</strong> ${new Date(
                          request.responseDate,
                      ).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                      })}</p>`
                    : ''
            }

            ${
                isApproved
                    ? `<p style="color: #10b981; font-weight: bold;">Your new room ${
                          request.newRoom?.roomNumber || ''
                      } is ready for you! Please contact the front desk for the new room key.</p>`
                    : `<p style="color: #ef4444;">We apologize for any inconvenience. Please contact the front desk if you have any questions.</p>`
            }

            <a href="http://localhost:5173/customer/room-change" class="button">View Room Change Requests</a>
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
        subject: `Room Change Request ${statusText} - ${request.requestID}`,
        htmlContent,
    });
};

export default {
    getAllRequests,
    getRequestById,
    getRequestsByBookingId,
    getRequestsByCustomerId,
    getPendingRequests,
    createRequest,
    processRequest,
    deleteRequest,
    sendRoomChangeEmail,
};
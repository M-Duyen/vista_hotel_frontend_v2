
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../../components/Header';
import RoomChangeForm from '../../components/room/RoomChangeForm';
import type { RoomChangeRequest } from '../../components/room/RoomChangeForm';
import bookingService from '../../services/bookingService';
import type { Booking } from '../../types/Booking';
import { useToast } from '../../hooks/useToast';

// Mock data - Replace with real auth context
const MOCK_BOOKING_ID = 'BOOK002';

const RoomChange: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const { error } = useToast();

    // Check authentication
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
        }
    }, []);

    // Load current booking
    useEffect(() => {
        if (user) {
            loadCurrentBooking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadCurrentBooking = async () => {
        setIsLoading(true);
        try {
            console.log('🔄 Loading current booking...');
            const booking = await bookingService.getBookingById(
                MOCK_BOOKING_ID,
            );
            console.log('✅ Loaded booking:', booking);

            // Check if booking is eligible for room change
            if (
                booking.status !== 'CHECKED_IN' &&
                booking.status !== 'CONFIRMED'
            ) {
                error('Chỉ có thể đổi phòng khi đang ở hoặc đã xác nhận');
                navigate(-1);
                return;
            }

            setCurrentBooking(booking);
        } catch (err) {
            console.error('❌ Error loading booking:', err);
            error('Không thể tải thông tin đặt phòng');
            navigate(-1);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitRoomChange = async (data: RoomChangeRequest) => {
        try {
            console.log('📝 Submitting room change request:', data);

            // TODO: Call API to submit room change request
            // For now, just simulate success
            await new Promise((resolve) => setTimeout(resolve, 1500));

            console.log('✅ Room change request submitted successfully');
            setShowSuccess(true);

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/customer/room');
            }, 3000);
        } catch (err) {
            console.error('❌ Error submitting room change request:', err);
            throw err;
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    // Check if user is logged in and is a customer
    if (!user) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
                    <div className="max-w-4xl mx-auto px-4 py-20">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Yêu cầu đăng nhập
                            </h2>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                Bạn cần đăng nhập với tài khoản khách hàng để sử
                                dụng tính năng đổi phòng.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/auth/login')}
                                    className="bg-[#CCBDA3] text-white hover:bg-[#b8a88a] px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Đăng nhập ngay
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-8 py-3 rounded-lg font-semibold transition-all"
                                >
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
                    <div className="max-w-4xl mx-auto px-4 py-20">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Yêu cầu đã được gửi thành công!
                            </h2>
                            <p className="text-gray-600 text-lg mb-2 leading-relaxed">
                                Yêu cầu đổi phòng của bạn đã được gửi đến bộ
                                phận quản lý.
                            </p>
                            <p className="text-gray-500 text-base mb-8">
                                Chúng tôi sẽ xem xét và phản hồi trong thời gian
                                sớm nhất.
                            </p>
                            <button
                                onClick={() => navigate('/customer/room')}
                                className="bg-[#CCBDA3] text-white hover:bg-[#b8a88a] px-8 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                                Về trang phòng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Quay lại</span>
                    </button>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Yêu cầu đổi phòng
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Điền thông tin để yêu cầu đổi sang phòng khác
                        </p>
                    </div>

                    {/* Form Container */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#CCBDA3] mx-auto"></div>
                                </div>
                                <p className="mt-6 text-gray-700 font-semibold text-lg">
                                    Đang tải thông tin...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                            <RoomChangeForm
                                currentBooking={currentBooking || undefined}
                                onSubmit={handleSubmitRoomChange}
                                onCancel={handleCancel}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomChange;

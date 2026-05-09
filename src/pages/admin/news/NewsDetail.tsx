import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getNewsById } from '../../../services/newsService';
import { FaArrowLeft, FaCalendarAlt, FaClock } from 'react-icons/fa';
import type { NewsItem } from '../../../types/News';
import Header from '../../../components/Header';

export default function NewsDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Kiểm tra xem có cần hiển thị header không
    const shouldShowHeader = location.pathname.startsWith('/news/');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                if (!id) return;
                const data = await getNewsById(id);
                setNews(data as NewsItem);
            } catch (err) {
                setError('Không thể tải dữ liệu bài viết.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-gray-600">
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-red-500 mb-4">
                    {error || 'Bài viết không tồn tại.'}
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-[#b9ad96] transition-colors"
                >
                    <FaArrowLeft className="inline mr-2" /> Quay lại
                </button>
            </div>
        );
    }

    return (
        <div>
            {shouldShowHeader && (
                <div className="fixed top-0 left-0 w-full z-[200]">
                    <Header />
                </div>
            )}
            <div
                className={`max-w-5xl mx-auto px-6 py-12 ${
                    shouldShowHeader ? 'pt-24' : ''
                }`}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-[#b9ad96] mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Quay lại
                </button>

                <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-96 object-cover rounded-xl shadow-md mb-8"
                />

                {/* Badge loại nội dung */}
                <div className="mb-4">
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            news.type === 'NEWS'
                                ? 'bg-gray-100 text-black'
                                : news.type === 'EVENT'
                                ? 'bg-[#b9ad96] text-white'
                                : 'bg-black text-white'
                        }`}
                    >
                        {news.type === 'NEWS'
                            ? '📰 Tin tức'
                            : news.type === 'EVENT'
                            ? '🎉 Sự kiện'
                            : '🎁 Khuyến mãi'}
                    </span>
                </div>

                <h1 className="text-4xl font-playfair font-semibold mb-3 text-black">
                    {news.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">{news.subtitle}</p>

                <div className="flex items-center gap-6 mb-6 text-gray-500 text-sm">
                    {/* Luôn hiển thị ngày tạo */}
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt />
                        <span>
                            Ngày tạo:{' '}
                            {new Date(news.createdAt).toLocaleDateString(
                                'vi-VN',
                            )}
                        </span>
                    </div>

                    {/* Chỉ hiển thị thời gian bắt đầu/kết thúc cho EVENT và PROMOTION */}
                    {(news.type === 'EVENT' || news.type === 'PROMOTION') &&
                        news.startDate &&
                        news.endDate && (
                            <>
                                <div className="flex items-center gap-2">
                                    <FaClock />
                                    <span>
                                        Thời gian:{' '}
                                        {new Date(
                                            news.startDate,
                                        ).toLocaleDateString('vi-VN')}{' '}
                                        →{' '}
                                        {new Date(
                                            news.endDate,
                                        ).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>

                                {/* Trạng thái hoạt động */}
                                {(() => {
                                    const now = new Date();
                                    const startDate = new Date(news.startDate);
                                    const endDate = new Date(news.endDate);

                                    if (now < startDate) {
                                        return (
                                            <span className="px-2 py-1 bg-[#b9ad96] text-white text-xs rounded-full">
                                                Sắp diễn ra
                                            </span>
                                        );
                                    } else if (
                                        now >= startDate &&
                                        now <= endDate
                                    ) {
                                        return (
                                            <span className="px-2 py-1 bg-black text-white text-xs rounded-full">
                                                Đang diễn ra
                                            </span>
                                        );
                                    } else {
                                        return (
                                            <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded-full">
                                                Đã kết thúc
                                            </span>
                                        );
                                    }
                                })()}
                            </>
                        )}
                </div>

                <div
                    className="text-gray-700 leading-relaxed prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {news.highlight && (
                    <div className="mt-10 p-4 bg-[#b9ad96] border-l-4 border-black rounded">
                        <p className="font-semibold text-white">
                            🌟{' '}
                            {news.type === 'NEWS'
                                ? 'Đây là tin tức nổi bật!'
                                : news.type === 'EVENT'
                                ? 'Đây là sự kiện đặc biệt!'
                                : 'Đây là khuyến mãi hot!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

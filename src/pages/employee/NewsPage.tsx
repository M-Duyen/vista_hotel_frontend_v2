/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import HeaderHome from '../../components/HeaderHome';
import Header from '../../components/Header';
import bannerImg from '../../assets/images/bg_newPage.png';

import { getAll } from '../../services/newsService';

const NewsPage: React.FC = () => {
    const [showSolidHeader, setShowSolidHeader] = useState(false);
    const bannerRef = useRef<HTMLImageElement>(null);

    const [highlightNews, setHighlightNews] = useState<any | null>(null);
    const [otherNews, setOtherNews] = useState<any[]>([]);
    const [visibleCount, setVisibleCount] = useState(3);

    // EFFECT: Header chuyển dạng
    useEffect(() => {
        const handleScroll = () => {
            if (!bannerRef.current) return;
            const trigger = bannerRef.current.clientHeight * 0.6;
            setShowSolidHeader(window.scrollY > trigger);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 🔥 Hàm xử lý ngày đúng theo type
    const getValidDate = (item: any) => {
        // NEWS → dùng createdAt
        if (item.type === 'NEWS') {
            return item.createdAt
                ? new Date(item.createdAt).getTime()
                : Infinity;
        }
        // EVENT/PROMOTION → dùng startDate
        if (item.startDate) {
            return new Date(item.startDate).getTime();
        }
        return Infinity;
    };

    // FETCH NEWS + tính toán highlight đúng theo yêu cầu mới
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const allNews = await getAll();
                if (!allNews || allNews.length === 0) return;

                const today = new Date().getTime();

                // Lấy tin highlight
                const highlightList = allNews.filter(
                    (n: any) => n.highlight === true,
                );

                let selectedHighlight = null;

                if (highlightList.length > 0) {
                    // Chọn highlight → có ngày gần nhất
                    selectedHighlight = highlightList.sort((a: any, b: any) => {
                        const d1 = Math.abs(getValidDate(a) - today);
                        const d2 = Math.abs(getValidDate(b) - today);
                        return d1 - d2;
                    })[0];
                } else {
                    // Nếu không có highlight → chọn bài gần nhất
                    selectedHighlight = allNews.sort((a: any, b: any) => {
                        const d1 = Math.abs(getValidDate(a) - today);
                        const d2 = Math.abs(getValidDate(b) - today);
                        return d1 - d2;
                    })[0];
                }

                // Các tin còn lại
                const others = allNews.filter(
                    (n: any) => n.newsId !== selectedHighlight.newsId,
                );

                setHighlightNews(selectedHighlight);
                setOtherNews(others);
            } catch (error) {
                console.error('Lỗi khi tải tin tức:', error);
            }
        };

        fetchNews();
    }, []);

    const visibleOthers = otherNews.slice(0, visibleCount);

    return (
        <div className="bg-white text-slate-800 font-sans">
            {/* HEADER */}
            <div className="fixed top-0 left-0 w-full z-[9999] transition-all duration-700">
                <div
                    className={`transition-opacity duration-700 ${
                        showSolidHeader
                            ? 'opacity-0 pointer-events-none'
                            : 'opacity-100'
                    }`}
                >
                    <HeaderHome />
                </div>

                <div
                    className={`absolute top-0 left-0 w-full transition-opacity duration-700 ${
                        showSolidHeader
                            ? 'opacity-100'
                            : 'opacity-0 pointer-events-none'
                    }`}
                >
                    <Header />
                </div>
            </div>

            {/* BANNER */}
            <img
                ref={bannerRef}
                src={bannerImg}
                alt="News Banner"
                className="w-full h-screen object-cover"
            />

            <main>
                {/* NỔI BẬT */}
                <section className="mx-auto max-w-3xl px-4 mt-10">
                    <div className="flex justify-center">
                        <span className="text-[20px] font-serif tracking-[.25em] uppercase">
                            Nổi bật
                        </span>
                    </div>

                    {highlightNews && (
                        <article className="mt-6 overflow-hidden rounded-lg shadow-lg bg-white">
                            <div className="aspect-[21/9]">
                                <img
                                    src={highlightNews.imageUrl}
                                    alt={highlightNews.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-5 md:p-6">
                                <p className="text-[11px] uppercase tracking-widest text-slate-400">
                                    {highlightNews.type}
                                </p>

                                <h2 className="mt-1 font-serif text-xl md:text-2xl text-slate-800">
                                    {highlightNews.title}
                                </h2>

                                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                    {highlightNews.subtitle}
                                </p>

                                <div className="mt-4">
                                    <a
                                        href={`/news/${highlightNews.newsId}`}
                                        className="text-[12px] uppercase tracking-widest text-slate-700 hover:text-black inline-flex items-center gap-2 transition-colors"
                                    >
                                        Chi tiết
                                        <span className="inline-block h-px w-6 bg-slate-400" />
                                    </a>
                                </div>
                            </div>
                        </article>
                    )}
                </section>

                {/* KHÁC */}
                <section className="mx-auto max-w-5xl px-4 mt-14">
                    <div className="flex justify-center">
                        <span className="text-[20px] font-serif tracking-[.25em] uppercase">
                            Khác
                        </span>
                    </div>

                    {visibleOthers.map((news, index) => (
                        <article
                            key={news.newsId}
                            className="mt-10 grid md:grid-cols-2 gap-10 items-center"
                        >
                            <div
                                className={`aspect-[4/3] rounded-lg overflow-hidden shadow-lg ${
                                    index % 2 === 1 ? 'md:order-2' : ''
                                }`}
                            >
                                <img
                                    src={news.imageUrl}
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div
                                className={`${
                                    index % 2 === 1 ? 'md:order-1' : ''
                                }`}
                            >
                                <h3 className="font-serif text-lg md:text-xl">
                                    {news.title}
                                </h3>

                                <p className="mt-2 mb-3 text-sm leading-7 text-slate-600">
                                    {news.subtitle}
                                </p>

                                <a
                                    href={`/news/${news.newsId}`}
                                    className="text-xs tracking-wide uppercase px-4 py-1 rounded-full border border-black hover:text-white hover:bg-black transition"
                                >
                                    Chi tiết
                                </a>
                            </div>
                        </article>
                    ))}

                    {/* BUTTON XEM THÊM */}
                    <div className="py-10 flex justify-center">
                        {visibleCount < otherNews.length ? (
                            <button
                                onClick={() =>
                                    setVisibleCount((prev) => prev + 3)
                                }
                                className="text-sm uppercase tracking-widest px-5 py-2 rounded-full border border-black hover:bg-black hover:text-white transition"
                            >
                                Xem thêm
                            </button>
                        ) : (
                            <p className="text-xs text-gray-500">
                                Không còn bài viết...
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default NewsPage;

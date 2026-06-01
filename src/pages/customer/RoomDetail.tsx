/*eslint-disable */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Room } from '../../types/Room';
import { getById } from '../../services/roomService';
import Header from '../../components/Header';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Review } from '../../types/Review';
import { getReviewsWithCustomerByRoomNumber } from '../../services/reviewService';
import ReviewNode from '../../components/review/ReviewNode';

export default function RoomDetail() {
    const { id } = useParams<{ id: string }>();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [index, setIndex] = useState(0);

    // reviewsData: array of { customer?: any, review: Review }
    const [reviewsData, setReviewsData] = useState<
        { customer?: any; review: Review }[]
    >([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState<string | null>(null);

    // REVIEW STATS: chỉ tính từ reviews có flag = true (customer reviews)
    const reviewStats = useMemo(() => {
        const mainReviews = reviewsData.filter(
            (e) => (e.review as any).flag === true,
        );
        const count = mainReviews.length;
        const sum = mainReviews.reduce(
            (s, e) => s + ((e.review as any).rating ?? 0),
            0,
        );
        const avg = count ? +(sum / count).toFixed(1) : 0;
        return { count, avg };
    }, [reviewsData]);

    useEffect(() => {
        let mounted = true;
        if (id) {
            getById(id)
                .then((data) => mounted && setRoom(data))
                .catch(() => setError('Failed to fetch room'))
                .finally(() => mounted && setLoading(false));
        }
        return () => {
            mounted = false;
        };
    }, [id]);

    // fetch reviews for this room
    useEffect(() => {
        if (!id) return;
        let mounted = true;
        setReviewsLoading(true);
        setReviewsError(null);

        // API trả về array of { customer: {...}, review: {...} }
        getReviewsWithCustomerByRoomNumber(id)
            .then((data) => {
                if (!mounted) return;
                console.log('Reviews data received:', data);
                // Transform data nếu cần
                if (Array.isArray(data)) {
                    const transformedData = data.map((item: any) => {
                        // Nếu data đã có structure { customer, review }
                        if (
                            item.customer !== undefined &&
                            item.review !== undefined
                        ) {
                            return item;
                        }
                        // Nếu data chỉ là array of reviews
                        return { customer: null, review: item };
                    });
                    setReviewsData(transformedData);
                } else {
                    setReviewsData([]);
                }
            })
            .catch((err) => {
                if (!mounted) return;
                console.error('Error loading reviews:', err);
                setReviewsError(
                    (err as Error)?.message || 'Failed to load reviews',
                );
            })
            .finally(() => {
                if (!mounted) return;
                setReviewsLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [id]);

    const images = useMemo(
        () => (room?.images && (room.images as string[])) || [],
        [room],
    );

    // Auto slide
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((i) => (images.length ? (i + 1) % images.length : 0));
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length]);

    if (loading) return <div className="p-8 text-center">Loading room…</div>;
    if (error)
        return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!room) return <div className="p-8 text-center">Room not found.</div>;

    // quick amenities array (moved out of JSX to avoid TSX parse issues)
    const quickAmenities = [
        'Premium bedding with goose down option',
        'Curated pillow menu',
        'Marble bathroom with rain shower',
        'In-room safe & minibar',
        'High-speed WiFi',
        'Complimentary breakfast',
    ];

    return (
        <div className="bg-white font-sans">
            <div className="fixed top-0 left-0 w-full z-[200]">
                <Header />
            </div>

            {/* HERO SECTION */}
            <div className="relative w-full h-[75vh] overflow-hidden ">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{
                        backgroundImage: `url(${images[index] || '/placeholder.svg'})`,
                    }}
                />

                {/* Left Arrow */}
                <button
                    onClick={() =>
                        setIndex((prev) =>
                            prev === 0 ? images.length - 1 : prev - 1,
                        )
                    }
                    className="absolute left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 transition z-30"
                >
                    <ChevronLeft size={30} className="text-white" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={() =>
                        setIndex((prev) =>
                            images.length ? (prev + 1) % images.length : 0,
                        )
                    }
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 transition z-30"
                >
                    <ChevronRight size={30} className="text-white" />
                </button>
            </div>

            <div className="flex flex-col items-center mt-16 font-serif">
                <h1 className="text-3xl font-serif ">
                    Duplex One Bedroom Suite
                </h1>
                <p className="text-lg mt-3 text-center font-serif ">
                    Experience contemporary comfort and breathtaking views
                    overlooking the Gulf in this generously sized 170 sqm Duplex
                    Suite.
                </p>
            </div>

            {/* IMAGE COLLAGE (large left + 4 small right) */}
            <div className="w-full mt-20 mb-8  z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Large left image */}
                        <div className="md:col-span-1">
                            <div className=" overflow-hidden shadow-2xl">
                                <img
                                    src={images[0] ?? '/placeholder.svg'}
                                    alt="room large"
                                    className="w-full h-[420px] object-cover"
                                />
                            </div>
                        </div>

                        {/* Right small images */}
                        <div className="grid grid-cols-2 gap-6">
                            {images.slice(1, 5).map((img, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden shadow-lg"
                                >
                                    <img
                                        src={img ?? '/placeholder.svg'}
                                        alt={`thumb ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILS: At a glance / Amenities / Highlights */}
            <div className="container mx-auto px-6 pb-16">
                {/* At a glance */}
                <section className="max-w-5xl mx-auto mb-10">
                    <h3 className="text-2xl font-semibold mb-4">
                        Room Details
                    </h3>
                    <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm text-gray-600 mb-3">
                                At a glance
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                    <div className="font-medium">Size</div>
                                    <div className="mt-1">170 sqm</div>
                                </div>
                                <div>
                                    <div className="font-medium">Occupancy</div>
                                    <div className="mt-1">
                                        Up to {room.roomType?.maxOccupancy ?? 3}{' '}
                                        adults
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">Beds</div>
                                    <div className="mt-1">
                                        King-size bed or twin
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">View</div>
                                    <div className="mt-1">
                                        Dubai Skyline / Ocean View
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amenities quick list */}
                        <div>
                            <h4 className="text-sm text-gray-600 mb-3">
                                Amenities
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                                {quickAmenities.map((a) => (
                                    <li
                                        key={a}
                                        className="flex items-start gap-2"
                                    >
                                        <span className="mt-1 text-amber-400">
                                            ✓
                                        </span>
                                        <span>{a}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Amenities (detailed) */}
                <section className="max-w-5xl mx-auto mb-10">
                    <h3 className="text-xl font-semibold mb-4">
                        Amenities (detailed)
                    </h3>
                    <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Premium Drouault bedding with your choice of
                                    feather, goose down or anti-allergy filling
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Curated pillow menu for personalised comfort
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Spacious marble bathroom with rain shower
                                    and full-size bathtub
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    High-speed WiFi and in-room entertainment
                                </span>
                            </li>
                        </ul>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>Dyson Supersonic hair dryer</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>Private bar experience on request</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Complimentary access to fitness center
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>24/7 butler and concierge service</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Highlights */}
                <section className="max-w-5xl mx-auto mb-6">
                    <h3 className="text-xl font-semibold mb-4">Highlights</h3>
                    <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Floor-to-ceiling windows with panoramic
                                    views
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Duplex suite with soundproof living and
                                    sleeping areas
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Daily serenity sip and evening turndown
                                    service
                                </span>
                            </li>
                        </ul>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Access to private beach and infinity pool
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Complimentary access to kids club and family
                                    activities
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-amber-400 mt-1">✓</span>
                                <span>
                                    Dedicated butler service upon request
                                </span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* REVIEWS - enhanced layout */}
                <section className="max-w-5xl mx-auto mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">
                            Customer reviews
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-baseline gap-2">
                                <div className="text-2xl font-bold">
                                    {reviewStats.avg || '—'}
                                </div>
                                <div className="text-sm text-gray-500">/5</div>
                            </div>
                            <div className="text-sm text-gray-600">
                                {reviewStats.count} reviews
                            </div>
                        </div>
                    </div>

                    {reviewsLoading && (
                        <div className="text-sm text-gray-600">
                            Loading reviews…
                        </div>
                    )}
                    {reviewsError && (
                        <div className="text-sm text-red-600">
                            {reviewsError}
                        </div>
                    )}

                    {/* List - chỉ render reviews có flag = true */}
                    <div className="grid grid-cols-1 gap-6">
                        {reviewsData
                            .filter((entry) => {
                                const rev = entry.review;
                                const hasFlag = (rev as any).flag === true;
                                return hasFlag;
                            })
                            .map((entry, idx) => {
                                console.log(
                                    'Rendering review:',
                                    entry.review.reviewID,
                                );
                                return (
                                    <ReviewNode
                                        key={entry.review.reviewID ?? idx}
                                        entry={entry}
                                    />
                                );
                            })}{' '}
                    </div>
                </section>
            </div>
        </div>
    );
}

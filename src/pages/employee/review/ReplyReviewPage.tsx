/* eslint-disable*/
import type React from "react";
import { useEffect, useState } from "react";
import type { Review } from "../../../types/Review";
import { ChevronRight } from "lucide-react";
import ReplyModal from "./ReplyModal";
import ReviewItem from "./ReviewItem";
import { getAllRooms } from "../../../services/roomService";
import type { Room } from "../../../types/Room";
import {
  getBookingByReviewId,
  getReviewsWithCustomerByRoomNumber,
  saveReview,
} from "../../../services/reviewService";
import { useToastContext } from "../../../hooks/useToastContext";

const ReplyReviewsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsByRoom, setReviewsByRoom] = useState<Record<string, Review[]>>(
    {}
  );
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "unreplied">(
    "unreplied"
  );
  const toast = useToastContext();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const roomData = await getAllRooms();
      setRooms(roomData);

      // Fetch reviews for all rooms and group by room number
      const reviewsByRoomData: Record<string, Review[]> = {};
      await Promise.all(
        roomData.map(async (room: Room) => {
          if (!room.roomNumber) return;

          const roomNumber = room.roomNumber;
          try {
            const response = await getReviewsWithCustomerByRoomNumber(
              roomNumber
            );
            if (response && response.length > 0) {
              // Chuyển API response: { customer, review } -> Review nhúng customer
              const transformedReviews = response.map((item: any) => ({
                ...item.review,
                customer: item.customer,
              }));
              reviewsByRoomData[roomNumber] = transformedReviews;
            }
          } catch (err) {
            console.error(
              `Error fetching reviews for room ${roomNumber}:`,
              err
            );
          }
        })
      );
      setReviewsByRoom(reviewsByRoomData);

      setLoading(false);
      setError("");
    } catch (err) {
      console.log(err);
      setError("Failed to load rooms: " + err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter reviews based on reply status
  const getFilteredReviews = (reviews: Review[]): Review[] => {
    if (filterStatus === "unreplied") {
      return reviews.filter(
        (review) => !review.replies || review.replies.length === 0
      );
    }
    return reviews;
  };

  // Count unreplied reviews for a room
  const countUnrepliedReviews = (reviews: Review[]): number => {
    return reviews.filter(
      (review) => !review.replies || review.replies.length === 0
    ).length;
  };

  const handleReplyClick = (review: Review) => {
    setSelectedReview(review);
    setIsReplyModalOpen(true);
  };

  const handleSubmitReply = async (replyText: string) => {
    setLoading(true);
    try {
      if (!selectedReview) return;

      // Tạo reply request - CHỈ gửi parentReviewId, KHÔNG gửi object
      const newReply = {
        reviewID: "", // Backend sẽ tự động generate
        rating: 0,
        roomQuality: 0,
        serviceQuality: 0,
        location: 0,
        valueForMoney: 0,
        isAnonymous: false,
        comment: replyText,
        reviewDate: new Date().toISOString(),
        flag: false,
        images: [],
        parentReviewId: selectedReview.reviewID, // CHỈ gửi ID, không gửi object
      };

      setIsReplyModalOpen(false);
      setSelectedReview(null);

      // Lấy thông tin booking để biết bookingId và roomNumber
      const res = await getBookingByReviewId(selectedReview.reviewID);

      // Lưu reply mới
      await saveReview(newReply, res.bookingId, res.roomNumber);

      // Refresh lại dữ liệu sau khi lưu
      await fetchData();

      setLoading(false);
      toast.success("Reply submitted successfully");
    } catch (err) {
      console.log("Error saving reply ", err);
      setLoading(false);
      toast.error("Failed to save reply");
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <span className="text-gray-600">Dashboard</span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Customer Reviews</span>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Customer Reviews Management
            </h1>
            <p className="text-gray-600">
              Review and respond to customer feedback for continuous improvement
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setFilterStatus("unreplied")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "unreplied"
                  ? "bg-[#d4c5b9] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Unreplied Only
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-[#d4c5b9] text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All Reviews
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4c5b9] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading reviews...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Reviews by Room */}
          {!loading && !error && (
            <div className="space-y-6">
              {Object.keys(reviewsByRoom).length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-600">No reviews found</p>
                </div>
              ) : (
                Object.entries(reviewsByRoom).map(([roomNumber, reviews]) => {
                  // Lọc reviews có flag = true (review chính, không phải reply)
                  const mainReviews = reviews.filter(
                    (review) => review.flag === true
                  );

                  // Lọc theo filter status (unreplied/all)
                  const filteredReviews = getFilteredReviews(mainReviews);

                  const unrepliedCount = countUnrepliedReviews(mainReviews);
                  const room = rooms.find((r) => r.roomNumber === roomNumber);

                  // Skip room nếu không có review nào match filter
                  // Hoặc nếu là "unreplied" mode và không còn review chưa reply
                  if (filteredReviews.length === 0) return null;

                  return (
                    <div
                      key={roomNumber}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      {/* Room Header */}
                      <div className="bg-gradient-to-r from-[#d4c5b9] to-[#c4b5a9] px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              Room {roomNumber}
                            </h2>
                            <p className="text-white/90 text-sm mt-1">
                              {room?.roomType?.typeName || "Unknown Type"} •
                              Floor {room?.floor || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                              <span className="text-white font-semibold">
                                {mainReviews.length}{" "}
                                {mainReviews.length === 1
                                  ? "Review"
                                  : "Reviews"}
                              </span>
                            </div>
                            {unrepliedCount > 0 && (
                              <div className="bg-red-500 px-3 py-1 rounded-full">
                                <span className="text-white text-sm font-bold">
                                  {unrepliedCount} Unreplied
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="divide-y divide-gray-200">
                        {filteredReviews.map((review) => (
                          <div key={review.reviewID} className="p-6">
                            <ReviewItem
                              review={review}
                              onReplyClick={() => handleReplyClick(review)}
                              hasReplies={(review.replies?.length || 0) > 0}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              {/* No reviews match filter message */}
              {Object.keys(reviewsByRoom).length > 0 &&
                Object.entries(reviewsByRoom).every(
                  ([_, reviews]) => getFilteredReviews(reviews).length === 0
                ) && (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600">
                      {filterStatus === "unreplied"
                        ? "No unreplied reviews found. Great job!"
                        : "No reviews found"}
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      </main>

      {/* Reply Modal */}
      {selectedReview && (
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          onSubmit={handleSubmitReply}
          parentReview={selectedReview}
        />
      )}
    </div>
  );
};

export default ReplyReviewsPage;

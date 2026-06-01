import { Star, MessageSquare } from "lucide-react";
import type { Review } from "../../../types/Review";

interface ReviewItemProps {
  review: Review;
  onReplyClick: () => void;
  hasReplies: boolean;
}

export default function ReviewItem({
  review,
  onReplyClick,
  hasReplies,
}: ReviewItemProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Hiển thị tên và avatar khách hàng
  const getCustomerName = () => {
    if (review.isAnonymous) return "Anonymous Guest";
    return (
      review.customer?.fullName ||
      review.customer?.userName ||
      review.customerId ||
      "Guest"
    );
  };

  const getCustomerAvatar = () => {
    if (review.isAnonymous || !review.customer?.avatarUrl) {
      // Trả về chữ cái đầu của tên
      const name = getCustomerName();
      return name.charAt(0).toUpperCase();
    }
    return review.customer.avatarUrl;
  };

  const hasAvatar = !review.isAnonymous && review.customer?.avatarUrl;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Main Review */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {hasAvatar ? (
              <img
                src={getCustomerAvatar()}
                alt={getCustomerName()}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0 font-bold">
                {getCustomerAvatar()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900">
                  {getCustomerName()}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Verified
                </span>
                {review.customer?.memberShipLevel && !review.isAnonymous && (
                  <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded font-medium">
                    {review.customer.memberShipLevel}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                {renderStars(review.rating)}
                <span className="text-sm font-semibold text-gray-900">
                  {review.rating ? review.rating.toFixed(1) : "0.0"}
                </span>
              </div>
            </div>
          </div>

          <span className="text-xs text-gray-500">
            {new Date(review.reviewDate).toLocaleDateString()}
          </span>
        </div>

        {/* Rating Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <span className="text-xs text-gray-600">Room Quality</span>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {review.roomQuality ? review.roomQuality.toFixed(1) : "0.0"}/5
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-600">Service</span>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {review.serviceQuality ? review.serviceQuality.toFixed(1) : "0.0"}
              /5
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-600">Location</span>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {review.location ? review.location.toFixed(1) : "0.0"}/5
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-600">Value</span>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {review.valueForMoney ? review.valueForMoney.toFixed(1) : "0.0"}/5
            </div>
          </div>
        </div>

        {/* Comment */}
        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {review.comment}
        </p>

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {review.images.map((img, idx) => (
              <img
                key={idx}
                src={img || "/placeholder.svg"}
                alt={`Review ${idx + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Reply Button */}
        <button
          onClick={onReplyClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#d4c5b9] hover:bg-[#c9b8a8] text-white rounded-lg font-medium transition-colors"
        >
          <MessageSquare size={16} />
          {hasReplies ? "View & Reply" : "Reply"}
        </button>
      </div>

      {/* Replies Section */}
      {review.replies && review.replies.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare size={16} />
            Staff Responses ({review.replies.length})
          </h4>

          {review.replies.map((reply) => (
            <div
              key={reply.reviewID}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#d4c5b9] to-[#c9b8a8] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  E
                </div>
                <div>
                  <span className="font-semibold text-gray-900 text-sm">
                    Hotel Staff
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(reply.reviewDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {reply.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

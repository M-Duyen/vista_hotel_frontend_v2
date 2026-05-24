import { useState } from "react";
import { Star } from "lucide-react";
import type { Review } from "../../../types/Review";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/dialog/Dialog";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (replyText: string) => void;
  parentReview: Review;
}

export default function ReplyModal({
  isOpen,
  onClose,
  onSubmit,
  parentReview,
}: ReplyModalProps) {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (replyText.trim().length === 0) {
      alert("Please enter a reply");
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(replyText);
      setReplyText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-3 py-2">
        <DialogTitle className="text-2xl text-gray-900">
          Reply to Review
        </DialogTitle>
        <p className="text-sm text-gray-500 mt-1">
          Provide a professional response to customer feedback
        </p>

        <div className="space-y-6 px-6 py-4">
          {/* Parent Review Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Customer Review
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(parentReview.rating)}
                  <span className="text-sm font-semibold text-gray-900">
                    {parentReview.rating
                      ? parentReview.rating.toFixed(1)
                      : "0.0"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">
                    Room: {parentReview.roomQuality?.toFixed(1) ?? "0.0"}/5
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    Service: {parentReview.serviceQuality?.toFixed(1) ?? "0.0"}
                    /5
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    Location: {parentReview.location?.toFixed(1) ?? "0.0"}/5
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    Value: {parentReview.valueForMoney?.toFixed(1) ?? "0.0"}/5
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-800 bg-white p-3 rounded border border-blue-300">
                {parentReview.comment?.trim()
                  ? parentReview.comment
                  : "No comment"}
              </p>

              <p className="text-xs text-gray-600">
                {new Date(parentReview.reviewDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Reply Form */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Your Response
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Compose a professional response thanking the guest and addressing their concerns..."
              className="w-full min-h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c5b9] focus:border-transparent resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              {replyText.length} / 1000 characters
            </p>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h5 className="text-xs font-semibold text-yellow-900 mb-2">
              Tips for a Great Response:
            </h5>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• Thank the guest for their feedback</li>
              <li>• Address specific concerns mentioned in the review</li>
              <li>• Offer solutions or explain improvements you've made</li>
              <li>• Maintain a professional and courteous tone</li>
              <li>• Invite them to return in the future</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end px-6 pb-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#d4c5b9] hover:bg-[#c9b8a8] text-white rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || replyText.trim().length === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Reply"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

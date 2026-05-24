/* eslint-disable */
import { useState, useEffect } from "react";
import { Star, Image as ImageIcon, X } from "lucide-react";
import type { BookingDetail } from "../../../types/BookingDetail";
import type { Review } from "../../../types/Review";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/dialog/Dialog";
import StarRating from "../../../components/review/StarRating";
import { formatNumber } from "../../../utils/formatters";
import { useToastContext } from "../../../hooks/useToastContext";

interface ReviewModalProps {
  isOpen: boolean;
  bookingDetail: BookingDetail;
  onClose: () => void;
  onSubmit: (reviewData: unknown) => Promise<void>;
  existingReview?: Review;
}

export default function ReviewModal({
  isOpen,
  bookingDetail,
  onClose,
  onSubmit,
  existingReview,
}: ReviewModalProps) {
  const toast = useToastContext();
  const [roomQuality, setRoomQuality] = useState(
    existingReview?.roomQuality || 0
  );
  const [serviceQuality, setServiceQuality] = useState(
    existingReview?.serviceQuality || 0
  );
  const [location, setLocation] = useState(existingReview?.location || 0);
  const [valueForMoney, setValueForMoney] = useState(
    existingReview?.valueForMoney || 0
  );
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isAnonymous, setIsAnonymous] = useState(
    existingReview?.isAnonymous || false
  );
  const [images, setImages] = useState<string[]>(existingReview?.images || []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [hoverQuality, setHoverQuality] = useState(0);
  const [hoverService, setHoverService] = useState(0);
  const [hoverLocation, setHoverLocation] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  // Tính overall rating
  const overallRating = () => {
    const ratings = [
      roomQuality,
      serviceQuality,
      location,
      valueForMoney,
    ].filter((r) => r > 0);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / ratings.length) * 10) / 10; // Làm tròn 1 chữ số thập phân
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length + imageFiles.length > 5) {
      toast.warning("You can only upload up to 5 images");
      return;
    }

    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImageUrls]);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const calculatedRating = overallRating();

    if (calculatedRating === 0) {
      toast.warning("Please provide at least one rating");
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({
        rating: calculatedRating,
        roomQuality,
        serviceQuality,
        location,
        valueForMoney,
        comment,
        isAnonymous,
        reviewDate: new Date(),
        images: images,
        imageFiles: imageFiles,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">
            Rate Room {bookingDetail.room.roomNumber}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {bookingDetail.room.roomType?.typeName} •{" "}
            {formatNumber(bookingDetail.roomPrice)}
            {" VND"}
          </p>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          {/* Overall Rating Display */}
          <div className="bg-gradient-to-r from-[#f5f1ed] to-[#faf8f6] p-6 rounded-xl border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Overall Rating
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-5xl font-bold text-gray-900">
                  {overallRating().toFixed(1)}
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={`${
                          star <= Math.round(overallRating())
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated from ratings below
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    Room Quality
                  </label>
                  <span className="text-sm text-gray-600 font-medium">
                    {roomQuality}/5
                  </span>
                </div>
                <StarRating
                  value={roomQuality}
                  onChange={setRoomQuality}
                  onHover={setHoverQuality}
                  onHoverLeave={() => setHoverQuality(0)}
                  hoverValue={hoverQuality}
                />
              </div>
            </div>

            <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    Service Quality
                  </label>
                  <span className="text-sm text-gray-600 font-medium">
                    {serviceQuality}/5
                  </span>
                </div>
                <StarRating
                  value={serviceQuality}
                  onChange={setServiceQuality}
                  onHover={setHoverService}
                  onHoverLeave={() => setHoverService(0)}
                  hoverValue={hoverService}
                />
              </div>
            </div>

            <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    Location
                  </label>
                  <span className="text-sm text-gray-600 font-medium">
                    {location}/5
                  </span>
                </div>
                <StarRating
                  value={location}
                  onChange={setLocation}
                  onHover={setHoverLocation}
                  onHoverLeave={() => setHoverLocation(0)}
                  hoverValue={hoverLocation}
                />
              </div>
            </div>

            <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900">
                    Value for Money
                  </label>
                  <span className="text-sm text-gray-600 font-medium">
                    {valueForMoney}/5
                  </span>
                </div>
                <StarRating
                  value={valueForMoney}
                  onChange={setValueForMoney}
                  onHover={setHoverValue}
                  onHoverLeave={() => setHoverValue(0)}
                  hoverValue={hoverValue}
                />
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Your Review
            </label>
            <textarea
              placeholder="Share your experience with this room..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c5b9] focus:border-transparent resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Photos (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">Upload up to 5 images</p>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 5 && (
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#d4c5b9] hover:bg-gray-50 transition-colors">
                <ImageIcon size={20} className="text-gray-400" />
                <span className="text-sm text-gray-600">Choose images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Anonymous Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 cursor-pointer text-[#d4c5b9] focus:ring-[#d4c5b9] rounded"
            />
            <span className="text-sm text-gray-700">Post as anonymous</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end px-6 pb-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors duration-200"
            disabled={submitting || uploadingImages}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#d4c5b9] hover:bg-[#c9b8a8] text-white rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || uploadingImages}
          >
            {submitting
              ? "Submitting..."
              : uploadingImages
              ? "Uploading images..."
              : "Submit Review"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

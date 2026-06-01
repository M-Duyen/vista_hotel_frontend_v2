/* eslint-disable */
import { useEffect, useState } from "react";
import BookingCard from "./BookingCard";
import ReviewModal from "./ReviewModal";
import type { Review } from "../../../types/Review";
import type { BookingDetail } from "../../../types/BookingDetail";
import { saveReview } from "../../../services/reviewService";
import { uploadReviewImagesToCloudinary } from "../../../services/cloudinaryService";
import { useParams } from "react-router-dom";
import type { Booking } from "../../../types/Booking";
import { getBookingById } from "../../../services/bookingService";
import { useToastContext } from "../../../hooks/useToastContext";

interface ReviewModalState {
  isOpen: boolean;
  bookingDetail: BookingDetail | null;
  bookingID: string | null;
}

export default function ReviewsList() {
  const { id } = useParams();
  const toast = useToastContext();
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [booking, setBooking] = useState<Booking>();
  const [modalState, setModalState] = useState<ReviewModalState>({
    isOpen: false,
    bookingDetail: null,
    bookingID: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!id) {
        console.error("No booking ID found in URL params");
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      const bookingData = await getBookingById(id);
      setBooking(bookingData);

      // Load reviews đã có từ bookingDetails
      const existingReviews: Record<string, Review> = {};
      bookingData.bookingDetails.forEach((bd) => {
        if (bd.review) {
          const reviewKey = `${bookingData.bookingID}-${bd.room.roomNumber}`;
          existingReviews[reviewKey] = bd.review;
        }
      });
      setReviews(existingReviews);

      setLoading(false);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data: " + err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading booking...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-semibold">Error</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-semibold">No Booking Found</p>
        <p className="text-yellow-600 text-sm mt-1">
          Could not find booking with ID: {id}
        </p>
      </div>
    );
  }

  const handleOpenReview = (
    bookingID: string,
    bookingDetail: BookingDetail
  ) => {
    //Không mở modal nếu đã có review
    const reviewKey = `${bookingID}-${bookingDetail.room.roomNumber}`;
    if (reviews[reviewKey]) {
      return;
    }

    setModalState({
      isOpen: true,
      bookingDetail,
      bookingID,
    });
  };

  const handleCloseReview = () => {
    setModalState({
      isOpen: false,
      bookingDetail: null,
      bookingID: null,
    });
  };

  const handleSubmitReview = async (reviewData: any) => {
    if (!modalState.bookingID || !modalState.bookingDetail) {
      toast.error("Missing booking information");
      return;
    }

    try {
      const bookingID = modalState.bookingID;
      const roomNumber = modalState.bookingDetail.room.roomNumber;

      // Upload ảnh đến Cloudinary nếu có
      let imageUrls: string[] = [];
      if (reviewData.imageFiles && reviewData.imageFiles.length > 0) {
        console.log(
          "Uploading",
          reviewData.imageFiles.length,
          "images to Cloudinary..."
        );
        try {
          imageUrls = await uploadReviewImagesToCloudinary(
            reviewData.imageFiles
          );
          console.log("Successfully uploaded image URLs:", imageUrls);
        } catch (uploadError) {
          console.error("Failed to upload images:", uploadError);
          toast.error("Failed to upload images. Please try again.");
          return;
        }
      }

      const reviewPayload = {
        rating: reviewData.rating,
        roomQuality: reviewData.roomQuality,
        serviceQuality: reviewData.serviceQuality,
        location: reviewData.location,
        valueForMoney: reviewData.valueForMoney,
        comment: reviewData.comment,
        isAnonymous: reviewData.isAnonymous,
        images: imageUrls,
        flag: true,
      };

      const savedReview = await saveReview(
        reviewPayload,
        bookingID,
        roomNumber
      );

      console.log("Review saved successfully:", savedReview);

      setReviews((prev) => ({
        ...prev,
        [`${bookingID}-${roomNumber}`]: { ...reviewData, images: imageUrls },
      }));

      toast.success("Review submitted successfully!", { duration: 2000 });
      handleCloseReview();
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <BookingCard
        booking={booking}
        reviews={reviews}
        onReviewClick={(bookingDetail) =>
          handleOpenReview(booking.bookingID, bookingDetail)
        }
      />

      {modalState.isOpen && modalState.bookingDetail && (
        <ReviewModal
          isOpen={modalState.isOpen}
          bookingDetail={modalState.bookingDetail}
          onClose={handleCloseReview}
          onSubmit={handleSubmitReview}
          existingReview={
            reviews[
              `${modalState.bookingID}-${modalState.bookingDetail?.room.roomNumber}`
            ]
          }
        />
      )}
    </div>
  );
}

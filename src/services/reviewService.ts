import type { Customer } from "../types/Customer";
import type { Review } from "../types/Review";
import { getById as getCustomerById } from "./customerService";
import { reviewsApi } from "./apiClient";

export interface CustomerReviewDTO {
  customerId?: string;
  customer?: Customer | null;
  review: Review;
}

type ReviewPayload = Omit<Partial<Review>, "reviewDate"> & {
  parentReviewId?: string;
  reviewDate?: Date | string;
};

const toBackendReviewPayload = (review: ReviewPayload) => {
  const payload: any = { ...review };
  delete payload.customer;
  delete payload.customerId;

  return payload;
};

const hydrateCustomerReviewDTOs = async (
  data: unknown,
): Promise<CustomerReviewDTO[]> => {
  if (!Array.isArray(data)) return [];

  const customerCache = new Map<string, Customer | null>();

  return Promise.all(
    data
      .filter((item: any) => Boolean(item?.review ?? item))
      .map(async (item: any) => {
      const review: Review = item?.review ?? item;
      const customerId =
        item?.customerId ??
        item?.customerID ??
        item?.customer?.id ??
        item?.customer?.customerId ??
        review?.customerId;

      let customer: Customer | null | undefined = item?.customer ?? review?.customer;

      if (!customer && customerId) {
        if (!customerCache.has(customerId)) {
          try {
            customerCache.set(customerId, await getCustomerById(customerId));
          } catch (error) {
            console.warn(`Unable to load customer ${customerId} for review`, error);
            customerCache.set(customerId, null);
          }
        }
        customer = customerCache.get(customerId);
      }

      return {
        customerId,
        customer,
        review: {
          ...review,
          customerId,
          customer: customer ?? undefined,
        },
      };
    }),
  );
};

export const getReviewsByRoomNumber = async (id: string) => {
  try {
    const response = await reviewsApi.get(`/room/${id}`);
    return hydrateCustomerReviewDTOs(response.data);
  } catch (error) {
    console.error("Error fetching room by ID:", error);
    throw error;
  }
};

export const saveReview = async (
  review: ReviewPayload,
  bookingId: string,
  roomNumber: string,
) => {
  try {
    const response = await reviewsApi.post(
      `/save/${bookingId}/${roomNumber}`,
      toBackendReviewPayload(review),
    );
    return response.data;
  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
  }
};

export const getReviewsWithCustomerByRoomNumber = async (
  roomNumber: string,
) => {
  try {
    const response = await reviewsApi.get(`/room/with-customer/${roomNumber}`);
    return hydrateCustomerReviewDTOs(response.data);
  } catch (error) {
    console.error("Error get review:", error);
    throw error;
  }
};

export const getBookingByReviewId = async (reviewID: string) => {
  try {
    const res = await reviewsApi.get(`/booking/${reviewID}`);
    return res.data;
  } catch (err) {
    console.log("Error get booking by review ID:", err);
    throw err;
  }
};

// Category Ratings API
export const getCategoryRatings = async () => {
  try {
    const response = await reviewsApi.get(`/ratings/category`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category ratings:", error);
    throw error;
  }
};

// Sentiment API
export const getSentimentStats = async () => {
  try {
    const response = await reviewsApi.get(`/ratings/sentiment`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sentiment stats:", error);
    throw error;
  }
};

// Rating Trend by Month API (line chart)
export const getRatingTrend = async () => {
  try {
    const response = await reviewsApi.get(`/ratings/trend`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rating trend:", error);
    throw error;
  }
};

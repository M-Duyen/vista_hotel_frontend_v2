import type { Customer } from "./Customer";

export interface Review {
  reviewID: string;
  customerId?: string;
  rating: number;
  roomQuality: number;
  serviceQuality: number;
  location: number;
  valueForMoney: number;
  isAnonymous: boolean;
  comment: string;
  reviewDate: Date;
  flag: boolean;
  images: string[];
  parentReviewId?: string;
  parentReview?: Review;
  replies?: Review[];
  customer?: Customer;
}

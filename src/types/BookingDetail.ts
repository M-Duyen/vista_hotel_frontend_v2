import type { Booking } from "./Booking";
import type { Review } from "./Review";
import type { Room } from "./Room";

export interface BookingDetail {
  room: Room;
  booking: Booking;
  roomPrice: number;
  review: Review;
}

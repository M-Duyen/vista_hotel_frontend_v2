export type ServiceCategory =
  | "FOOD_BEVERAGE"
  | "WELLNESS"
  | "TRANSPORTATION"
  | "RECREATION"
  | "LAUNDRY"
  | string;

export interface Service {
  serviceID: string;
  serviceName: string;
  description: string;
  price: number;
  serviceCategory: ServiceCategory;
  availability: boolean;
  images: string[] | null;
  serviceHours?: string | null;
  bookingServices: string[] | null;
}

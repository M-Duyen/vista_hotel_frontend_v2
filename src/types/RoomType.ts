export interface RoomType {
  roomTypeID?: string;
  typeName?: string;
  description?: string;
  area?: number;
  maxOccupancy?: number;
  amenties?: string[];
  basePrice?: number;
  [key: string]: unknown;
}

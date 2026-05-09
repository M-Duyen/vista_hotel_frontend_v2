export interface SeasonPrice {
    id: number;
    seasonName: string;
    priceMultiplier: number;
    startDate: string;
    endDate: string;
    description: string;
    roomTypes: string[];
}

// DTO for creating seasonal price with room type associations
export interface PriceDTO {
    seasonalPrice: Partial<SeasonPrice>;
    roomTypeIDs?: string[];
}

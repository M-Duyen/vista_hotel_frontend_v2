export interface SeasonPrice {
    id: number;
    seasonName: string;
    priceMultiplier: number;
    startDate: string;
    endDate: string;
    description: string;
    roomTypes: string[];
}

// DTO used by the backend SeasonalPriceDTO endpoint
export interface SeasonalPriceDTO {
    id?: number;
    seasonName: string;
    priceMultiplier: number;
    startDate: string;
    endDate: string;
    description?: string;
    roomTypeIds: string[];
}

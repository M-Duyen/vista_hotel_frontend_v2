export interface NewsItem {
    newsId: string;
    title: string;
    subtitle: string;
    content: string;
    imageUrl: string;
    createdAt: string;
    startDate?: string | null;
    endDate?: string | null;
    highlight: boolean;
    type: 'NEWS' | 'EVENT' | 'PROMOTION';
}
export interface News {
    id?: string;
    newsId: string;
    title: string;
    subtitle: string;
    content: string;
    imageUrl: string;
    createdAt?: string;
    startDate?: string | null;
    endDate?: string | null;
    highlight: boolean;
    type: 'NEWS' | 'EVENT' | 'PROMOTION';
}

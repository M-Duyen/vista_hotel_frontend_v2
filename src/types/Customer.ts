export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | string;
export type MemberShipLevel =
    | 'BRONZE'
    | 'SILVER'
    | 'GOLD'
    | 'PLATINUM'
    | string;
export type UserRole =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'EMPLOYEE'
    | 'CUSTOMER'
    | 'GUEST'
    | string;

export interface Customer {
    id: string;
    userName: string;
    password: string;
    email: string;
    phone: string;
    avatartUrl: string | null;
    avatarUrl?: string | null;
    username?: string;
    fullName?: string | null;
    address: string;
    userRole: UserRole;
    birthDate: string; // YYYY-MM-DD
    gender: Gender;
    joinedDate: string; // YYYY-MM-DD
    loyaltyPoints: number;
    memberShipLevel: MemberShipLevel;
    reputationPoint: number;
}

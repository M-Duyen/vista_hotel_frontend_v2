export type UserRole = "CUSTOMER" | "EMPLOYEE" | "ADMIN" | string;

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  phone: string;
  fullName: string;
  address: string | null;
  userRole: UserRole;
  avatarUrl?: string | null;

  // Customer specific fields
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  joinedDate?: string;
  loyaltyPoints?: number;
  memberShipLevel?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  reputationPoint?: number;

  // Employee specific fields
  department?: string;
  position?: string;
  salary?: number;
  hireDate?: string;

  // Admin specific fields
  adminLevel?: number;
  permissions?: string[];
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string | null;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

export type FamilyRole = 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: FamilyRole;
  joinedAt: string;
  user: User;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members?: FamilyMember[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  family?: Family;
}

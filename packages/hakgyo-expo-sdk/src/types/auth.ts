export type UserRole = 'MURID' | 'GURU' | 'ADMIN';
export type UserTier = 'FREE' | 'PREMIUM' | 'CUSTOM';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  currentStreak: number;
  xp: number;
  level: number;
  image?: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  // Computed/derived fields (not from API)
  accessTier?: UserTier;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface SignInResponse {
  success: boolean;
  session?: Session;
  error?: string;
}

export interface SignUpResponse {
  success: boolean;
  session?: Session;
  error?: string;
}

export interface SignOutResponse {
  success: boolean;
  error?: string;
}

export interface User {
  id: string;
  privyId?: string;
  walletAddress?: string;
  email?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  creatorTokenAddress?: string;
  followerCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

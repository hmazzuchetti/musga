export enum UserRole {
  SINGER = 'singer',
  DJ = 'dj',
}

export enum LicensingType {
  EXCLUSIVE = 'exclusive',
  NON_EXCLUSIVE = 'non_exclusive',
}

export enum Genre {
  HOUSE = 'house',
  TECHNO = 'techno',
  TRANCE = 'trance',
  DUBSTEP = 'dubstep',
  DRUM_AND_BASS = 'drum_and_bass',
  ELECTRONIC = 'electronic',
  DEEP_HOUSE = 'deep_house',
  PROGRESSIVE = 'progressive',
  AMBIENT = 'ambient',
  DOWNTEMPO = 'downtempo',
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vocal {
  id: string;
  title: string;
  description?: string;
  genre: Genre;
  bpm: number;
  key: string;
  tone: string;
  duration: number; // in seconds
  price: number;
  licensingType: LicensingType;
  filePath: string;
  previewPath: string;
  singerId: string;
  singer: User;
  isExclusive: boolean;
  isSold: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  vocalId: string;
  vocal: Vocal;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  amount: number;
  platformFee: number;
  sellerAmount: number;
  stripePaymentId: string;
  licensingType: LicensingType;
  createdAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  vocalId: string;
  vocal: Vocal;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  user: User;
  totalSales: number;
  totalEarnings: number;
  vocalCount: number;
  averageRating: number;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  bio?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateVocalDto {
  title: string;
  description?: string;
  genre: Genre;
  bpm: number;
  key: string;
  tone: string;
  price: number;
  licensingType: LicensingType;
}

export interface UpdateVocalDto {
  title?: string;
  description?: string;
  genre?: Genre;
  bpm?: number;
  key?: string;
  tone?: string;
  price?: number;
  licensingType?: LicensingType;
}

export interface VocalSearchFilters {
  genre?: Genre;
  minPrice?: number;
  maxPrice?: number;
  minBpm?: number;
  maxBpm?: number;
  key?: string;
  licensingType?: LicensingType;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ErrorResponse {
  message: string;
  statusCode: number;
  timestamp: string;
}
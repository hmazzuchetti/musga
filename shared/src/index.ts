export * from './types';

// Constants
export const PLATFORM_FEE_PERCENTAGE = 0.12; // 12% platform fee
export const PREVIEW_DURATION = 30; // 30 seconds preview
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max file size
export const ALLOWED_AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'aac'];
export const PAGINATION_LIMIT = 20;

// Utility functions
export const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
};

export const calculateSellerAmount = (amount: number): number => {
  return Math.round((amount - calculatePlatformFee(amount)) * 100) / 100;
};

export const validateBpm = (bpm: number): boolean => {
  return bpm >= 60 && bpm <= 200;
};

export const validatePrice = (price: number): boolean => {
  return price >= 5 && price <= 100;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
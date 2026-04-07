export const FLARE_TOKEN_KEY = 'flare_token';
export const FLARE_USER_KEY = 'flare_user';

export const FEED_PAGE_SIZE = 20;

export const CLOUDINARY_UPLOAD_URL = (cloudName: string) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

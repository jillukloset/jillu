export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_LISTING_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

export const MIN_LISTING_IMAGES = 4;
export const MAX_LISTING_IMAGES = 8;

export function extensionForContentType(contentType: string) {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

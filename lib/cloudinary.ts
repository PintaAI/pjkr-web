import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudUrl = process.env.CLOUDINARY_URL;

if (cloudUrl) {
  // Parse CLOUDINARY_URL to extract credentials
  const url = new URL(cloudUrl.replace('cloudinary://', 'https://'));
  cloudinary.config({
    cloud_name: cloudName,
    api_key: url.username,
    api_secret: url.password,
  });
} else if (cloudName && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  // Fallback to individual environment variables
  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.error('Cloudinary configuration missing. Please set CLOUDINARY_URL or individual Cloudinary credentials.');
}

export default cloudinary;

// Upload options for different media types
export const uploadOptions = {
  image: {
    resource_type: 'image' as const,
    folder: 'pjkr/images',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 1200, height: 800, crop: 'limit' }
    ]
  },
  video: {
    resource_type: 'video' as const,
    folder: 'pjkr/videos',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      { width: 1280, height: 720, crop: 'limit' }
    ]
  },
  audio: {
    resource_type: 'video' as const,
    folder: 'pjkr/audio',
  },
  document: {
    resource_type: 'raw' as const,
    folder: 'pjkr/documents',
  }
};

// Helper function to get optimized URL
export function getOptimizedUrl(publicId: string, options?: any) {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  });
}

'use client';

import { CldImage } from 'next-cloudinary';
import { cn } from '@/lib/utils';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  crop?: string;
  gravity?: string;
  quality?: string | number;
  format?: string;
  blur?: number;
  overlay?: string;
  underlay?: string;
  transformation?: any[];
}

export function CloudinaryImage({
  publicId,
  alt,
  width = 800,
  height = 600,
  className,
  fill = false,
  priority = false,
  sizes,
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto',
  format = 'auto'
}: Omit<CloudinaryImageProps, 'blur' | 'overlay' | 'underlay' | 'transformation'>) {
  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-cover', className)}
      fill={fill}
      priority={priority}
      sizes={sizes}
      crop={crop as any}
      gravity={gravity as any}
      quality={quality as any}
      format={format as any}
    />
  );
}

// Predefined transformation presets
export const imagePresets = {
  thumbnail: {
    width: 150,
    height: 150,
    crop: 'thumb',
    gravity: 'face'
  },
  avatar: {
    width: 100,
    height: 100,
    crop: 'thumb',
    gravity: 'face',
    transformation: [
      { radius: 'max' }
    ]
  },
  hero: {
    width: 1200,
    height: 600,
    crop: 'fill',
    gravity: 'auto'
  },
  card: {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto'
  },
  gallery: {
    width: 300,
    height: 300,
    crop: 'fill',
    gravity: 'center'
  }
};

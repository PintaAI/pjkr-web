'use client';

import { useState, useCallback } from 'react';

interface UploadedFile {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  type: string;
}

interface UseMediaUploadOptions {
  maxFiles?: number;
  maxSize?: number; // in MB
  allowedTypes?: ('image' | 'video' | 'audio' | 'document')[];
  onSuccess?: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
}

const getUploadType = (file: File): string => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
};

export function useMediaUpload({
  maxFiles = 5,
  maxSize = 10,
  allowedTypes = ['image', 'video', 'audio', 'document'],
  onSuccess,
  onError
}: UseMediaUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const uploadFiles = useCallback(async (filesToUpload: File[]) => {
    if (uploading) return;

    const validFiles = filesToUpload.filter(file => {
      const type = getUploadType(file);
      const sizeInMB = file.size / (1024 * 1024);
      
      if (!allowedTypes.includes(type as any)) {
        onError?.(`File type ${type} not allowed`);
        return false;
      }
      
      if (sizeInMB > maxSize) {
        onError?.(`File ${file.name} exceeds ${maxSize}MB limit`);
        return false;
      }
      
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      onError?.(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', getUploadType(file));

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        setProgress(((index + 1) / validFiles.length) * 100);
        
        return {
          ...result,
          type: getUploadType(file),
        };
      });

      const results = await Promise.all(uploadPromises);
      const newFiles = [...files, ...results];
      setFiles(newFiles);
      onSuccess?.(newFiles);
      
      return newFiles;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      onError?.(message);
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [files, maxFiles, maxSize, allowedTypes, uploading, onSuccess, onError]);

  const removeFile = useCallback(async (publicId: string) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      if (response.ok) {
        const newFiles = files.filter(file => file.publicId !== publicId);
        setFiles(newFiles);
        onSuccess?.(newFiles);
        return true;
      }
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove file';
      onError?.(message);
      return false;
    }
  }, [files, onSuccess, onError]);

  const clearFiles = useCallback(() => {
    setFiles([]);
    onSuccess?.([]);
  }, [onSuccess]);

  const setExistingFiles = useCallback((existingFiles: UploadedFile[]) => {
    setFiles(existingFiles);
  }, []);

  return {
    files,
    uploading,
    progress,
    uploadFiles,
    removeFile,
    clearFiles,
    setExistingFiles,
  };
}

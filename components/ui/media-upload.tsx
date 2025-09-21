'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileIcon, ImageIcon, VideoIcon, MusicIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UploadedFile {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  type: string;
}

interface MediaUploadProps {
  onUpload?: (files: UploadedFile[]) => void;
  onRemove?: (publicId: string) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  allowedTypes?: ('image' | 'video' | 'audio' | 'document')[];
  className?: string;
  disabled?: boolean;
  existingFiles?: UploadedFile[];
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
  if (type.startsWith('video/')) return <VideoIcon className="h-4 w-4" />;
  if (type.startsWith('audio/')) return <MusicIcon className="h-4 w-4" />;
  return <FileIcon className="h-4 w-4" />;
};

const getUploadType = (file: File): string => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function MediaUpload({
  onUpload,
  onRemove,
  accept = "image/*,video/*,audio/*,.pdf,.doc,.docx",
  maxFiles = 5,
  maxSize = 10,
  allowedTypes = ['image', 'video', 'audio', 'document'],
  className,
  disabled = false,
  existingFiles = []
}: MediaUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const type = getUploadType(file);
      const sizeInMB = file.size / (1024 * 1024);
      
      if (!allowedTypes.includes(type as any)) {
        console.warn(`File type ${type} not allowed`);
        return false;
      }
      
      if (sizeInMB > maxSize) {
        console.warn(`File ${file.name} exceeds ${maxSize}MB limit`);
        return false;
      }
      
      return true;
    });

    if (uploadedFiles.length + validFiles.length > maxFiles) {
      console.warn(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

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
        setUploadProgress(((index + 1) / validFiles.length) * 100);
        
        // Handle new API response structure
        const fileData = result.success ? result.data : result;
        
        return {
          url: fileData.url,
          publicId: fileData.publicId,
          format: fileData.format,
          width: fileData.width,
          height: fileData.height,
          bytes: fileData.bytes,
          type: getUploadType(file),
        };
      });

      const results = await Promise.all(uploadPromises);
      const newFiles = [...uploadedFiles, ...results];
      setUploadedFiles(newFiles);
      onUpload?.(newFiles);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [uploadedFiles, maxFiles, maxSize, allowedTypes, disabled, onUpload]);

  const handleRemove = async (publicId: string) => {
    if (disabled) return;
    
    // Find the file to get its resource_type
    const fileToRemove = uploadedFiles.find(f => f.publicId === publicId);
    const resourceType = fileToRemove?.type === 'image' ? 'image' :
                        fileToRemove?.type === 'video' ? 'video' : 'raw';
    
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId,
          resource_type: resourceType
        }),
      });

      if (response.ok) {
        const newFiles = uploadedFiles.filter(file => file.publicId !== publicId);
        setUploadedFiles(newFiles);
        onRemove?.(publicId);
        onUpload?.(newFiles);
      }
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                // Reset the input value to allow uploading the same file again
                e.target.value = '';
              }
            }}
            className="hidden"
            disabled={disabled}
          />
          
          {/* Show uploaded image instead of upload area if there's an image */}
          {uploadedFiles.length > 0 && uploadedFiles[0].type === 'image' ? (
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={uploadedFiles[0].url}
                  alt="Course thumbnail"
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemove(uploadedFiles[0].publicId)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click to replace image or drag and drop a new one
              </p>
            </div>
          ) : (
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) {
                  fileInputRef.current?.click();
                }
              }}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary underline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!disabled) {
                      fileInputRef.current?.click();
                    }
                  }}
                  disabled={disabled}
                >
                  browse
                </Button>
              </p>
              <p className="text-xs text-muted-foreground">
                Max {maxFiles} files, {maxSize}MB each
              </p>
            </div>
          )}
          
          {uploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-1">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files (only show for non-image files) */}
      {uploadedFiles.length > 0 && uploadedFiles.some(file => file.type !== 'image') && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            file.type !== 'image' && (
              <Card key={file.publicId} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {file.type === 'image' ? (
                      <Image
                        src={file.url}
                        alt="Uploaded"
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center">
                        {getFileIcon(file.format)}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.publicId.split('_').slice(1).join('_')}.{file.format}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {file.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.bytes)}
                        </span>
                        {file.width && file.height && (
                          <span className="text-xs text-muted-foreground">
                            {file.width}×{file.height}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(file.publicId)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}

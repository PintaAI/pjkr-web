'use client';

import { useState } from 'react';
import { MediaUpload } from '@/components/ui/media-upload';
import { CloudinaryImage } from '@/components/media/cloudinary-image';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface UploadedFile {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  type: string;
}

export default function MediaUploadDemo() {
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);

  const {
    files: hookFiles,
    uploading,
    progress,
    uploadFiles,
    removeFile,
    clearFiles
  } = useMediaUpload({
    maxFiles: 3,
    maxSize: 5,
    allowedTypes: ['image', 'video'],
    onSuccess: (files) => {
      toast.success(`Successfully uploaded ${files.length} files`);
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const handleComponentUpload = (files: UploadedFile[]) => {
    setSelectedFiles(files);
    toast.success('Files uploaded via component!');
  };

  const handleHookUpload = async (fileList: FileList) => {
    const files = Array.from(fileList);
    await uploadFiles(files);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Cloudinary Media Upload Demo</h1>
        <p className="text-muted-foreground">
          Test the media upload functionality with Cloudinary integration
        </p>
      </div>

      <Tabs defaultValue="component" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="component">Upload Component</TabsTrigger>
          <TabsTrigger value="hook">Upload Hook</TabsTrigger>
          <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="component" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MediaUpload Component</CardTitle>
              <CardDescription>
                Drag and drop files or click to browse. Supports images, videos, audio, and documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUpload
                onUpload={handleComponentUpload}
                maxFiles={5}
                maxSize={10}
                allowedTypes={['image', 'video', 'audio', 'document']}
                existingFiles={selectedFiles}
              />
            </CardContent>
          </Card>

          {selectedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedFiles.map((file) => (
                  <div key={file.publicId} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{file.publicId}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{file.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(file.bytes / 1024)} KB
                        </span>
                        {file.width && file.height && (
                          <span className="text-sm text-muted-foreground">
                            {file.width}×{file.height}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>useMediaUpload Hook</CardTitle>
              <CardDescription>
                Upload files using the custom hook. Max 3 files, 5MB each. Images and videos only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleHookUpload(e.target.files)}
                  className="hidden"
                  id="hook-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="hook-upload"
                  className="cursor-pointer"
                >
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {uploading ? 'Uploading...' : 'Choose files to upload'}
                    </p>
                    {uploading && (
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {hookFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Uploaded via Hook ({hookFiles.length})</h4>
                    <Button variant="outline" size="sm" onClick={clearFiles}>
                      Clear All
                    </Button>
                  </div>
                  {hookFiles.map((file) => (
                    <div key={file.publicId} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{file.publicId}</p>
                        <Badge variant="secondary">{file.type}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.publicId)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CloudinaryImage Component</CardTitle>
              <CardDescription>
                Optimized image delivery with transformations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFiles.filter(f => f.type === 'image').length > 0 ||
                hookFiles.filter(f => f.type === 'image').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...selectedFiles, ...hookFiles]
                    .filter(file => file.type === 'image')
                    .map((file) => (
                      <div key={file.publicId} className="space-y-2">
                        <CloudinaryImage
                          publicId={file.publicId}
                          alt="Uploaded image"
                          width={300}
                          height={200}
                          className="rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground truncate">
                          {file.publicId}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Upload some images to see them displayed here with Cloudinary optimization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Configure Cloudinary</h4>
            <p className="text-sm text-muted-foreground">
              Add your Cloudinary credentials to your <code>.env</code> file:
            </p>
            <pre className="bg-secondary p-3 rounded text-sm">
              {`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Drag and drop file upload</li>
              <li>Multiple file type support (images, videos, audio, documents)</li>
              <li>File size and count validation</li>
              <li>Progress tracking</li>
              <li>Automatic optimization and transformation</li>
              <li>File deletion and management</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

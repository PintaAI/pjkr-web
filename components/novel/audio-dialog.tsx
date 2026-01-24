"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Upload, Link } from "lucide-react";

interface AudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (audioData: {
    src: string;
    filename?: string;
    size?: number;
    duration?: number;
    autoplay?: boolean;
    loop?: boolean;
  }) => void;
}

export function AudioDialog({ open, onOpenChange, onSubmit }: AudioDialogProps) {
  const [activeTab, setActiveTab] = useState("upload");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const supportedFormats = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/m4a"];
  const maxFileSize = 20 * 1024 * 1024; // 20MB

  const validateFile = (file: File) => {
    if (!supportedFormats.includes(file.type)) {
      setError("Please select a valid audio file (MP3, WAV, OGG, M4A)");
      return false;
    }
    if (file.size > maxFileSize) {
      setError("File size too big (max 20MB)");
      return false;
    }
    return true;
  };

  const validateUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      return pathname.endsWith('.mp3') || pathname.endsWith('.wav') || 
             pathname.endsWith('.ogg') || pathname.endsWith('.m4a');
    } catch {
      return false;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setError("");
        // Create preview URL
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      }
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError("");
    if (validateUrl(value)) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "audio");
      formData.append("folder", "editor");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.url) {
          // Get duration if possible
          let duration = 0;
          if (audioRef.current) {
            audioRef.current.src = result.data.url;
            await new Promise(resolve => {
              audioRef.current!.onloadedmetadata = resolve;
            });
            duration = audioRef.current.duration || 0;
          }

          onSubmit({
            src: result.data.url,
            filename: file.name,
            size: file.size,
            duration,
            autoplay,
            loop,
          });

          // Reset form
          setFile(null);
          setPreviewUrl("");
          setAutoplay(false);
          setLoop(false);
          onOpenChange(false);
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } else {
        const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.error || "Error uploading audio. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!url.trim()) {
      setError("Please enter an audio URL");
      return;
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid audio URL (MP3, WAV, OGG, M4A)");
      return;
    }

    // Get duration if possible
    let duration = 0;
    if (audioRef.current && previewUrl) {
      audioRef.current.src = previewUrl;
      audioRef.current.onloadedmetadata = () => {
        duration = audioRef.current?.duration || 0;
        onSubmit({
          src: url,
          filename: url.split('/').pop() || "Audio",
          duration,
          autoplay,
          loop,
        });
      };
    } else {
      onSubmit({
        src: url,
        filename: url.split('/').pop() || "Audio",
        autoplay,
        loop,
      });
    }

    // Reset form
    setUrl("");
    setPreviewUrl("");
    setAutoplay(false);
    setLoop(false);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (activeTab === "upload") {
      handleUpload();
    } else {
      handleUrlSubmit();
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError("");
    setPreviewUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Add Audio
          </DialogTitle>
          <DialogDescription>
            Upload an audio file or provide a URL to embed audio in your content.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-file">Audio File</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              >
                {file ? (
                  <div className="space-y-2">
                    <Music className="h-8 w-8 mx-auto text-primary" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, OGG, M4A (max 20MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-url">Audio URL</Label>
              <Input
                id="audio-url"
                placeholder="https://example.com/audio.mp3"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Direct link to MP3, WAV, OGG, or M4A file
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <audio
              ref={audioRef}
              src={previewUrl}
              controls
              className="w-full"
            />
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoplay">Autoplay</Label>
            <Switch
              id="autoplay"
              checked={autoplay}
              onCheckedChange={setAutoplay}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="loop">Loop</Label>
            <Switch
              id="loop"
              checked={loop}
              onCheckedChange={setLoop}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || (!file && !url)}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Music className="h-4 w-4 mr-2" />
                Add Audio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

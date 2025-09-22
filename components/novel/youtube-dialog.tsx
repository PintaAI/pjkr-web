"use client";

import { useState } from "react";
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
import { Youtube, ExternalLink } from "lucide-react";

interface YoutubeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
}

export function YoutubeDialog({ open, onOpenChange, onSubmit }: YoutubeDialogProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateYouTubeUrl = (url: string) => {
    return url.includes("youtube.com/watch") || url.includes("youtu.be/") || url.includes("youtube.com/embed/");
  };

  const handleSubmit = () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    onSubmit(url);
    
    // Reset form
    setUrl("");
    setError("");
    onOpenChange(false);
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Embed YouTube Video
          </DialogTitle>
          <DialogDescription>
            Enter a YouTube URL to embed the video in your content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="youtube-url">YouTube URL</Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Supports youtube.com, youtu.be, and embed URLs. Video will use 16:9 aspect ratio and fill the editor width.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Youtube className="h-4 w-4 mr-2" />
            Embed Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
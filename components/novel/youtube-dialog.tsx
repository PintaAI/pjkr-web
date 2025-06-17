"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YoutubeIcon } from "@/components/icons/youtube-icon";
import { Link } from "lucide-react";

interface YoutubeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
}

export function YoutubeDialog({ open, onOpenChange, onSubmit }: YoutubeDialogProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <YoutubeIcon size={20} />
            Tambah Video YouTube
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="gap-4 py-4">
            <div className="gap-2 flex flex-col">
              <Label htmlFor="youtube-url" className="flex items-center gap-2">
                <Link size={16} />
                YouTube URL
              </Label>
              <Input
                id="youtube-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Embed Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

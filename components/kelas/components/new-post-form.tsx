"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pin } from "lucide-react";
import { toast } from "sonner";
import {  TooltipProvider, } from "@/components/ui/tooltip";
import NovelEditor from "@/components/novel/novel-editor";


interface NewPostFormProps {
  kelasId: number;
  kelasTitle?: string;
  onPostCreated: (post: any) => void;
  onCancel: () => void;
  isAuthor?: boolean;
}

const postTypes = [
  { value: "DISCUSSION", label: "Discussion", description: "Start a general discussion" },
  { value: "QUESTION", label: "Question", description: "Ask a question" },
  { value: "ANNOUNCEMENT", label: "Announcement", description: "Make an announcement" },
  { value: "TUTORIAL", label: "Tutorial", description: "Share a tutorial" },
  { value: "SHARE", label: "Share", description: "Share something interesting" },
];

export default function NewPostForm({ kelasId, kelasTitle = "Class", onPostCreated, isAuthor = false,}: NewPostFormProps) {
  const [content, setContent] = useState({ html: "", json: null });
  const [type, setType] = useState("DISCUSSION");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const typeMeta = postTypes.find((t) => t.value === type);
  
  // Auto-generate title based on class and post type
  const generateTitle = () => {
    return `${kelasTitle} - ${typeMeta?.label || type}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.html.trim()) {
      toast.error("Please write something to post");
      return;
    }
    setIsSubmitting(true);
    try {
      const generatedTitle = generateTitle();
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: generatedTitle,
          htmlDescription: content.html.trim(),
          jsonDescription: {
            content: content.html.trim(),
            json: content.json,
          },
          type,
          kelasId,
          isPinned,
        }),
      });
      if (response.ok) {
        const newPost = await response.json();
        onPostCreated(newPost);
        toast.success("Post created successfully!");
        setContent({ html: "", json: null });
        setType("DISCUSSION");
        setIsPinned(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create post");
      }
    } catch {
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full rounded-lg p-4 border bg-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content - Main focus */}
          <div>
            <NovelEditor
              onUpdate={({ html, json }) => setContent({ html, json })}
              className="min-h-[120px] border-0 focus-visible:ring-0"
              placeholder={`Apa yang kamu mau diskusikan di ${kelasTitle}?`}
              showTopToolbar={true}
            />
          </div>

          {/* Bottom section with post types and actions in same row */}
          <div >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Post Types */}
              <div className="flex flex-wrap gap-2">
                {postTypes.map((postType) => (
                  <Badge
                    key={postType.value}
                    variant={type === postType.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setType(postType.value)}
                  >
                    {postType.label}
                  </Badge>
                ))}
              </div>

              {/* Pin toggle and Post button */}
              <div className="flex items-center gap-3">
                {/* Pin toggle - only for authors */}
                {isAuthor && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="pin-toggle"
                      checked={isPinned}
                      onCheckedChange={setIsPinned}
                    />
                    <Label htmlFor="pin-toggle" className="text-sm text-muted-foreground flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      Pin
                    </Label>
                  </div>
                )}

                {/* Post Button */}
                <Button
                  type="submit"
                  disabled={!content.html.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}

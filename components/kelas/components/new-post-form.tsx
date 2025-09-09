"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NewPostFormProps {
  kelasId: number;
  onPostCreated: (post: any) => void;
  onCancel: () => void;
}

const postTypes = [
  { value: "DISCUSSION", label: "Discussion", description: "Start a general discussion" },
  { value: "QUESTION", label: "Question", description: "Ask a question" },
  { value: "ANNOUNCEMENT", label: "Announcement", description: "Make an announcement" },
  { value: "TUTORIAL", label: "Tutorial", description: "Share a tutorial" },
  { value: "SHARE", label: "Share", description: "Share something interesting" },
];

export default function NewPostForm({ kelasId, onPostCreated, onCancel }: NewPostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("DISCUSSION");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeMeta = postTypes.find((t) => t.value === type);

  const handleAddTag = () => {
    const val = newTag.trim();
    if (val && !tags.includes(val) && tags.length < 5) {
      setTags([...tags, val]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          htmlDescription: content.trim(),
          jsonDescription: {
            content: content.trim(),
            tags,
          },
          type,
          kelasId,
          tags,
        }),
      });
      if (response.ok) {
        const newPost = await response.json();
        onPostCreated(newPost);
        toast.success("Post created successfully!");
        setTitle("");
        setContent("");
        setType("DISCUSSION");
        setTags([]);
        setNewTag("");
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Post Type */}
            <div className="space-y-2">
              <label htmlFor="post-type" className="text-sm font-medium">Post Type</label>
              <div className="flex items-center gap-2">
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="post-type" className="w-56">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {postTypes.map((postType) => (
                      <SelectItem key={postType.value} value={postType.value}>
                        <div>
                          <div className="font-medium">{postType.label}</div>
                          <div className="text-xs text-muted-foreground">{postType.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs">
                  {typeMeta?.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{typeMeta?.description}</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="post-title" className="text-sm font-medium">Title *</label>
              <Input
                id="post-title"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              <div className="flex justify-between text-xs text-muted-foreground" aria-live="polite">
                <span>Keep it concise and specific.</span>
                <span>{title.length}/200</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label htmlFor="post-content" className="text-sm font-medium">Content *</label>
              <Textarea
                id="post-content"
                placeholder="Write your post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isSubmitting && title.trim() && content.trim()) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
                className="min-h-[140px]"
                maxLength={5000}
              />
              <div className="flex justify-between text-xs text-muted-foreground" aria-live="polite">
                <span>Press Ctrl/⌘ + Enter to post</span>
                <span>{content.length}/5000</span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="post-tags" className="text-sm font-medium">Tags (optional)</label>
              <div className="flex gap-2">
                <Input
                  id="post-tags"
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  maxLength={20}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!newTag.trim() || tags.length >= 5}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add tag</TooltipContent>
                </Tooltip>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Press Enter to add. Max 5 tags.</span>
                <span>{tags.length}/5</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={!title.trim() || !content.trim() || isSubmitting}
                className={cn("flex-1")}
              >
                {isSubmitting ? "Creating..." : "Create Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
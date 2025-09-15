"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {  TooltipProvider, } from "@/components/ui/tooltip";
import NovelEditor from "@/components/novel/novel-editor";


interface NewPostFormProps {
  kelasId: number;
  kelasTitle?: string;
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

export default function NewPostForm({ kelasId, kelasTitle = "Class", onPostCreated,}: NewPostFormProps) {
  const [content, setContent] = useState({ html: "", json: null });
  const [type, setType] = useState("DISCUSSION");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  const typeMeta = postTypes.find((t) => t.value === type);
  
  // Auto-generate title based on class and post type
  const generateTitle = () => {
    return `${kelasTitle} - ${typeMeta?.label || type}`;
  };

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
        setContent({ html: "", json: null });
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
      <div className="w-full rounded-lg p-4 bg-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content - Main focus */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg text-bold text-muted-foreground">
                apa yang kamu mau diskusikan di {kelasTitle}?
              </span>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {content.html.length}/5000
              </span>
            </div>
            <NovelEditor
              onUpdate={({ html, json }) => setContent({ html, json })}
              className="min-h-[120px] border-0 focus-visible:ring-0"
            />
          </div>

          {/* Bottom section with post types, tags and actions */}
          <div className="space-y-4 pt-2 border-t">
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

            {/* Tags and Actions */}
            <div className="flex items-center justify-between">
              {/* Tags */}
              <Collapsible open={isTagsOpen} onOpenChange={setIsTagsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    # Tags {isTagsOpen ? '−' : '+'}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <Input
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
                        className="h-8"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddTag}
                        disabled={!newTag.trim() || tags.length >= 5}
                        className="h-8"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
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
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Actions */}
              <div className="flex justify-end">
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
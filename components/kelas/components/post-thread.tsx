"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Pin, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import PostDetailSheet from "./post-detail-sheet";
import { cn } from "@/lib/utils";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: number;
  content: string;
  htmlContent?: string | null;
  likeCount: number;
  replyCount: number;
  createdAt: Date;
  isEdited: boolean;
  author: Author;
  replies?: Comment[];
  _count: {
    likes: number;
    replies: number;
  };
}

interface Post {
  id: number;
  title: string;
  htmlDescription: string;
  jsonDescription?: any;
  type: string;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  createdAt: Date;
  author: Author;
  userLiked?: boolean;
  _count: {
    comments: number;
    likes: number;
  };
}

interface PostThreadProps {
  post: Post;
  currentUserId?: string;
}

export default function PostThread({ post, currentUserId }: PostThreadProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(post.userLiked || false);
  const [localLikeCount, setLocalLikeCount] = useState(post._count.likes);
  const [localCommentCount, setLocalCommentCount] = useState(post._count.comments);
  const [expanded, setExpanded] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const isLongContent = useMemo(() => {
    const text = (post.htmlDescription || "").replace(/<[^>]+>/g, "");
    return text.length > 240;
  }, [post.htmlDescription]);

  const handleLike = async () => {
    if (isLiking) return;

    console.log("🔄 Starting like action for post:", post.id);
    setIsLiking(true);
    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLocalLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    try {
      console.log("📡 Making like request to:", `/api/posts/${post.id}/like`);
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Like response status:", response.status);

      if (!response.ok) {
        // Log the error details
        const errorText = await response.text();
        console.error("❌ Like request failed:", response.status, errorText);
        
        // revert on failure
        setLiked(!nextLiked);
        setLocalLikeCount((prev) => prev + (nextLiked ? -1 : 1));
        toast.error(`Failed to like post: ${response.status}`);
      } else {
        // optional: trust server status
        const data = await response.json().catch((err) => {
          console.error("❌ Failed to parse like response:", err);
          return null;
        });
        console.log("✅ Like response data:", data);
        
        if (data && typeof data.liked === "boolean") {
          setLiked(data.liked);
          setLocalLikeCount((prev) =>
            data.liked ? Math.max(prev, 1) : Math.max(prev, 0)
          );
          console.log("✅ Like action completed. New state:", { liked: data.liked });
        }
      }
    } catch (error) {
      console.error("❌ Like request error:", error);
      setLiked(!nextLiked);
      setLocalLikeCount((prev) => prev + (nextLiked ? -1 : 1));
      toast.error("Failed to like post - network error");
    } finally {
      setIsLiking(false);
      console.log("🔄 Like action finished");
    }
  };

  const getAuthorInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "announcement":
        return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-300";
      case "question":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-300";
      case "tutorial":
        return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-300";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-300";
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.href.split("#")[0]}#post-${post.id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <Card
        id={`post-${post.id}`}
        className="overflow-hidden border-b rounded-none shadow-none m-0 cursor-pointer rounded-t-lg hover:bg-muted/50 transition-colors"
        onClick={() => setIsDetailSheetOpen(true)}
      >
        <CardContent>
          {/* Post Header - Twitter-like */}
          <div className="flex gap-3">
            {/* Avatar - Clickable */}
            <Link
              href={`/profile/${post.author.id}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <Avatar className="w-10 h-10 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                <AvatarImage src={post.author.image || ""} alt={post.author.name || "Unknown"} />
                <AvatarFallback>{getAuthorInitials(post.author.name)}</AvatarFallback>
              </Avatar>
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Author and metadata */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Link
                  href={`/profile/${post.author.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {post.author.name || "Unknown User"}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                {post.isPinned && (
                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-200">
                    <Pin className="w-3 h-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                <Badge variant="outline" className={cn("text-xs", getTypeColor(post.type))}>
                  {post.type}
                </Badge>
                {post.viewCount > 0 && (
                  <span className="inline-flex items-center text-xs text-muted-foreground ml-auto">
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    {post.viewCount}
                  </span>
                )}
              </div>

              {/* Post Content */}
              <div className="mb-3">
                <div className="relative">
                  <div
                    className={cn(
                      "prose prose-lg dark:prose-invert prose-headings:font-title font-default max-w-full text-[15px] leading-relaxed text-foreground transition-[max-height]",
                      !expanded && "max-h-40 overflow-hidden"
                    )}
                    dangerouslySetInnerHTML={{ __html: post.htmlDescription }}
                  />
                  {!expanded && isLongContent && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
                  )}
                </div>

                {isLongContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 p-0 h-auto text-primary hover:text-primary/80 cursor-pointer pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded((v) => !v);
                    }}
                    type="button"
                  >
                    {expanded ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>

              {/* Post Actions - Twitter-like */}
              <div className="flex items-center gap-1 max-w-md relative z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDetailSheetOpen(true);
                  }}
                  className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 cursor-pointer pointer-events-auto"
                  type="button"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {localCommentCount > 0 && <span className="text-sm">{localCommentCount}</span>}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLike();
                  }}
                  disabled={isLiking}
                  className={cn(
                    "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer pointer-events-auto",
                    liked && "text-red-500",
                    isLiking && "opacity-50"
                  )}
                  aria-pressed={liked}
                  aria-label={liked ? "Unlike post" : "Like post"}
                  type="button"
                >
                  <Heart className={cn("w-4 h-4 mr-1", liked && "fill-red-500")} />
                  {localLikeCount > 0 && <span className="text-sm">{localLikeCount}</span>}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 cursor-pointer pointer-events-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare();
                  }}
                  type="button"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Sheet */}
      <PostDetailSheet
        post={post}
        currentUserId={currentUserId}
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
      />
    </>
  );
}


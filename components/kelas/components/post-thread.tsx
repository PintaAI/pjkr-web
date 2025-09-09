"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Share2, Pin, MoreHorizontal, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CommentItem from "./comment-item";
import { AnimatePresence, motion } from "framer-motion";
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(false); // TODO: wire actual like status from API
  const [localLikeCount, setLocalLikeCount] = useState(post._count.likes);
  const [localCommentCount, setLocalCommentCount] = useState(post._count.comments);
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const commentsRef = useRef<HTMLDivElement | null>(null);

  const isLongContent = useMemo(() => {
    const text = (post.htmlDescription || "").replace(/<[^>]+>/g, "");
    return text.length > 240;
  }, [post.htmlDescription]);

  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      } else {
        toast.error("Failed to load comments");
      }
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments, comments.length, fetchComments]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          htmlContent: newComment,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData, ...comments]);
        setLocalCommentCount(prev => prev + 1);
        setNewComment("");
        toast.success("Comment posted successfully!");
      } else {
        toast.error("Failed to post comment");
      }
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReply = async (commentId: number, content: string) => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          htmlContent: content,
          parentId: commentId,
        }),
      });

      if (response.ok) {
        const newReply = await response.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newReply],
                  _count: {
                    ...comment._count,
                    replies: comment._count.replies + 1,
                  },
                }
              : comment
          )
        );
        setLocalCommentCount(prev => prev + 1);
      } else {
        throw new Error("Failed to post reply");
      }
    } catch (error) {
      throw error as Error;
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLocalLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // revert on failure
        setLiked(!nextLiked);
        setLocalLikeCount((prev) => prev + (nextLiked ? -1 : 1));
        toast.error("Failed to like post");
      } else {
        // optional: trust server status
        const data = await response.json().catch(() => null);
        if (data && typeof data.liked === "boolean") {
          setLiked(data.liked);
          setLocalLikeCount((prev) =>
            data.liked ? Math.max(prev, 1) : Math.max(prev, 0)
          );
        }
      }
    } catch {
      setLiked(!nextLiked);
      setLocalLikeCount((prev) => prev + (nextLiked ? -1 : 1));
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to like comment");
      }
    } catch (error) {
      throw error as Error;
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
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "question":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "tutorial":
        return "bg-green-500/10 text-green-700 border-green-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const toggleComments = () => {
    const willShow = !showComments;
    setShowComments(willShow);
    if (willShow) {
      // Scroll into view for better UX
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
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
    <TooltipProvider>
      <Card id={`post-${post.id}`} className="overflow-hidden">
        <CardContent>
          {/* Post Header */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.image || ""} alt={post.author.name || "Unknown"} />
              <AvatarFallback>{getAuthorInitials(post.author.name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium">{post.author.name || "Unknown User"}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  {post.viewCount > 0 && (
                    <span className="inline-flex items-center text-xs text-muted-foreground">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {post.viewCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {post.isPinned && (
                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-200">
                    <Pin className="w-3 h-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                <Badge variant="outline" className={cn("text-xs", getTypeColor(post.type))}>
                  {post.type}
                </Badge>
              </div>
            </div>

            {currentUserId === post.author.id && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Post actions</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>

            <div className="relative">
              <div
                className={cn(
                  "prose prose-sm max-w-none transition-[max-height]",
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
                className="mt-2 text-muted-foreground hover:text-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center gap-2 py-2 border-t">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    liked && "text-red-500"
                  )}
                  aria-pressed={liked}
                  aria-label={liked ? "Unlike post" : "Like post"}
                >
                  <Heart className={cn("w-4 h-4 mr-2", liked && "fill-red-500 text-red-500")} />
                  {localLikeCount > 0 ? localLikeCount : "Like"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Like</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleComments}
                  className="text-muted-foreground hover:text-foreground"
                  aria-expanded={showComments}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {localCommentCount > 0 ? localCommentCount : "Comment"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showComments ? "Hide comments" : "Show comments"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                 
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy link</TooltipContent>
            </Tooltip>
          </div>

          {/* Comments Section */}
          <AnimatePresence initial={false}>
            {showComments && (
              <motion.div
                key="comments"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div ref={commentsRef} className="mt-4 space-y-4">
                  {/* New Comment Form */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && newComment.trim() && !isSubmittingComment) {
                          e.preventDefault();
                          handleCommentSubmit();
                        }
                      }}
                      className="min-h-[80px]"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim() || isSubmittingComment}
                        size="sm"
                      >
                        {isSubmittingComment ? "Posting..." : "Comment"}
                      </Button>
                      <span className="text-xs text-muted-foreground">Ctrl/⌘ + Enter</span>
                    </div>
                  </div>

                  {/* Comments List */}
                  {isLoadingComments ? (
                    <div className="space-y-3">
                      <CommentSkeleton />
                      <CommentSkeleton />
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          currentUserId={currentUserId}
                          onReply={handleReply}
                          onLike={handleCommentLike}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
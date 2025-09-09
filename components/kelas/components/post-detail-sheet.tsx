"use client";

import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart,  Share2, Pin, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CommentItem from "./comment-item";
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

interface PostDetailSheetProps {
  post: Post | null;
  currentUserId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostDetailSheet({ post, currentUserId, isOpen, onOpenChange }: PostDetailSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(post?.userLiked || false);
  const [localLikeCount, setLocalLikeCount] = useState(post?._count.likes || 0);
  const [localCommentCount, setLocalCommentCount] = useState(post?._count.comments || 0);

  // Update state when post changes
  useEffect(() => {
    if (post) {
      setLiked(post.userLiked || false);
      setLocalLikeCount(post._count.likes);
      setLocalCommentCount(post._count.comments);
    }
  }, [post]);

  const fetchComments = useCallback(async () => {
    if (!post) return;

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
  }, [post]);

  useEffect(() => {
    if (isOpen && post && comments.length === 0) {
      fetchComments();
    }
  }, [isOpen, post, comments.length, fetchComments]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !post) return;

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
    if (!post) return;

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
    if (isLiking || !post) return;

    setIsLiking(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLocalLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        setLiked(!nextLiked);
        setLocalLikeCount((prev) => prev + (nextLiked ? -1 : 1));
        toast.error("Failed to like post");
      } else {
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

  const handleShare = async () => {
    if (!post) return;

    try {
      const url = `${window.location.href.split("#")[0]}#post-${post.id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
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

  if (!post) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Post Details</SheetTitle>
        </SheetHeader>

        <div className=" px-4 space-y-6">
          {/* Post Content */}
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="flex gap-3">
                {/* Avatar */}
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={post.author.image || ""} alt={post.author.name || "Unknown"} />
                  <AvatarFallback>{getAuthorInitials(post.author.name)}</AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Author and metadata */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-foreground">{post.author.name || "Unknown User"}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
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
                  <div className="mb-4">
                    <div
                      className="prose prose-lg dark:prose-invert prose-headings:font-title font-default max-w-full text-[15px] leading-relaxed text-foreground"
                      dangerouslySetInnerHTML={{ __html: post.htmlDescription }}
                    />
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 max-w-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      disabled={isLiking}
                      className={cn(
                        "text-muted-foreground hover:text-red-500 hover:bg-red-500/10",
                        liked && "text-red-500"
                      )}
                      aria-pressed={liked}
                      aria-label={liked ? "Unlike post" : "Like post"}
                    >
                      <Heart className={cn("w-4 h-4 mr-1", liked && "fill-red-500")} />
                      {localLikeCount > 0 && <span className="text-sm">{localLikeCount}</span>}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comments ({localCommentCount})</h3>

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
              <div className="space-y-3">
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
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
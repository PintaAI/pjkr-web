"use client";

import { useState, useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
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

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (commentId: number, content: string) => Promise<void>;
  onLike: (commentId: number) => Promise<void>;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  currentUserId,
  onReply,
  onLike,
  isReply = false,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(false); // TODO: wire actual like status
  const [localLikeCount, setLocalLikeCount] = useState(comment._count.likes);
  const [expanded, setExpanded] = useState(false);
  const replyBoxRef = useRef<HTMLTextAreaElement | null>(null);

  const isLongContent = useMemo(() => {
    const text = (comment.htmlContent || comment.content || "").replace(/<[^>]+>/g, "");
    return text.length > 200;
  }, [comment.htmlContent, comment.content]);

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
      toast.success("Reply posted successfully!");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const next = !liked;
    setLiked(next);
    setLocalLikeCount((p) => p + (next ? 1 : -1));
    try {
      await onLike(comment.id);
    } catch {
      setLiked(!next);
      setLocalLikeCount((p) => p + (next ? -1 : 1));
      toast.error("Failed to like comment");
    } finally {
      setIsLiking(false);
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

  return (
    <TooltipProvider>
      <div className={cn(isReply ? "ml-8 pl-4 border-l border-muted/40" : "")}>
        <div className="flex gap-3">
          <Avatar className="w-8 h-8 mt-1">
            <AvatarImage src={comment.author.image || ""} alt={comment.author.name || "Unknown"} />
            <AvatarFallback className="text-xs">
              {getAuthorInitials(comment.author.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.author.name || "Unknown User"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>

              <div className="relative">
                <div
                  className={cn(
                    "text-sm text-foreground prose prose-sm max-w-none",
                    !expanded && "max-h-36 overflow-hidden"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: comment.htmlContent || comment.content,
                  }}
                />
                {!expanded && isLongContent && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
                )}
              </div>

              {isLongContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs"
                    onClick={handleLike}
                    disabled={isLiking}
                    aria-pressed={liked}
                  >
                    <Heart className={cn("w-3 h-3 mr-1", liked && "fill-red-500 text-red-500")} />
                    {localLikeCount > 0 ? localLikeCount : "Like"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like</TooltipContent>
              </Tooltip>

              {!isReply && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs"
                      onClick={() => {
                        setShowReplyForm((v) => !v);
                        setTimeout(() => replyBoxRef.current?.focus(), 50);
                      }}
                      aria-expanded={showReplyForm}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showReplyForm ? "Hide reply" : "Reply"}</TooltipContent>
                </Tooltip>
              )}

              {currentUserId === comment.author.id && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs"
                      aria-label="Comment actions"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Comment actions</TooltipContent>
                </Tooltip>
              )}
            </div>

            {showReplyForm && (
              <div className="mt-3 space-y-2">
                <Textarea
                  ref={replyBoxRef}
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && replyContent.trim() && !isSubmittingReply) {
                      e.preventDefault();
                      handleReplySubmit();
                    }
                  }}
                  className="min-h-[80px] text-sm"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim() || isSubmittingReply}
                  >
                    {isSubmittingReply ? "Posting..." : "Reply"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <span className="text-xs text-muted-foreground">Ctrl/⌘ + Enter</span>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onLike={onLike}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function CommentSkeleton() {
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
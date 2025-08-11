"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

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
  isReply = false 
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(false); // TODO: Get actual like status from API
  const [localLikeCount, setLocalLikeCount] = useState(comment._count.likes);

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
      toast.success("Reply posted successfully!");
    } catch (error) {
      toast.error("Failed to post reply");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      await onLike(comment.id);
      setLiked(!liked);
      setLocalLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error) {
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
    <div className={`${isReply ? "ml-8" : ""}`}>
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
            <div 
              className="text-sm text-foreground"
              dangerouslySetInnerHTML={{ 
                __html: comment.htmlContent || comment.content 
              }}
            />
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className={`w-3 h-3 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {localLikeCount > 0 && localLikeCount}
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Reply
              </Button>
            )}

            {currentUserId === comment.author.id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-xs"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex gap-2">
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
              </div>
            </div>
          )}

          {/* Render replies */}
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
  );
}
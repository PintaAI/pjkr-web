"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Pin, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import CommentItem from "./comment-item";

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
  const [liked, setLiked] = useState(false); // TODO: Get actual like status from API
  const [localLikeCount, setLocalLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);

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
    } catch (error) {
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
        setNewComment("");
        toast.success("Comment posted successfully!");
      } else {
        toast.error("Failed to post comment");
      }
    } catch (error) {
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
        // Update the comments to include the new reply
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newReply],
                  _count: { ...comment._count, replies: comment._count.replies + 1 }
                }
              : comment
          )
        );
      } else {
        throw new Error("Failed to post reply");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLocalLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      } else {
        toast.error("Failed to like post");
      }
    } catch (error) {
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
      throw error;
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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author.image || ""} alt={post.author.name || "Unknown"} />
            <AvatarFallback>
              {getAuthorInitials(post.author.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{post.author.name || "Unknown User"}</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              {post.isPinned && (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-200">
                  <Pin className="w-3 h-3 mr-1" />
                  Pinned
                </Badge>
              )}
              <Badge variant="outline" className={`text-xs ${getTypeColor(post.type)}`}>
                {post.type}
              </Badge>
            </div>
          </div>

          {currentUserId === post.author.id && (
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.htmlDescription }}
          />
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4 py-2 border-t border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="text-muted-foreground hover:text-foreground"
          >
            <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            {localLikeCount > 0 && localLikeCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {post._count.comments > 0 && post._count.comments}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4">
            {/* New Comment Form */}
            <div className="space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || isSubmittingComment}
                size="sm"
              >
                {isSubmittingComment ? "Posting..." : "Comment"}
              </Button>
            </div>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading comments...
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
        )}
      </CardContent>
    </Card>
  );
}
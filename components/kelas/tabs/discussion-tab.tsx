"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";

interface Post {
  id: number;
  title: string;
  type: string;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface DiscussionTabProps {
  posts: Post[];
  postsCount: number;
}

export default function DiscussionTab({ posts, postsCount }: DiscussionTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {posts.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Discussions ({postsCount})</h3>
            </div>
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.isPinned && (
                          <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-200">
                            📌 Pinned
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {post.type}
                        </Badge>
                      </div>
                      <div className="font-medium text-base mb-1">{post.title}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={post.author.image || ""} alt={post.author.name || "Unknown"} />
                          <AvatarFallback className="text-xs">
                            {post.author.name
                              ? post.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>by {post.author.name}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          ❤️ {post.likeCount} likes
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {post.commentCount} comments
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No discussions yet. Be the first to start a conversation!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
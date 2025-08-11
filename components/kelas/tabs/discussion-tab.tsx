"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/hooks/use-session";
import PostThread from "../components/post-thread";
import NewPostForm from "../components/new-post-form";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
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

interface DiscussionTabProps {
  kelasId: number;
  initialPosts?: Post[];
  initialPostsCount?: number;
}

export default function DiscussionTab({ kelasId, initialPosts = [], initialPostsCount = 0 }: DiscussionTabProps) {
  const { user, isAuthenticated } = useSession();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (initialPosts.length === 0) {
      fetchPosts(1, true);
    }
  }, [kelasId]);

  const fetchPosts = async (pageNum: number = 1, replace: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts?kelasId=${kelasId}&page=${pageNum}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        if (replace) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
        setPage(pageNum);
      } else {
        toast.error("Failed to load posts");
      }
    } catch (error) {
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setShowNewPostForm(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1, false);
    }
  };

  const handleRefresh = () => {
    fetchPosts(1, true);
  };

  if (showNewPostForm) {
    return (
      <div className="space-y-4">
        <NewPostForm
          kelasId={kelasId}
          onPostCreated={handleNewPost}
          onCancel={() => setShowNewPostForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Discussions ({posts.length > 0 ? posts.length : initialPostsCount})
              </h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {isAuthenticated && (
                <Button
                  size="sm"
                  onClick={() => setShowNewPostForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostThread
              key={post.id}
              post={post}
              currentUserId={user?.id as string}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
              <p className="mb-4">Be the first to start a conversation!</p>
              {isAuthenticated && (
                <Button onClick={() => setShowNewPostForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
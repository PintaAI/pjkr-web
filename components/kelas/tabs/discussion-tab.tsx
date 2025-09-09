"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/hooks/use-session";
import PostThread from "../components/post-thread";
import NewPostForm from "../components/new-post-form";
import { AnimatePresence, motion } from "framer-motion";

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

export default function DiscussionTab({
  kelasId,
  initialPosts = [],
  initialPostsCount = 0,
}: DiscussionTabProps) {
  const { user, isAuthenticated } = useSession();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // UX enhancements
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"new" | "comments" | "likes">("new");
  const [pinnedFirst, setPinnedFirst] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(
    async (pageNum: number = 1, replace: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/posts?kelasId=${kelasId}&page=${pageNum}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          if (replace) {
            setPosts(data.posts);
          } else {
            setPosts((prev) => [...prev, ...data.posts]);
          }
          setHasMore(data.pagination.page < data.pagination.totalPages);
          setPage(pageNum);
        } else {
          toast.error("Failed to load posts");
        }
      } catch {
        toast.error("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    },
    [kelasId]
  );

  useEffect(() => {
    if (initialPosts.length === 0) {
      fetchPosts(1, true);
    }
  }, [kelasId, initialPosts.length, fetchPosts]);


  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1, false);
    }
  }, [isLoading, hasMore, page, fetchPosts]);

  const handleRefresh = () => {
    fetchPosts(1, true);
  };

  // Infinite scroll via IntersectionObserver (graceful with button fallback)
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [handleLoadMore, hasMore, isLoading]);

  // Derived visible list (filter + sort + pinned-first)
  const visiblePosts = useMemo(() => {
    let arr = [...posts];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.htmlDescription || "").toLowerCase().includes(q)
      );
    }

    arr.sort((a, b) => {
      // Pinned first (primary sort)
      if (pinnedFirst) {
        const pinDelta = Number(b.isPinned) - Number(a.isPinned);
        if (pinDelta !== 0) return pinDelta;
      }

      // Secondary sort
      if (sort === "comments") {
        return (b._count?.comments || 0) - (a._count?.comments || 0);
      }
      if (sort === "likes") {
        return (b._count?.likes || 0) - (a._count?.likes || 0);
      }
      // "new"
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return arr;
  }, [posts, query, sort, pinnedFirst]);

  const showLoadingSkeleton = posts.length === 0 && isLoading;
  const totalText =
    initialPostsCount > 0 ? ` (${visiblePosts.length} of ${initialPostsCount})` : ` (${visiblePosts.length})`;

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <Card>
        <CardContent >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Discussions
                <span className="text-muted-foreground font-normal">{totalText}</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <div className="w-full sm:w-[220px]">
                <Input
                  placeholder="Search discussions..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9"
                />
              </div>

              <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Newest</SelectItem>
                  <SelectItem value="comments">Most Commented</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md border bg-background">
                <Switch
                  id="pin-toggle"
                  checked={pinnedFirst}
                  onCheckedChange={setPinnedFirst}
                />
                <Label htmlFor="pin-toggle" className="text-xs text-muted-foreground">
                  Pinned first
                </Label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              {isAuthenticated && (
                <Button size="sm" onClick={() => setShowNewPostForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {showLoadingSkeleton ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {visiblePosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PostThread post={post} currentUserId={user?.id as string} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div className="flex flex-col items-center gap-2 py-2">
              <div ref={sentinelRef} className="h-1 w-1" />
              <div className="text-xs text-muted-foreground">
                {isLoading ? "Loading more..." : "Scroll to load more"}
              </div>
              <div className="text-center">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
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

      {/* Mobile FAB */}
      {isAuthenticated && !showNewPostForm && (
        <Button
          onClick={() => setShowNewPostForm(true)}
          className="md:hidden fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
          aria-label="Create new post"
        >
          <Plus className="w-5 h-5" />
        </Button>
      )}

      {/* Dialog for New Post Form */}
      <Dialog open={showNewPostForm} onOpenChange={setShowNewPostForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <NewPostForm
            kelasId={kelasId}
            onPostCreated={(post) => {
              setPosts([post, ...posts]);
              setShowNewPostForm(false);
            }}
            onCancel={() => setShowNewPostForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}
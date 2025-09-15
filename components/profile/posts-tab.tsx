"use client";

import PostThread from "@/components/kelas/components/post-thread";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Post {
  id: number;
  title: string;
  description: string;
  htmlDescription: string;
  type: string;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  author: Author;
  userLiked: boolean;
  _count: {
    comments: number;
    likes: number;
    shares: number;
  };
}

interface PostsTabProps {
  posts: Post[];
  isOwnProfile: boolean;
  currentUserId?: string;
}

export default function PostsTab({ posts, isOwnProfile, currentUserId }: PostsTabProps) {

  if (posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-lg font-medium mb-2">No posts yet</p>
        <p>{isOwnProfile ? "You haven't created any posts yet." : "This user hasn't created any public posts yet."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostThread
          key={post.id}
          post={{
            ...post,
            createdAt: new Date(post.createdAt),
          }}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
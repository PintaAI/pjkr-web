"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface KelasAuthorProps {
  author: Author;
}

export default function KelasAuthor({ author }: KelasAuthorProps) {
  return (
    <div className="relative flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <Avatar
        className="w-10 h-10"
        userId={author.id}
        clickable={true}
      >
        <AvatarImage src={author.image || ""} alt={author.name || "Unknown"} />
        <AvatarFallback className="text-sm bg-primary text-white">
          {author.name
            ? author.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium text-sm">{author.name || "Unknown Author"}</div>
        <div className="text-xs text-muted-foreground">Author</div>
      </div>

      {/* Running Text Ads Placeholder - Absolutely Positioned */}
      <div className="absolute -bottom-8 left-2 right-2 h-5 border border-primary/30 rounded overflow-hidden bg-gradient-to-r from-primary/20 via-secondary/15 to-primary/20">
        <div className="flex items-center h-full px-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="w-1 h-1 rounded-full animate-pulse bg-primary"></span>
            <span className="font-medium text-primary">AD:</span>
            <span className="opacity-70 text-secondary">Running text advertisement space</span>
          </div>
        </div>
      </div>
    </div>
  );
}
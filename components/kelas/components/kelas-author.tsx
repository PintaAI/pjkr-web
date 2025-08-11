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
      <Avatar className="w-10 h-10">
        <AvatarImage src={author.image || ""} alt={author.name || "Unknown"} />
        <AvatarFallback className="text-sm bg-primary text-primary-foreground">
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
      <div className="absolute -bottom-8 left-2 right-2 h-5 bg-gradient-to-r from-blue-100 via-sky-50 to-blue-100 dark:from-blue-900/20 dark:via-sky-900/10 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded overflow-hidden">
        <div className="flex items-center h-full px-3">
          <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="font-medium">AD:</span>
            <span className="opacity-70">Running text advertisement space</span>
          </div>
        </div>
      </div>
    </div>
  );
}
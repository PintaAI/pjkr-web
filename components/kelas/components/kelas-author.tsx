"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useKelasColorsContext } from "@/lib/contexts/kelas-colors-context";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface KelasAuthorProps {
  author: Author;
}

export default function KelasAuthor({ author }: KelasAuthorProps) {
  const { colors } = useKelasColorsContext()

  return (
    <div className="relative flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <Avatar className="w-10 h-10">
        <AvatarImage src={author.image || ""} alt={author.name || "Unknown"} />
        <AvatarFallback
          className="text-sm"
          style={{
            backgroundColor: colors?.primary || 'hsl(var(--primary))',
            color: 'white'
          }}
        >
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
      <div
        className="absolute -bottom-8 left-2 right-2 h-5 border rounded overflow-hidden"
        style={{
          background: colors
            ? `linear-gradient(90deg, ${colors.primary}20, ${colors.secondary}15, ${colors.primary}20)`
            : 'linear-gradient(90deg, hsl(var(--blue-100)), hsl(var(--sky-50)), hsl(var(--blue-100)))',
          borderColor: colors ? `${colors.primary}30` : 'hsl(var(--blue-200))'
        }}
      >
        <div className="flex items-center h-full px-3">
          <div className="flex items-center gap-1 text-xs">
            <span
              className="w-1 h-1 rounded-full animate-pulse"
              style={{ backgroundColor: colors?.primary || 'hsl(var(--blue-500))' }}
            ></span>
            <span className="font-medium" style={{ color: colors?.primary || 'hsl(var(--blue-700))' }}>AD:</span>
            <span className="opacity-70" style={{ color: colors?.secondary || 'hsl(var(--blue-700))' }}>Running text advertisement space</span>
          </div>
        </div>
      </div>
    </div>
  );
}
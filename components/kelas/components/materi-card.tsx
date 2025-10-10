"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface Materi {
  id: number;
  title: string;
  description: string;
  htmlDescription?: string;
  order: number;
  isDemo: boolean;
  createdAt: Date;
}

interface MateriCardProps {
  materi: Materi;
  onClick?: () => void;
}

export function MateriCard({ materi, onClick }: MateriCardProps) {
  // Extract YouTube video ID from htmlDescription
  const extractYouTubeVideoId = (htmlDescription: string): string | null => {
    const regex = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = htmlDescription.match(regex);
    return match ? match[1] : null;
  };

  const videoId = materi.htmlDescription ? extractYouTubeVideoId(materi.htmlDescription) : null;

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-card py-0 border"
      onClick={onClick}
    >
      {/* Media */}
      <div className="relative">
        <div className="relative w-full aspect-[16/9]">
          {videoId ? (
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={materi.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/60">
              <BookOpen className="h-12 w-12 text-primary-foreground" />
            </div>
          )}
          {/* gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent dark:from-black/50 dark:via-black/20" />

          {/* badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {materi.isDemo && (
              <Badge variant="secondary" className="h-6 px-2 text-[10px]">
                Demo
              </Badge>
            )}
          </div>

          {/* overlay: info at bottom */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center gap-3 text-xs text-white/90">
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Order {materi.order}
              </span>
              <span>{new Date(materi.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="sm:px-4 pt-0 pb-3 sm:pb-4">
        <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 text-foreground">
          {materi.title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground/80 dark:text-muted-foreground line-clamp-2">
          {materi.description || "No description available"}
        </p>
      </CardContent>
    </Card>
  );
}
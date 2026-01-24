"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, FileQuestion, Trophy, Flame, Star, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfileCardProps {
  data: {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
    level: number;
    xp: number;
    currentStreak: number;
    joinedKelasCount: number;
    soalsCount: number;
    vocabularyItemsCount: number;
    totalActivities: number;
    bio?: string;
  };
  className?: string;
}

export function UserProfileCard({ data, className = "" }: UserProfileCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/profile/${data.id}`);
  };

  return (
    <Card
      className={`group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer p-4 border-r-2 border-accent bg-gradient-to-br from-card to-muted/20 ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar
            className="h-10 w-10"
            userId={data.id}
            clickable={true}
          >
            <AvatarImage src={data.image} alt={data.name} />
            <AvatarFallback>
              {data.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate">{data.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{data.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">{data.role}</Badge>
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Level {data.level}
          </Badge>
          <span className="mx-1 text-muted-foreground">•</span>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{data.xp} XP</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">{data.currentStreak} day</span>
          </div>
        </div>

        {data.bio && (
          <p
            className="text-sm text-muted-foreground line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: data.bio
            }}
          />
        )}

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="flex items-center gap-2 pl-2 border-l-2 border-border">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{data.joinedKelasCount}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l-2 border-border">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{data.soalsCount}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l-2 border-border">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{data.vocabularyItemsCount}</p>
              <p className="text-xs text-muted-foreground">Words</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l-2 border-border">
            <Users className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{data.totalActivities}</p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

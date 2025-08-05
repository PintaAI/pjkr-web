"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, DollarSign } from "lucide-react";
import { Difficulty, KelasType } from "@prisma/client";

export type MinimalKelas = {
  id: number;
  title: string;
  description: string | null;
  type: KelasType;
  level: Difficulty;
  thumbnail: string | null;
  isPaidClass: boolean;
  price: number | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    materis: number;
    members: number;
  };
};

const typeLabels: Record<KelasType, string> = {
  REGULAR: "Regular",
  EVENT: "Event",
  GROUP: "Group",
  PRIVATE: "Private",
  FUN: "Fun",
};

const levelLabels: Record<Difficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const levelColors: Record<Difficulty, string> = {
  BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  INTERMEDIATE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function KelasCard({ data }: { data: MinimalKelas }) {
  return (
    <Link href={`/kelas/${data.id}`} className="block">
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer py-0">
        {/* Media */}
        <div className="relative">
          <div className="relative w-full aspect-[16/9] bg-muted/40">
            {data.thumbnail ? (
              <Image
                src={data.thumbnail}
                alt={data.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                priority={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {/* gradient overlay (flip upwards to support footer overlay) */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

            {/* badges */}
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge variant="secondary" className="h-6 px-2 text-[10px]">
                {typeLabels[data.type]}
              </Badge>
            </div>
            <div className="absolute top-2 right-2">
              <Badge className={`${levelColors[data.level]} h-6 px-2 text-[10px] ring-1 ring-black/5 dark:ring-white/10`}>
                {levelLabels[data.level]}
              </Badge>
            </div>

            {/* overlay: author + counts moved into thumbnail */}
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center gap-3">
                {/* Author */}
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={data.author.image || ""} />
                    <AvatarFallback className="text-xs">
                      {data.author.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs text-white drop-shadow">
                    {data.author.name || "Unknown"}
                  </span>
                </div>

                {/* Divider dot */}
                <span className="text-white/80">•</span>

                {/* Counts */}
                <div className="flex items-center gap-3 text-xs text-white/90">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {data._count.materis}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {data._count.members}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CardContent className=" sm:px-4 pt-0 pb-3 sm:pb-4">
          <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2">
            {data.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {data.description || "No description available"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, BookOpen, Users, FileText, Play, Calendar, Tag, Video, MessageSquare, Book } from "lucide-react";
import { useRouter } from "next/navigation";
import { KelasType, Difficulty } from "@prisma/client";
import { NovelReadonly } from "@/components/novel/novel-readonly";
import Image from "next/image";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Materi {
  id: number;
  title: string;
  description: string;
  order: number;
  isDemo: boolean;
  createdAt: Date;
}

interface LiveSession {
  id: string;
  name: string;
  description: string | null;
  status: string;
  scheduledStart: Date;
  scheduledEnd: Date | null;
}

interface VocabularySet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  _count: {
    items: number;
  };
}

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

interface Kelas {
  id: number;
  title: string;
  description: string | null;
  jsonDescription?: any;
  htmlDescription?: string | null;
  type: KelasType;
  level: Difficulty;
  thumbnail: string | null;
  icon: string | null;
  isPaidClass: boolean;
  price: any; // Handle Prisma Decimal type
  discount: any; // Handle Prisma Decimal type
  promoCode: string | null;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: Author;
  materis: Materi[];
  liveSessions: LiveSession[];
  vocabularySets: VocabularySet[];
  posts: Post[];
  _count: {
    members: number;
    materis: number;
    liveSessions: number;
    vocabularySets: number;
    posts: number;
  };
}

interface KelasDetailPageProps {
  kelas: Kelas;
}

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

export default function KelasDetailPage({ kelas }: KelasDetailPageProps) {
  const router = useRouter();

  const formatPrice = (price: any) => {
    if (!price) return "0";
    const numPrice = typeof price === "string" ? parseFloat(price) : Number(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(numPrice);
  };

  const calculateDiscountedPrice = () => {
    if (!kelas.price || !kelas.discount) return kelas.price;
    const price = typeof kelas.price === "string" ? parseFloat(kelas.price) : Number(kelas.price);
    const discount = typeof kelas.discount === "string" ? parseFloat(kelas.discount) : Number(kelas.discount);
    return price - discount;
  };

  const getDifficultyColor = (level: Difficulty) => {
    switch (level) {
      case "BEGINNER":
        return "bg-success/10 text-success border-success/20";
      case "INTERMEDIATE":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20";
      case "ADVANCED":
        return "bg-fail/10 text-fail border-fail/20";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleEnroll = () => {
    // TODO: Implement enrollment logic
    console.log("Enrolling in kelas:", kelas.id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto -mt-6">
      {/* Header with blended thumbnail */}
      <div className="relative h-80 rounded-b-2xl overflow-hidden mb-6">
        {/* Background thumbnail */}
        <div className="absolute inset-0">
          {kelas.thumbnail ? (
            <>
              <Image
                src={kelas.thumbnail}
                alt={kelas.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/80 flex items-center justify-center">
              <BookOpen className="w-24 h-24 text-white/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}
        </div>

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="absolute top-4 left-4 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className={getDifficultyColor(kelas.level)}>
              {levelLabels[kelas.level]}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {typeLabels[kelas.type]}
            </Badge>
            {kelas.isDraft && (
              <Badge variant="outline" className="border-white/50 text-white">
                Draft
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-2">{kelas.title}</h1>
          {kelas.description && (
            <p className="text-white/90 text-sm md:text-base max-w-2xl">{kelas.description}</p>
          )}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Compact stats and pricing row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: Stats and Author */}
          <div className="flex-1 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-card rounded-lg shadow-sm">
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-lg font-semibold text-primary">{kelas._count.members}</div>
                <div className="text-xs text-muted-foreground">Students</div>
              </div>
              
              <div className="text-center p-3 bg-card rounded-lg shadow-sm">
                <BookOpen className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-lg font-semibold text-primary">{kelas._count.materis}</div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
              
              <div className="text-center p-3 bg-card rounded-lg shadow-sm">
                <Play className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-lg font-semibold text-primary">{kelas._count.liveSessions}</div>
                <div className="text-xs text-muted-foreground">Live</div>
              </div>
              
              <div className="text-center p-3 bg-card rounded-lg shadow-sm">
                <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-sm font-semibold text-primary">
                  {new Date(kelas.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={kelas.author.image || ""} alt={kelas.author.name || "Unknown"} />
                <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                  {kelas.author.name
                    ? kelas.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{kelas.author.name || "Unknown Author"}</div>
                <div className="text-xs text-muted-foreground">Instructor</div>
              </div>
            </div>
          </div>

          {/* Right column: Pricing */}
          <Card className="lg:w-64">
            <CardContent className="p-4">
              {kelas.isPaidClass && kelas.price ? (
                <div className="space-y-3">
                  <div className="text-center">
                    {kelas.discount ? (
                      <>
                        <div className="text-sm line-through text-muted-foreground">{formatPrice(kelas.price)}</div>
                        <div className="text-xl font-bold text-success">
                          {formatPrice(calculateDiscountedPrice())}
                        </div>
                      </>
                    ) : (
                      <div className="text-xl font-bold text-primary">{formatPrice(kelas.price)}</div>
                    )}
                  </div>

                  {kelas.promoCode && (
                    <div className="flex items-center justify-center gap-1 text-xs bg-success/10 text-success px-2 py-1 rounded">
                      <Tag className="w-3 h-3" />
                      {kelas.promoCode}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-lg font-semibold text-success">Free</div>
              )}

              <Button className="w-full mt-3" onClick={handleEnroll}>
                <BookOpen className="w-4 h-4 mr-2" />
                {kelas.isPaidClass ? "Enroll" : "Join"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {(kelas.htmlDescription || kelas.jsonDescription) && (
          <div>
            {kelas.htmlDescription ? (
              <NovelReadonly html={kelas.htmlDescription} className="prose-sm" />
            ) : kelas.jsonDescription ? (
              <div className="prose prose-sm max-w-none dark:prose-invert space-y-2">
                {kelas.jsonDescription.objectives && (
                  <div>
                    <h4 className="font-medium mb-1">Objectives:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {kelas.jsonDescription.objectives.map((obj: string, index: number) => (
                        <li key={index}>• {obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}


        {/* Content Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Materials */}
          {kelas.materis.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Materials ({kelas.materis.length})</h3>
                </div>
                <div className="space-y-2">
                  {kelas.materis.slice(0, 5).map((materi) => (
                    <div key={materi.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <div>
                        <div className="text-sm font-medium">{materi.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{materi.description}</div>
                      </div>
                      {materi.isDemo && (
                        <Badge variant="outline" className="text-xs">
                          Demo
                        </Badge>
                      )}
                    </div>
                  ))}
                  {kelas.materis.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{kelas.materis.length - 5} more materials
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Sessions */}
          {kelas.liveSessions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Live Sessions ({kelas.liveSessions.length})</h3>
                </div>
                <div className="space-y-2">
                  {kelas.liveSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="p-2 rounded bg-muted/30">
                      <div className="text-sm font-medium">{session.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.scheduledStart).toLocaleDateString()} at{" "}
                        {new Date(session.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${
                          session.status === "LIVE"
                            ? "bg-fail/10 text-fail border-fail/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                  {kelas.liveSessions.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{kelas.liveSessions.length - 3} more sessions
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vocabulary Sets */}
          {kelas.vocabularySets.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Book className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Vocabulary Sets ({kelas.vocabularySets.length})</h3>
                </div>
                <div className="space-y-2">
                  {kelas.vocabularySets.slice(0, 3).map((vocabSet) => (
                    <div key={vocabSet.id} className="p-2 rounded bg-muted/30">
                      <div className="text-sm font-medium">{vocabSet.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {vocabSet._count.items} words
                      </div>
                    </div>
                  ))}
                  {kelas.vocabularySets.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      +{kelas.vocabularySets.length - 3} more sets
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Discussions */}
          {kelas.posts.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Recent Discussions ({kelas._count.posts})</h3>
                </div>
                <div className="space-y-2">
                  {kelas.posts.map((post) => (
                    <div key={post.id} className="p-2 rounded bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium line-clamp-1">{post.title}</div>
                          <div className="text-xs text-muted-foreground">
                            by {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>❤️ {post.likeCount}</span>
                          <span>💬 {post.commentCount}</span>
                        </div>
                      </div>
                      {post.isPinned && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Pinned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

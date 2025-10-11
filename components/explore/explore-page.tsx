"use client";

import { useState, useEffect } from "react";
import { KelasCard } from "../kelas/kelas-card";
import { VocabItemCard } from "./vocab-item-card";
import { UserProfileCard } from "./user-profile-card";
import { SoalItemCard } from "./soal-item-card";
import { Button } from "../ui/button";

import { Search, Filter, Sparkles } from "lucide-react";
import { Input } from "../ui/input";
import { motion } from "framer-motion";

// Define types for the content items
type KelasContent = {
  id: number;
  title: string;
  description: string;
  type: "REGULAR" | "EVENT" | "GROUP" | "PRIVATE" | "FUN";
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  thumbnail: string | null;
  isPaidClass: boolean;
  price: number | null;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  _count: {
    materis: number;
    members: number;
  };
};

type VocabContent = {
  id: number;
  korean: string;
  indonesian: string;
  type: "WORD" | "SENTENCE" | "IDIOM";
  pos: "KATA_KERJA" | "KATA_BENDA" | "KATA_SIFAT" | "KATA_KETERANGAN" | null;
  exampleSentences: string[];
  audioUrl: string | null;
  author: {
    id: string;
    name: string;
    image: string;
  };
  collection: {
    id: number;
    title: string;
  } | null;
  connectedKelas?: {
    id: number;
    title: string;
  };
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  rating: number;
  totalLearners: number;
};

type UserContent = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: "GURU" | "MURID" | "ADMIN";
  level: number;
  xp: number;
  currentStreak: number;
  joinedKelasCount: number;
  soalsCount: number;
  vocabularyItemsCount: number;
  totalActivities: number;
  bio: string;
};

type SoalContent = {
  id: number;
  pertanyaan: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  explanation?: string;
  options?: string[];
  correctOptionIndex: number;
  author: {
    id: string;
    name: string;
    image: string;
  };
  isActive: boolean;
  collectionName: string;
  // Add connected classes for navigation
  connectedClasses?: Array<{
    id: number;
    title: string;
    level: string;
  }>;
};

type ContentItem =
  | { type: 'kelas'; data: KelasContent; id: string }
  | { type: 'vocab'; data: VocabContent; id: string }
  | { type: 'user'; data: UserContent; id: string }
  | { type: 'soal'; data: SoalContent; id: string };

interface ExplorePageProps {
   initialData?: ContentItem[];
}

export default function ExplorePage({ initialData = [] }: ExplorePageProps) {
    const [content, setContent] = useState<ContentItem[]>(initialData);
    const [hideDescription, setHideDescription] = useState(false);

   useEffect(() => {
     if (initialData.length === 0) {
       const fetchContent = async () => {
         try {
           const response = await fetch('/api/explore');
           const data = await response.json();
           if (data.success) {
             setContent(data.data);
           }
         } catch {
           // Error handling removed as error state is not used
         }
       };

       fetchContent();
     }
   }, [initialData.length]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setHideDescription(scrollY > 80);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredContent = content.filter((item): item is ContentItem => {
    if (selectedFilter !== "all" && item.type !== selectedFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      switch (item.type) {
        case 'kelas':
          return item.data.title.toLowerCase().includes(query) ||
                 item.data.description.toLowerCase().includes(query) ||
                 item.data.author.name.toLowerCase().includes(query);
        case 'vocab':
           return item.data.korean.toLowerCase().includes(query) ||
                  item.data.indonesian.toLowerCase().includes(query) ||
                  item.data.author.name.toLowerCase().includes(query) ||
                  (item.data.collection?.title.toLowerCase().includes(query) ?? false);
        case 'user':
          return item.data.name.toLowerCase().includes(query) ||
                 item.data.bio?.toLowerCase().includes(query) ||
                 item.data.email.toLowerCase().includes(query);
        case 'soal':
          return item.data.pertanyaan.toLowerCase().includes(query) ||
                 item.data.author.name.toLowerCase().includes(query) ||
                 (item.data.explanation?.toLowerCase().includes(query) ?? false);
        default:
          return false;
      }
    }
    return true;
  });

  const renderCard = (item: ContentItem) => {
    switch (item.type) {
      case 'kelas':
        return <KelasCard key={item.id} data={item.data} className="mb-4" />;
      case 'vocab':
        return <VocabItemCard key={item.id} data={item.data} className="mb-4" />;
      case 'user':
        return <UserProfileCard key={item.id} data={item.data} className="mb-4" />;
      case 'soal':
        return <SoalItemCard key={item.id} data={item.data} className="mb-4" />;
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/75  border-b shadow-md -mx-4 lg:-mx-6 -mt-4 lg:-mt-6">
        <div>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-6">
                Explore
              </h1>
            </div>
            <motion.div
              initial={false}
              animate={{
                height: hideDescription ? 0 : "auto",
                opacity: hideDescription ? 0 : 1
              }}
              transition={{
                duration: 0.2,
                ease: "easeOut"
              }}
              style={{ overflow: "hidden" }}
            >
              <p className="text-lg mt-2 text-muted-foreground max-w-2xl mx-auto">
                Discover Korean learning content, connect with teachers, and explore vocabulary collections
              </p>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 bg-background transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content, teachers, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === "kelas" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("kelas")}
              >
                Classes
              </Button>
              <Button
                variant={selectedFilter === "vocab" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("vocab")}
              >
                Vocabulary
              </Button>
              <Button
                variant={selectedFilter === "user" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("user")}
              >
                People
              </Button>
              <Button
                variant={selectedFilter === "soal" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("soal")}
              >
                Questions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredContent.map(renderCard)}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No content found matching your criteria</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

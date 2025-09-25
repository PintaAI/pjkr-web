"use client";

import { useEffect, useState, use } from "react";
import { BookOpen, Clock, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { VocabItemCard } from "@/components/explore/vocab-item-card";

interface VocabItem {
  id: number;
  korean: string;
  indonesian: string;
  type: string;
}

interface VocabSet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  } | null;
  kelas: {
    id: number;
    title: string;
    level: string;
    thumbnail: string | null;
  } | null;
  items: VocabItem[];
}

interface VocabDetailPageProps {
  params: Promise<{ id: string; vocabId: string }>;
}

export default function VocabDetailPage({ params }: VocabDetailPageProps) {
  const router = useRouter();
  const { id, vocabId } = use(params);
  const [vocabSet, setVocabSet] = useState<VocabSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVocabSet = async () => {
      try {
        const response = await fetch(`/api/vocabulary-sets/${vocabId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch vocabulary set');
        }
        const result = await response.json();
        if (result.success) {
          setVocabSet(result.data);
        } else {
          setError(result.error || 'Failed to load vocabulary set');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVocabSet();
  }, [vocabId]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-6 -mt-6">
        <div className="animate-pulse">
          <div className="h-48 bg-muted rounded-xl mb-6"></div>
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vocabSet) {
    return (
      <div className="w-full max-w-5xl mx-auto px-6 -mt-6">
        <Card>
          <CardContent className="p-6 text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Vocabulary Set Not Found</h3>
            <p className="text-muted-foreground">{error || 'The requested vocabulary set could not be found.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 -mt-6">
      {/* Kelas Thumbnail Header */}
      <motion.div
        className="relative h-48 rounded-xl overflow-hidden mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="absolute inset-0">
          {vocabSet.kelas?.thumbnail ? (
            <>
              <img
                src={vocabSet.kelas.thumbnail}
                alt={vocabSet.kelas.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/80 to-secondary/60"
            >
              <GraduationCap className="w-16 h-16 text-white/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-4 left-4 right-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/kelas"
                  className="text-white/80 hover:text-white hover:underline"
                >
                  Classes
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/kelas/${id}`}
                  className="text-white/80 hover:text-white hover:underline"
                >
                  {vocabSet.kelas?.title ?? "Class"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">{vocabSet.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold">{vocabSet.title}</h2>
            {vocabSet.isPublic && (
              <Badge
                variant="outline"
                className="text-xs border-white/50 text-white"
              >
                Public
              </Badge>
            )}
          </div>
          <p className="text-white/90 text-sm mb-2">{vocabSet.description || 'No description available'}</p>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{vocabSet.items.length} items</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Created {new Date(vocabSet.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Vocabulary Items */}
      <Card>
        <CardContent >
          {vocabSet.items.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-6">Vocabulary Items</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {vocabSet.items.map((item) => (
                  <VocabItemCard
                    disableNavigation={true}
                    key={item.id}
                    data={{
                      ...item,
                      type: item.type as "WORD" | "SENTENCE" | "IDIOM",
                      pos: null,
                      exampleSentences: [],
                      audioUrl: null,
                      author: vocabSet.user ? { id: vocabSet.user.id, name: vocabSet.user.name || '', image: '' } : { id: '', name: '', image: '' },
                      collection: vocabSet ? { id: vocabSet.id, title: vocabSet.title } : null,
                      difficulty: "BEGINNER",
                      rating: 0,
                      totalLearners: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No vocabulary items available in this set.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
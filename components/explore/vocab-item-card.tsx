"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent,} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2 } from "lucide-react";

interface VocabItemCardProps {
  data: {
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
    // Add connected kelas for navigation to kelas vocab detail page
    connectedKelas?: {
      id: number;
      title: string;
    };
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    rating: number;
    totalLearners: number;
  };
  className?: string;
  disableNavigation?: boolean;
}

/* removed unused difficultyColors to enforce token-only palette */

export function VocabItemCard({ data, className = "", disableNavigation = false }: VocabItemCardProps) {
  const router = useRouter();
  
  // Log the vocab data for debugging
  console.log('VocabItemCard data:', {
    id: data.id,
    korean: data.korean,
    connectedKelas: data.connectedKelas,
    collection: data.collection,
  });
  
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking audio button
    // TODO: Implement audio playback
    console.log('Play audio for:', data.korean);
  };

  const handleCardClick = () => {
    // Skip navigation if disabled
    if (disableNavigation) {
      console.log('Navigation disabled for vocab card');
      return;
    }

    // Priority navigation logic:
    // 1. If connected to a kelas, navigate to kelas vocab detail page (using collection ID)
    // 2. Fallback to author profile
    
    if (data.connectedKelas && data.collection) {
      console.log(`Navigating to vocab collection in kelas: /kelas/${data.connectedKelas.id}/vocab/${data.collection.id}`);
      router.push(`/kelas/${data.connectedKelas.id}/vocab/${data.collection.id}`);
    } else {
      console.log(`Navigating to author profile: /profile/${data.author.id}`);
      router.push(`/profile/${data.author.id}`);
    }
  };

  const typeLabels = {
    WORD: "Word",
    SENTENCE: "Sentence",
    IDIOM: "Idiom",
  };

  const posLabels = {
    KATA_KERJA: "Verb",
    KATA_BENDA: "Noun",
    KATA_SIFAT: "Adjective",
    KATA_KETERANGAN: "Adverb",
  };

  return (
    <Card
      className={`group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all ${disableNavigation ? '' : 'cursor-pointer'} p-4 relative bg-gradient-to-br from-card to-muted/20 ${className}`}
      onClick={disableNavigation ? undefined : handleCardClick}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${data.difficulty === "BEGINNER" ? "bg-gradient-to-b from-primary to-card" : data.difficulty === "INTERMEDIATE" ? "bg-gradient-to-b from-secondary to-card" : "bg-gradient-to-b from-destructive to-card"}`} />
      <CardContent className="p-0 space-y-3 pl-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-primary mb-1 break-words">{data.korean}</h3>
            <p className="text-sm text-muted-foreground break-words">{data.indonesian}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {data.audioUrl && (
              <Button variant="ghost" size="sm" onClick={handlePlayAudio} className="h-8 w-8 p-0">
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {typeLabels[data.type]}
          </Badge>
          {data.pos && (
            <Badge variant="outline" className="text-xs">
              {posLabels[data.pos]}
            </Badge>
          )}
        </div>

        {data.exampleSentences && data.exampleSentences.filter(s => s.trim()).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              Examples
            </div>
            <div className="space-y-1">
              {data.exampleSentences
                .filter(s => s.trim())
                .slice(0, 2)
                .map((sentence, index) => (
                  <p key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-border">
                    {sentence}
                  </p>
                ))}
              {data.exampleSentences.filter(s => s.trim()).length > 2 && (
                <p className="text-xs text-muted-foreground pl-4">
                  +{data.exampleSentences.filter(s => s.trim()).length - 2} more examples
                </p>
              )}
            </div>
          </div>
        )}

        {data.collection && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {data.collection.title}
            </span>
            <span className="text-xs text-muted-foreground">
              by {data.author.name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
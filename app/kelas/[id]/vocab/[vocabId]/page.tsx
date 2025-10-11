"use client";

import { useEffect, useState, use } from "react";
import VocabDetailComponent from "@/components/kelas/vocab-detail-page";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

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

interface VocabPageProps {
  params: Promise<{ id: string; vocabId: string }>;
}

export default function VocabPage({ params }: VocabPageProps) {

  const { vocabId } = use(params);
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

  return <VocabDetailComponent vocabSet={vocabSet} />;
}
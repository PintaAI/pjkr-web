"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { VocabCard } from "@/components/dashboard/vocab-card";

interface VocabSet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
  } | null;
  kelas: {
    id: number;
    title: string;
    level: string;
  } | null;
  items: Array<{
    id: number;
    korean: string;
    indonesian: string;
    type: string;
  }>;
}

interface VocabularyTabProps {
  vocabularySets: VocabSet[];
}

export default function VocabularyTab({ vocabularySets }: VocabularyTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {vocabularySets.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Vocabulary Sets ({vocabularySets.length})</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vocabularySets.map((vocabSet) => (
                <VocabCard
                  key={vocabSet.id}
                  vocabSet={vocabSet}
                  compact={false}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No vocabulary sets available for this class.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
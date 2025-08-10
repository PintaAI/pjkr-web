"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Book, GraduationCap } from "lucide-react";

interface VocabularySet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  _count: {
    items: number;
  };
}

interface VocabularyTabProps {
  vocabularySets: VocabularySet[];
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
            <div className="grid gap-4 md:grid-cols-2">
              {vocabularySets.map((vocabSet) => (
                <div key={vocabSet.id} className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {vocabSet.icon ? (
                      <div className="text-2xl">{vocabSet.icon}</div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Book className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-base mb-1">{vocabSet.title}</div>
                      {vocabSet.description && (
                        <p className="text-sm text-muted-foreground mb-2">{vocabSet.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Book className="w-4 h-4" />
                          {vocabSet._count.items} words
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
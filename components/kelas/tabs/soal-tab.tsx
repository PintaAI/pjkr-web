"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { SoalCard } from "@/components/dashboard/soal-card";

interface SoalSet {
  id: number;
  nama: string;
  deskripsi: string | null;
  isPrivate: boolean;
  isDraft: boolean;
  createdAt: Date;
  soals: Array<{
    id: number;
    pertanyaan: string;
    difficulty: string | null;
  }>;
  user: {
    id: string;
    name: string | null;
  } | null;
  kelasKoleksiSoals: Array<{
    kelas: {
      id: number;
      title: string;
      level: string;
    };
  }>;
}

interface SoalTabProps {
  soalSets: SoalSet[];
}

export default function SoalTab({ soalSets }: SoalTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {soalSets.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Question Sets ({soalSets.length})</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {soalSets.map((soalSet) => (
                <SoalCard
                  key={soalSet.id}
                  soalSet={soalSet}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No question sets available for this class.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
"use client";


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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Paket Soal ({soalSets.length})</h3>
      </div>
      {soalSets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {soalSets.map((soalSet) => (
            <SoalCard
              key={soalSet.id}
              soalSet={soalSet}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
          <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tidak ada paket soal yang tersedia untuk kelas ini.</p>
        </div>
      )}
    </div>
  );
}

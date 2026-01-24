"use client";

import { Users, BookOpen, FileText } from "lucide-react";


interface KelasStatsProps {
  stats: {
    members: number;
    materis: number;
    kelasKoleksiSoals: number;
    vocabularySets: number;
  };
}

export default function KelasStats({ stats }: KelasStatsProps) {
 

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
        <div className="text-lg font-semibold text-secondary">
          {stats.members}
        </div>
        <div className="text-xs text-muted-foreground">Murid</div>
      </div>

      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <BookOpen className="w-4 h-4 mx-auto mb-1 text-primary" />
        <div className="text-lg font-semibold text-secondary">
          {stats.materis}
        </div>
        <div className="text-xs text-muted-foreground">Materi</div>
      </div>

      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <FileText className="w-4 h-4 mx-auto mb-1 text-primary" />
        <div className="text-lg font-semibold text-secondary">
          {stats.kelasKoleksiSoals}
        </div>
        <div className="text-xs text-muted-foreground">Paket Soal</div>
      </div>

      <div className="text-center p-3 bg-card rounded-lg shadow-sm">
        <BookOpen className="w-4 h-4 mx-auto mb-1 text-primary" />
        <div className="text-lg font-semibold text-secondary">
          {stats.vocabularySets}
        </div>
        <div className="text-xs text-muted-foreground">koleksi kosa-kata</div>
      </div>
    </div>
  );
}

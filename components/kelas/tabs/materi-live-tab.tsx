"use client";

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { navigateWithHashPreservation } from "@/lib/navigation-helpers";
import { MateriCard } from "../components/materi-card";
import LiveSessionTab from "./live-session-tab";

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

interface MateriLiveTabProps {
  materis: Materi[];
  liveSessions: LiveSession[];
  kelasId: number;
}

export default function MateriLiveTab({ materis, liveSessions, kelasId }: MateriLiveTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Materi Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Materials ({materis.length})</h3>
        </div>
        {materis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materis.map((materi) => (
              <MateriCard
                key={materi.id}
                materi={materi}
                onClick={() => navigateWithHashPreservation(
                  router,
                  `/kelas/${kelasId}`,
                  `/kelas/${kelasId}/materi/${materi.id}`,
                  'materials'
                )}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
            <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No materials available for this class.</p>
          </div>
        )}
      </div>

      {/* Live Sessions Section */}
      <div>
        <LiveSessionTab liveSessions={liveSessions} />
      </div>
    </div>
  );
}

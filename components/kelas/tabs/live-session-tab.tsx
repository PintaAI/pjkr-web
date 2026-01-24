"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";

interface LiveSession {
  id: string;
  name: string;
  description: string | null;
  status: string;
  scheduledStart: Date;
  scheduledEnd: Date | null;
}

interface LiveSessionTabProps {
  liveSessions: LiveSession[];
}

export default function LiveSessionTab({ liveSessions }: LiveSessionTabProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {liveSessions.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Live Sessions ({liveSessions.length})</h3>
            </div>
            <div className="space-y-3">
              {liveSessions.map((session) => (
                <div key={session.id} className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-base mb-1">{session.name}</div>
                      {session.description && (
                        <p className="text-sm text-muted-foreground mb-2">{session.description}</p>
                      )}
                      <div className="text-sm text-muted-foreground">
                        📅 {new Date(session.scheduledStart).toLocaleDateString()} at{" "}
                        {new Date(session.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {session.scheduledEnd && (
                          <span> - {new Date(session.scheduledEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`ml-4 ${
                        session.status === "LIVE"
                          ? "bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20"
                          : session.status === "UPCOMING" 
                          ? "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No live sessions scheduled for this class.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

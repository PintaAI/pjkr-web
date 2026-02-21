"use client";

import { Card, CardContent } from "@/components/ui/card";
import { NovelReadonly } from "@/components/novel/novel-readonly";
import { FileText } from "lucide-react";

interface DetailTabProps {
  htmlDescription?: string | null;
  jsonDescription?: any;
}

export default function DetailTab({ htmlDescription, jsonDescription }: DetailTabProps) {
  return (
    <Card className="w-full h-full bg-background border-none">
      <CardContent >
        {(htmlDescription || jsonDescription) ? (
          <>
            {jsonDescription && typeof jsonDescription === 'object' && jsonDescription.type ? (
              <NovelReadonly content={jsonDescription} className="prose-sm" />
            ) : htmlDescription ? (
              <NovelReadonly html={htmlDescription} className="prose-sm" />
            ) : jsonDescription ? (
              <div className="prose prose-sm max-w-none dark:prose-invert space-y-2">
                {jsonDescription.objectives && (
                  <div>
                    <h4 className="font-medium mb-1">Tujuan:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {jsonDescription.objectives.map((obj: string, index: number) => (
                        <li key={index}>• {obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Tidak ada deskripsi lengkap tersedia untuk kelas ini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

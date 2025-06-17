"use client";

import { NovelEditor } from "@/components/novel/novel-editor";
import { NovelReadonly } from "@/components/novel/novel-readonly";
import { useState } from "react";

export default function NovelDemo() {
  const [content, setContent] = useState<{ json: Record<string, unknown>; html: string } | null>(null);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Novel Editor Demo</h1>
        
        <NovelEditor
          initialContent={content?.json}
          onUpdate={(newContent) => {
            setContent(newContent);
            console.log("Content updated:", newContent);
          }}
          placeholder="Start writing your amazing content here..."
          className="w-full"
        />
        
        {content && (
          <div className="mt-8 space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-4">Rendered HTML Output (Readonly View):</h3>
              <div className="bg-background p-4 rounded border">
                <NovelReadonly html={content.html} />
              </div>
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">JSON (for database):</h3>
                <pre className="text-sm overflow-auto max-h-40 bg-background p-2 rounded">
                  {JSON.stringify(content?.json, null, 2)}
                </pre>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">HTML (for readonly):</h3>
                <pre className="text-sm overflow-auto max-h-40 bg-background p-2 rounded">
                  {content?.html || ""}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

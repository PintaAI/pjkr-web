"use client";

import NovelEditor from "@/components/novel/novel-editor";
import { NovelReadonly } from "@/components/novel/novel-readonly";
import { useEffect, useState } from "react";

export default function NovelDemo() {
  const [html, setHtml] = useState<string>("");
  const [json, setJson] = useState<Record<string, unknown> | null>(null);
  const [markdown, setMarkdown] = useState<string>("");

  // Poll localStorage for updates written by NovelEditor (simple demo approach)
  useEffect(() => {
    const load = () => {
      try {
        const storedJson = window.localStorage.getItem("novel-content");
        const storedHtml = window.localStorage.getItem("html-content");
        const storedMd = window.localStorage.getItem("markdown");
        if (storedHtml) setHtml(storedHtml);
        if (storedJson) setJson(JSON.parse(storedJson));
        if (storedMd) setMarkdown(storedMd);
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Novel Editor Demo</h1>

        <NovelEditor  />

        <div className="mt-8 space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-4">Rendered HTML Output (Readonly View):</h3>
            <div className="bg-background p-4 rounded border">
              {html ? <NovelReadonly html={html} /> : <p className="text-sm text-muted-foreground">Start typing to see HTML...</p>}
            </div>
          </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">JSON (for database):</h3>
                <pre className="text-sm overflow-auto max-h-40 bg-background p-2 rounded">
                  {json ? JSON.stringify(json, null, 2) : "// JSON will appear after you edit"}
                </pre>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Markdown (derived):</h3>
                <pre className="text-sm overflow-auto max-h-40 bg-background p-2 rounded">
                  {markdown || "// Markdown will appear after you edit"}
                </pre>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

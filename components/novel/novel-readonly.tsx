"use client";

import { EditorContent, EditorRoot, type JSONContent } from "novel";
import { defaultExtensions } from "./extensions";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface NovelReadonlyProps {
  content?: JSONContent;
  html?: string;
  className?: string;
}

export function NovelReadonly({ content, html, className }: NovelReadonlyProps) {
  const [editorContent, setEditorContent] = useState<JSONContent | null>(null);

  useEffect(() => {
    if (content) {
      setEditorContent(content);
    } else if (html) {
      // If only HTML is provided, use it with dangerouslySetInnerHTML as fallback
      // This maintains backward compatibility
      setEditorContent(null);
    }
  }, [content, html]);

  // If we have JSON content, render with Tiptap editor
  if (editorContent) {
    return (
      <div className={cn("w-full", className)}>
        <EditorRoot>
          <EditorContent
            initialContent={editorContent}
            extensions={defaultExtensions}
            editable={false}
            className="w-full"
            editorProps={{
              attributes: {
                class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
              },
            }}
          />
        </EditorRoot>
      </div>
    );
  }

  // Fallback to HTML rendering for backward compatibility
  if (html) {
    return (
      <div
        className={cn("prose prose-lg dark:prose-invert prose-headings:font-title font-default max-w-full", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return null;
}

"use client";

import { EditorContent, EditorRoot, type JSONContent } from "novel";
import { generateHTML, generateJSON } from "@tiptap/html";
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
      // Convert HTML to JSON content so we can use Tiptap with our extensions
      try {
        const jsonContent = generateJSON(html, defaultExtensions);
        setEditorContent(jsonContent);
      } catch (error) {
        console.warn("Failed to parse HTML content, using fallback:", error);
        // Create a simple document structure with the HTML content
        setEditorContent({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Content could not be parsed properly."
                }
              ]
            }
          ]
        });
      }
    }
  }, [content, html]);

  // Always render with Tiptap editor to ensure extensions work properly
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

  return null;
}

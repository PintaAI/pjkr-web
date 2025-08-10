import type { JSONContent } from "novel";

/**
 * Default editor content used when there is no saved draft in localStorage.
 */
export const defaultEditorContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Start writing..." }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: " " }],
    },
  ],
};
import type { JSONContent } from "novel";

/**
 * Default editor content used when there is no saved draft in localStorage.
 * Empty doc with a single blank paragraph so the editor can focus properly.
 */
export const defaultEditorContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: []
    }
  ],
};
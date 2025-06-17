import { generateHTML, generateJSON } from "@tiptap/html";
import { defaultExtensions } from "@/components/novel/extensions";
import type { JSONContent } from "novel";

// Convert Novel JSON to HTML
export function jsonToHTML(json: JSONContent): string {
  if (!json) return "";
  return generateHTML(json, defaultExtensions);
}

// Convert HTML to Novel JSON
export function htmlToJSON(html: string): JSONContent {
  if (!html) return { type: "doc", content: [] };
  return generateJSON(html, defaultExtensions);
}

// Get plain text from JSON (for previews, search, etc.)
export function jsonToPlainText(json: JSONContent): string {
  if (!json) return "";
  
  function extractText(node: JSONContent): string {
    if (node.type === "text") {
      return node.text || "";
    }
    
    if (node.content) {
      return node.content.map(extractText).join("");
    }
    
    return "";
  }
  
  return extractText(json).trim();
}

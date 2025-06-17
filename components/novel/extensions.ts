import {
  TiptapLink,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  TiptapUnderline, // Re-adding TiptapUnderline from novel
  TextStyle,
} from "novel";
import Youtube from "@tiptap/extension-youtube";
import Color from "@tiptap/extension-color";

import { cx } from "class-variance-authority";
import { slashCommand } from "./slash-command";


const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  // Configure inline code
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  // Disable codeBlock as per previous request
  codeBlock: false,
  horizontalRule: false,
  dropcursor: { // Preserving existing dropcursor config
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

export const defaultExtensions = [
  starterKit,
  Placeholder.configure({
    placeholder: ({ node, editor }) => {
      if (node.type.name === "heading") {
        return "What's the title?";
      }
      // Show placeholder for paragraph only when the editor is empty and the current node is a paragraph
      if (editor.isEmpty && node.type.name === "paragraph") {
        return "Press '/' for commands, or start writing...";
      }
      return ""; // Default to no placeholder
    },
    showOnlyWhenEditable: true,
    showOnlyCurrent: true,
  }),
  tiptapLink,
  UpdatedImage,
  taskList,
  taskItem,
  horizontalRule, // Using the separate HorizontalRule extension
  TiptapUnderline, // Re-adding TiptapUnderline from novel
  TextStyle,
  Color,
  slashCommand,
  Youtube.configure({
    HTMLAttributes: {
      class: "w-full aspect-video", // Basic styling for responsiveness
    },
    nocookie: true, // Use youtube-nocookie.com for privacy
    // You can add more configurations here if needed
    // e.g., width, height, allowfullscreen, autoplay, etc.
  }),
];

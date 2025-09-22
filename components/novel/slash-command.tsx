import {
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  Text,
  TextQuote,
} from "lucide-react";
import { createSuggestionItems, Command, renderItems } from "novel";
import { toast } from "sonner";

export const suggestionItems = createSuggestionItems([
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["image", "picture", "photo", "upload"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      
      // Create file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          // Validate file
          if (!file.type.includes("image/")) {
            toast.error("File type not supported.");
            return;
          }
          if (file.size / 1024 / 1024 > 20) {
            toast.error("File size too big (max 20MB).");
            return;
          }

          // Create FormData for Cloudinary upload
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "image");
          formData.append("folder", "editor");

          const uploadPromise = fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          toast.promise(
            uploadPromise.then(async (res) => {
              if (res.status === 200) {
                const result = await res.json();
                if (result.success && result.data?.url) {
                  editor
                    .chain()
                    .focus()
                    .setImage({ src: result.data.url })
                    .run();
                } else {
                  throw new Error(result.error || "Upload failed");
                }
              } else {
                const errorResult = await res.json().catch(() => ({}));
                throw new Error(errorResult.error || "Error uploading image. Please try again.");
              }
            }),
            {
              loading: "Uploading image...",
              success: "Image uploaded successfully.",
              error: (e) => e.message,
            }
          );
        }
      };
      input.click();
    },
  },
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});

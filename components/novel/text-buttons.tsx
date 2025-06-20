import { cn } from "@/lib/utils";
import { EditorBubbleItem, useEditor } from "novel";
import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SelectorItem {
  name: string;
  isActive: (editor: ReturnType<typeof useEditor>["editor"]) => boolean;
  command: (editor: ReturnType<typeof useEditor>["editor"]) => void;
  icon: any;
}

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  
  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => editor?.isActive("bold") ?? false,
      command: (editor) => editor?.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: (editor) => editor?.isActive("italic") ?? false,
      command: (editor) => editor?.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: (editor) => editor?.isActive("underline") ?? false,
      command: (editor) => editor?.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: "strike",
      isActive: (editor) => editor?.isActive("strike") ?? false,
      command: (editor) => editor?.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: "code",
      isActive: (editor) => editor?.isActive("code") ?? false,
      command: (editor) => editor?.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];
  
  return (
    <div className="flex">
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button size="sm" className="rounded-none" variant="ghost">
            <item.icon
              className={cn("h-4 w-4", {
                "text-primary": item.isActive(editor),
              })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};

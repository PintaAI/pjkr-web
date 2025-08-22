"use client";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorBubble,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { NodeSelector } from "./selectors/node-selector";
import { cn } from "@/lib/utils";

/* AI features removed temporarily */
// import GenerativeMenuSwitch from "./generative/generative-menu-switch";

import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { uploadFn } from "./image-upload";
import { LinkSelector } from "./selectors/link-selector";
import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

interface NovelEditorProps {
  initialContent?: any;
  onUpdate?: (data: { json: any; html: string }) => void;
  onSave?: (data: { json: any; html: string }) => void;
  className?: string;
  saveStatus?: "Saved" | "Unsaved" | "Saving...";
}

/* Defaults preserve original sizing when props not supplied */
const NovelEditor = ({
  onUpdate,
  onSave,
  initialContent: propInitialContent,
  saveStatus = "Saved",
  className,
}: NovelEditorProps) => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);

  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
    
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el as HTMLElement);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    const html = highlightCodeblocks(editor.getHTML());
   
    console.log("Editor content saved to database");
    
    // TODO: Implement save to database functionality
    // Call onSave prop if provided for database saving
    if (onSave) {
      onSave({ json, html });
    }
  }, 500);

  // Removed localStorage hydration. Now we only respect the passed initialContent prop (or fallback).
  useEffect(() => {
    if (propInitialContent) {
      setInitialContent(propInitialContent);
    } else {
      setInitialContent(defaultEditorContent);
    }
  }, [propInitialContent]);

  if (!initialContent) return null;

  return (
    <div className={cn("w-full min-h-[200px]", className)}>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          immediatelyRender={false}
          extensions={extensions}
          className={cn("w-full border-muted bg-background sm:rounded-lg sm:border sm:shadow-lg min-h-[200px]", className)}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            
            // Call the onUpdate prop if provided
            if (onUpdate) {
              const json = editor.getJSON();
              const html = highlightCodeblocks(editor.getHTML());
              onUpdate({ json, html });
            }
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>
          <EditorBubble
            tippyOptions={{
              placement: "top",
              animation: "shift-away",
              duration: 100,
              offset: [0, 8],
            }}
            className="flex w-fit items-center gap-1 rounded-md border bg-popover/90 px-1 py-1 shadow-md backdrop-blur supports-[backdrop-filter]:bg-popover/60"
          >
            <NodeSelector open={openNode} onOpenChange={setOpenNode} /> 
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />    
            
            <TextButtons />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default NovelEditor;
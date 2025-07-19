"use client";

import { 
  EditorContent, 
  EditorRoot, 
  EditorBubble,
  type EditorInstance,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  handleCommandNavigation,
} from "novel";
import { defaultExtensions } from "./extensions";
import { suggestionItems } from "./slash-command";
import { TextButtons } from "./text-buttons";
import { ColorSelector } from "./color-selector";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { jsonToHTML } from "@/lib/novel-utils";
import { YoutubeDialogHandler } from "./youtube-dialog-handler";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NovelEditorProps {
  initialContent?: any;
  onUpdate?: (data: { json: any; html: string }) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export function NovelEditor({
  initialContent,
  onUpdate,
  className,
  compact = false,
}: NovelEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [openColor, setOpenColor] = useState(false);

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();
      const html = jsonToHTML(json);
      setContent(json);
      setSaveStatus("Saving...");
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate({ json, html });
      }
      
      // Simulate save completion
      setTimeout(() => setSaveStatus("Saved"), 500);
    },
    500
  );

  return (
    <YoutubeDialogHandler>
      <div className={className}>
        <div className="flex items-center justify-end mb-2">
          <div className="flex items-center gap-1.5">
            {saveStatus === "Saving..." ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            ) : (
              <div className={cn(
                "h-2 w-2 rounded-full",
                saveStatus === "Saved" ? "bg-green-500" : "bg-muted-foreground"
              )} />
            )}
            <span className="text-xs text-muted-foreground">
              {saveStatus === "Saving..." ? "Saving" : "Saved"}
            </span>
          </div>
        </div>
      
      <EditorRoot>
        <EditorContent
          immediatelyRender={false}
          initialContent={content}
          onUpdate={({ editor }) => debouncedUpdates(editor)}
          extensions={defaultExtensions}
          className={`relative min-h-[500px] w-full max-w-screen-lg border border-border bg-background ${compact ? '' : 'sm:mb-[calc(20vh)]'} sm:rounded-lg sm:shadow-lg`}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
            },
          }}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
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
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl"
          >
            <TextButtons />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
      </div>
    </YoutubeDialogHandler>
  );
}

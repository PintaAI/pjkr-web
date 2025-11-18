import { useState, useRef, useEffect } from "react";
import { useEditor } from "novel";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  TextQuote,
  LinkIcon,
  Check,
  Trash,
  ImageIcon,
  Youtube,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch {
    return null;
  }
}

export const TopToolbar = () => {
  const { editor } = useEditor();
  const [headingOpen, setHeadingOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (linkOpen) {
      linkInputRef.current?.focus();
    }
  }, [linkOpen]);

  if (!editor) return null;

  const headingItems = [
    {
      name: "Normal Text",
      icon: () => <span className="text-xs font-medium">T</span>,
      command: () => editor.chain().focus().clearNodes().setParagraph().run(),
      isActive: () => editor.isActive("paragraph"),
    },
    {
      name: "Heading 1",
      icon: Heading1,
      command: () => editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      name: "Heading 2",
      icon: Heading2,
      command: () => editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      name: "Heading 3",
      icon: Heading3,
      command: () => editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive("heading", { level: 3 }),
    },
  ];

  const activeHeading = headingItems.find((item) => item.isActive()) || { name: "Normal" };

  return (
    <div className="flex items-center gap-1 border-b border-muted bg-background p-2">
      {/* Bold */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("h-8 w-8 p-0", {
          "bg-accent": editor.isActive("bold"),
        })}
      >
        <BoldIcon className="h-4 w-4" />
      </Button>

      {/* Italic */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn("h-8 w-8 p-0", {
          "bg-accent": editor.isActive("italic"),
        })}
      >
        <ItalicIcon className="h-4 w-4" />
      </Button>

      {/* Underline */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn("h-8 w-8 p-0", {
          "bg-accent": editor.isActive("underline"),
        })}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      {/* Strikethrough */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn("h-8 w-8 p-0", {
          "bg-accent": editor.isActive("strike"),
        })}
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Button>

      {/* Separator */}
      <div className="mx-1 h-6 w-px bg-muted" />

      {/* Heading Dropdown */}
      <Popover open={headingOpen} onOpenChange={setHeadingOpen}>
        <PopoverTrigger asChild>
          <Button type="button" size="sm" variant="ghost" className="h-8 gap-1 px-2">
            <span className="text-sm">{activeHeading.name}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start">
          {headingItems.map((item) => (
            <Button
              key={item.name}
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                item.command();
                setHeadingOpen(false);
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {item.isActive() && <Check className="ml-auto h-3 w-3" />}
            </Button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Unordered List */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().clearNodes().toggleBulletList().run()}
        className={cn("h-8 w-8 p-0", {
          "bg-accent": editor.isActive("bulletList"),
        })}
      >
        <List className="h-4 w-4" />
      </Button>

      {/* Ordered List */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().clearNodes().toggleOrderedList().run()}
        className={cn("h-8 w-8 p-0", {
          "bg-accent": editor.isActive("orderedList"),
        })}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      {/* Blockquote */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().clearNodes().toggleBlockquote().run()}
        className={cn("h-8 w-8 p-0", {
          "bg-accent": editor.isActive("blockquote"),
        })}
      >
        <TextQuote className="h-4 w-4" />
      </Button>

      {/* Separator */}
      <div className="mx-1 h-6 w-px bg-muted" />

      {/* Link */}
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={cn("h-8 w-8 p-0", {
              "bg-accent": editor.isActive("link"),
            })}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-1" align="start">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = linkInputRef.current;
              if (!input) return;
              const url = getUrlFromString(input.value);
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
                setLinkOpen(false);
              }
            }}
            className="flex p-1"
          >
            <input
              ref={linkInputRef}
              type="text"
              placeholder="Paste a link"
              className="flex-1 bg-background p-1 text-sm outline-none"
              defaultValue={editor.getAttributes("link").href || ""}
            />
            {editor.getAttributes("link").href ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 flex-shrink-0"
                onClick={() => {
                  editor.chain().focus().unsetLink().run();
                  if (linkInputRef.current) {
                    linkInputRef.current.value = "";
                  }
                  setLinkOpen(false);
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" className="h-8 flex-shrink-0">
                <Check className="h-4 w-4" />
              </Button>
            )}
          </form>
        </PopoverContent>
      </Popover>

      {/* Separator */}
      <div className="mx-1 h-6 w-px bg-muted" />

      {/* Image */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              if (!file.type.includes("image/")) {
                toast.error("File type not supported.");
                return;
              }
              if (file.size / 1024 / 1024 > 20) {
                toast.error("File size too big (max 20MB).");
                return;
              }

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
        }}
        className="h-8 w-8 p-0"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      {/* YouTube */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          const event = new CustomEvent('openYoutubeDialog', {
            detail: { editor }
          });
          document.dispatchEvent(event);
        }}
        className="h-8 w-8 p-0"
      >
        <Youtube className="h-4 w-4" />
      </Button>

      {/* PDF */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "application/pdf";
          input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              if (!file.type.includes("pdf")) {
                toast.error("Please select a PDF file.");
                return;
              }
              if (file.size / 1024 / 1024 > 20) {
                toast.error("File size too big (max 20MB).");
                return;
              }

              const formData = new FormData();
              formData.append("file", file);
              formData.append("type", "document");
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
                      const filename = file.name;
                      const fileSize = file.size;
                      
                      editor
                        .chain()
                        .focus()
                        .insertContent({
                          type: 'pdf',
                          attrs: {
                            src: result.data.url,
                            filename: filename,
                            size: fileSize,
                          },
                        })
                        .run();
                    } else {
                      throw new Error(result.error || "Upload failed");
                    }
                  } else {
                    const errorResult = await res.json().catch(() => ({}));
                    throw new Error(errorResult.error || "Error uploading PDF. Please try again.");
                  }
                }),
                {
                  loading: "Uploading PDF...",
                  success: "PDF uploaded successfully.",
                  error: (e) => {
                    if (e instanceof Error) {
                      return e.message;
                    }
                    return "Error uploading PDF. Please try again.";
                  },
                }
              );
            }
          };
          input.click();
        }}
        className="h-8 gap-1 px-2"
      >
        <FileText className="h-4 w-4" />
        <span className="text-xs">PDF</span>
      </Button>
    </div>
  );
};
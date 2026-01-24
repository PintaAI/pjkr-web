"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { FileText, Download, ExternalLink } from "lucide-react";

export const PdfNodeView = ({ node }: any) => {
  const { src, filename, size } = node.attrs;

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <NodeViewWrapper className="my-4">
      <div className="border rounded-lg overflow-hidden bg-card">
        {/* PDF Header */}
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">{filename || "PDF Document"}</p>
              {size && <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(src, "_blank")}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title="Open PDF in new tab"
            >
              <ExternalLink className="h-4 w-4" />
              View
            </button>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = src;
                link.download = filename || "document.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
        
        {/* PDF Viewer */}
        <div className="relative w-full" style={{ height: "600px" }}>
          <object
            data={src}
            type="application/pdf"
            className="w-full h-full"
            style={{ border: "none" }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Your browser doesn&apos;t support PDF viewing.
              </p>
              <button
                onClick={() => window.open(src, "_blank")}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Open PDF in New Tab
              </button>
            </div>
          </object>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

// @ts-nocheck
import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { PdfNodeView } from "@/components/novel/PdfNodeView";

export interface PdfAttributes {
  src: string;
  filename?: string;
  size?: number;
}

export const PdfExtension = Node.create({
  name: "pdf",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => {
          if (element && typeof element.getAttribute === 'function') {
            return element.getAttribute('data-src');
          }
          return null;
        },
      },
      filename: {
        default: null,
        parseHTML: element => {
          if (element && typeof element.getAttribute === 'function') {
            return element.getAttribute('data-filename');
          }
          return null;
        },
      },
      size: {
        default: null,
        parseHTML: element => {
          if (element && typeof element.getAttribute === 'function') {
            const size = element.getAttribute('data-size');
            return size ? parseInt(size, 10) : null;
          }
          return null;
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="pdf"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, filename, size } = HTMLAttributes as PdfAttributes;
    
    function formatFileSize(bytes: number): string {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    
    return [
      'div',
      {
        'data-type': 'pdf',
        'data-src': src,
        'data-filename': filename || '',
        'data-size': size || 0,
        class: 'pdf-embed my-4',
      },
      [
        'div',
        { class: 'border rounded-lg overflow-hidden bg-card' },
        [
          'div',
          { class: 'bg-muted/50 px-4 py-3 border-b' },
          [
            'div',
            { class: 'flex items-center gap-2' },
            [
              'span',
              { class: 'text-2xl' },
              '📄',
            ],
            [
              'div',
              {},
              [
                'p',
                { class: 'font-medium text-sm' },
                filename || 'PDF Document',
              ],
              size ? [
                'p',
                { class: 'text-xs text-muted-foreground' },
                formatFileSize(size),
              ] : '',
            ],
          ],
        ],
        [
          'div',
          { class: 'p-4 text-center text-sm text-muted-foreground' },
          [
            'a',
            {
              href: src,
              target: '_blank',
              class: 'text-primary hover:underline',
            },
            'View PDF',
          ],
        ],
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfNodeView);
  },

  addCommands() {
    return {
      setPdf: (attributes: any) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
        });
      },
    };
  },
});

export default PdfExtension;
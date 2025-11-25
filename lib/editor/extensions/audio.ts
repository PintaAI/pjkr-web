import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AudioNodeView } from "@/components/novel/AudioNodeView";

export interface AudioAttributes {
  src: string;
  filename?: string;
  size?: number;
  duration?: number;
  autoplay?: boolean;
  loop?: boolean;
}

export const AudioExtension = Node.create({
  name: "audio",
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
      duration: {
        default: null,
        parseHTML: element => {
          if (element && typeof element.getAttribute === 'function') {
            const duration = element.getAttribute('data-duration');
            return duration ? parseFloat(duration) : null;
          }
          return null;
        },
      },
      autoplay: {
        default: false,
        parseHTML: element => {
          if (element && typeof element.getAttribute === 'function') {
            return element.getAttribute('data-autoplay') === 'true';
          }
          return false;
        },
      },
      loop: {
        default: false,
        parseHTML: element => {
          if (element && typeof element.getAttribute === 'function') {
            return element.getAttribute('data-loop') === 'true';
          }
          return false;
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="audio"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, filename, size, duration, autoplay, loop } = HTMLAttributes as AudioAttributes;
    
    function formatFileSize(bytes: number): string {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
    
    function formatDuration(seconds: number): string {
      if (!seconds || isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    return [
      'div',
      {
        'data-type': 'audio',
        'data-src': src,
        'data-filename': filename || '',
        'data-size': size || 0,
        'data-duration': duration || 0,
        'data-autoplay': autoplay || false,
        'data-loop': loop || false,
        class: 'audio-embed my-4',
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
              '🎵',
            ],
            [
              'div',
              {},
              [
                'p',
                { class: 'font-medium text-sm' },
                filename || 'Audio File',
              ],
              [
                'div',
                { class: 'flex items-center gap-2 text-xs text-muted-foreground' },
                size ? formatFileSize(size) : '',
                duration ? `• ${formatDuration(duration)}` : '',
              ].filter(Boolean),
            ],
          ],
        ],
        [
          'div',
          { class: 'p-4' },
          [
            'audio',
            {
              src: src,
              controls: 'true',
              autoplay: autoplay ? 'true' : undefined,
              loop: loop ? 'true' : undefined,
              class: 'w-full',
            },
            'Your browser does not support the audio element.',
          ],
        ],
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView);
  },
});

export default AudioExtension;
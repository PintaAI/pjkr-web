import Youtube from "@tiptap/extension-youtube";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { YoutubeNodeView } from "@/components/novel/YoutubeNodeView";

export const YoutubeExtension = Youtube.extend({
  addNodeView() {
    return ReactNodeViewRenderer(YoutubeNodeView);
  },
  
  // Override HTML rendering for readonly mode
  renderHTML({ HTMLAttributes }) {
    const { src } = HTMLAttributes;
    
    // Extract video ID from src
    const getVideoId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getVideoId(src);
    const embedUrl = videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&wmode=transparent`
      : `${src}${src.includes('?') ? '&' : '?'}wmode=transparent`;

    return [
      'div',
      {
        class: 'youtube-node-view w-full my-4',
      },
      [
        'div',
        {
          class: 'relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted/5 shadow-sm',
        },
        [
          'iframe',
          {
            src: embedUrl,
            class: 'w-full h-full relative z-0',
            style: 'z-index: 0',
            frameborder: '0',
            allowfullscreen: 'true',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            title: 'YouTube Video',
          },
        ],
      ],
    ];
  },
}).configure({
  // Basic configuration
  inline: false,
  controls: true,
  nocookie: true,
  allowFullscreen: true,
  autoplay: false,
  
  // Remove default dimensions - will be handled by our custom NodeView
  width: undefined,
  height: undefined,
  
  // Remove HTML attributes since we're using custom NodeView
  HTMLAttributes: {},
  
  // Advanced settings for better user experience
  modestBranding: true,
  ccLoadPolicy: false,
  disableKBcontrols: false,
  enableIFrameApi: false,
});

export default YoutubeExtension;
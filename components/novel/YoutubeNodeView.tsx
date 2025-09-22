import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";

export const YoutubeNodeView = ({ 
  node, 
  deleteNode, 
  selected, 
  updateAttributes 
}: NodeViewProps) => {
  const { src, start } = node.attrs;

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(src);
  
  // Build embed URL with parameters
  const buildEmbedUrl = () => {
    if (!videoId) return src;
    
    const params = new URLSearchParams();
    if (start) params.set('start', start.toString());
    params.set('rel', '0');
    params.set('modestbranding', '1');
    params.set('wmode', 'transparent');
    
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  const embedUrl = buildEmbedUrl();

  return (
    <NodeViewWrapper
      className={cn(
        "youtube-node-view w-full my-4",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Simple 16:9 aspect ratio container with iframe */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted/5 shadow-sm">
        <iframe
          src={embedUrl}
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="w-full h-full relative z-0"
          style={{zIndex: 0}}
          title="YouTube Video"
        />
      </div>
    </NodeViewWrapper>
  );
};

export default YoutubeNodeView;
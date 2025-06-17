"use client";

interface NovelReadonlyProps {
  html: string;
  className?: string;
}

export function NovelReadonly({ html, className }: NovelReadonlyProps) {
  return (
    <div 
      className={`prose prose-lg dark:prose-invert prose-headings:font-title font-default max-w-full ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

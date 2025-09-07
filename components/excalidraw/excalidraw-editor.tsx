"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ExcalidrawEditor() {
  const [isClient, setIsClient] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [excalidrawKey, setExcalidrawKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force re-render of Excalidraw when theme changes
  useEffect(() => {
    if (isClient) {
      setExcalidrawKey(prev => prev + 1);
    }
  }, [theme, resolvedTheme, isClient]);

  // Determine the current theme, handling system preference
  const currentTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden">
      {isClient ? (
        <Excalidraw
          key={excalidrawKey}
          theme={currentTheme}
          initialData={{
            appState: {
              theme: currentTheme,
            },
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading Excalidraw...
        </div>
      )}
    </div>
  );
}


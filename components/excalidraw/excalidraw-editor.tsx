"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ExcalidrawEditor() {
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden">
      {isClient ? (
        <Excalidraw
          theme={theme === "dark" ? "dark" : "light"}
          initialData={{
            appState: {
              theme: theme === "dark" ? "dark" : "light",
            },
          }}
        />
      ) : (
        <p className="text-center">Loading Excalidraw...</p>
      )}
    </div>
  );
}


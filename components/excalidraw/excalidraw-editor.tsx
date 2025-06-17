"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useEffect, useState } from "react";

export default function ExcalidrawEditor() {
  // The Excalidraw component needs to be rendered on the client side.
  // We use a state to ensure it's only rendered after the component has mounted.
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {isClient ? <Excalidraw /> : <p className="text-center">Loading Excalidraw...</p>}
    </div>
  );
}

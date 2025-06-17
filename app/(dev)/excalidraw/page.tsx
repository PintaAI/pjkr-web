"use client";

import dynamic from 'next/dynamic';

const ExcalidrawEditor = dynamic(
  () => import("@/components/excalidraw/excalidraw-editor"),
  { ssr: false }
);

export default function ExcalidrawPage() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flexGrow: 1 }}>
        <ExcalidrawEditor />
      </div>
    </div>
  );
}

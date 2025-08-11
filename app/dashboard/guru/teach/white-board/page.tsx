"use client";

import dynamic from "next/dynamic";

const ExcalidrawEditor = dynamic(
  () => import("@/components/excalidraw/excalidraw-editor"),
  { ssr: false }
);

export default function GuruTeachWhiteBoardPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 rounded-lg border shadow-sm">
        <ExcalidrawEditor />
      </div>
    </div>
  );
}
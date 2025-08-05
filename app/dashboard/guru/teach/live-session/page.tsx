"use client";

export default function GuruTeachLiveSessionPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Live Session (Coming Soon)</h1>
      <p className="text-muted-foreground mt-2">
        We're preparing the live session experience here. You'll be able to start or join a real-time class session from this page.
      </p>
      <div className="mt-6 rounded-md border p-4">
        <ul className="list-disc pl-6 space-y-2">
          <li>Room creation and joining</li>
          <li>Teacher controls</li>
          <li>Student roster</li>
          <li>Integration with Whiteboard and materials</li>
        </ul>
      </div>
    </div>
  );
}
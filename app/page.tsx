import { UITest } from "@/components/ui/ui-test";
import { ServerSessionDemo } from "@/components/server-session-demo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to PJKR v5</h1>
        <p className="text-muted-foreground">Better Auth Migration Demo</p>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/auth">Sign In / Sign Up</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Server-Side Session</h2>
          <ServerSessionDemo />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">UI Components</h2>
          <UITest />
        </div>
      </div>
    </div>
  );
}

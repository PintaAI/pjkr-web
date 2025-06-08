import { UITest } from "@/components/ui/ui-test";
import { AuthCard } from "@/components/auth-card";
import { ServerSessionDemo } from "@/components/server-session-demo";

export default function Home() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to PJKR v5</h1>
        <p className="text-muted-foreground">Better Auth Migration Demo</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Client-Side Authentication</h2>
          <AuthCard />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Server-Side Session</h2>
          <ServerSessionDemo />
        </div>
      </div>
      
      <div className="mt-8 space-y-8">
        
        <div>
          <UITest />
        </div>
      </div>
    </div>
  );
}

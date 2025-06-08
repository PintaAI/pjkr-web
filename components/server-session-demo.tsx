import { getServerSession, getServerUser, hasRole, hasPlan } from "../lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export async function ServerSessionDemo() {
  const session = await getServerSession();
  const user = await getServerUser();
  const isGuru = await hasRole("GURU");
  const hasPremium = await hasPlan("PREMIUM");

  if (!session || !user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Server Session</CardTitle>
          <CardDescription>No active session (server-side check)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to see server session data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Server Session Demo</CardTitle>
        <CardDescription>Session data from server-side</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">User Information:</h4>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name || "Not provided"}</p>
          <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Session Information:</h4>
          <p><strong>Session ID:</strong> {session.session.id}</p>
          <p><strong>Created:</strong> {new Date(session.session.createdAt).toLocaleDateString()}</p>
          <p><strong>Expires:</strong> {new Date(session.session.expiresAt).toLocaleDateString()}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Server-side Role Checks:</h4>
          <p><strong>Is Guru:</strong> {isGuru ? "Yes" : "No"}</p>
          <p><strong>Has Premium:</strong> {hasPremium ? "Yes" : "No"}</p>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-2">
          <p>⚡ This data was fetched server-side using getServerSession()</p>
        </div>
      </CardContent>
    </Card>
  );
}
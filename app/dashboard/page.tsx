import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "../../components/signout-button";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/auth");
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your dashboard, {user.name || user.email}!</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Info Card */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.name || "Not provided"}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Plan:</strong> {user.plan}</p>
            </div>
          </div>

          {/* Gamification Card */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Progress</h2>
            <div className="space-y-2 text-sm">
              <p><strong>XP:</strong> {user.xp}</p>
              <p><strong>Level:</strong> {user.level}</p>
              <p><strong>Current Streak:</strong> {user.currentStreak} days</p>
              <p><strong>Max Streak:</strong> {user.maxStreak} days</p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/profile" className="block text-sm text-blue-600 hover:underline">
                Edit Profile
              </a>
              <a href="/settings" className="block text-sm text-blue-600 hover:underline">
                Settings
              </a>
              {user.role === "GURU" && (
                <a href="/guru" className="block text-sm text-blue-600 hover:underline">
                  Guru Dashboard
                </a>
              )}
              {user.role === "ADMIN" && (
                <a href="/admin" className="block text-sm text-blue-600 hover:underline">
                  Admin Panel
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
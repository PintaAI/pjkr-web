"use client";

import { AuthButton } from "../auth/auth-button";

type UserRoles = "GURU" | "MURID" | "ADMIN";

interface DashboardUser {
  id: string;
  email: string;
  name?: string;
  role: UserRoles;
}

interface AdminDashboardProps {
  user: DashboardUser;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name || user.email}!</p>
          </div>
          <AuthButton />
        </div>

        {/* User Info */}
        <div className="bg-card p-6 rounded-lg border mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Email:</span>
              <p>{user.email}</p>
            </div>
            <div>
              <span className="font-medium">Name:</span>
              <p>{user.name || "Not provided"}</p>
            </div>
            <div>
              <span className="font-medium">Role:</span>
              <p>{user.role}</p>
            </div>
          </div>
        </div>

        {/* Admin Mode - User Management */}
        <div>
          <h2 className="text-2xl font-bold mb-6">User Management</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">👥 Manage Users</h3>
              <p className="text-muted-foreground text-sm mb-4">
                View, edit, and manage all user accounts and permissions
              </p>
              <a
                href="/admin/users"
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 text-sm"
              >
                Manage Users
              </a>
            </div>

            <div className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">⚙️ System Settings</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Configure system settings and global preferences
              </p>
              <a
                href="/admin/settings"
                className="inline-block bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/80 text-sm"
              >
                Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

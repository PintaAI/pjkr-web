"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  Shield, 
  Activity, 
  BookOpen, 
  UserCheck, 
  TrendingUp,
  AlertCircle 
} from "lucide-react";
import Link from "next/link";
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

const adminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalClasses: 45,
  systemHealth: 98.5,
  newUsersToday: 23,
  pendingApprovals: 5
};

const recentActivities = [
  {
    action: "New teacher registered",
    user: "Kim Seong-ho",
    time: "2 minutes ago",
    type: "user"
  },
  {
    action: "Class created",
    user: "Teacher Lee",
    time: "15 minutes ago",
    type: "content"
  },
  {
    action: "System backup completed",
    user: "System",
    time: "1 hour ago",
    type: "system"
  },
  {
    action: "User reported issue",
    user: "Student Park",
    time: "2 hours ago",
    type: "issue"
  }
];

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}! Manage your Korean learning platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            System Status
          </Button>
          <AuthButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{adminStats.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Across all levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Management Cards */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Tools</CardTitle>
              <CardDescription>
                Manage users, content, and system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/admin/users">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Users className="h-6 w-6 text-primary" />
                        {adminStats.pendingApprovals > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {adminStats.pendingApprovals} pending
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">User Management</CardTitle>
                      <CardDescription>
                        View, edit, and manage all user accounts and permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Users</span>
                        <span className="font-medium">{adminStats.totalUsers}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/content">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <BookOpen className="h-6 w-6 text-secondary" />
                        <Badge variant="secondary" className="text-xs">
                          {adminStats.totalClasses} classes
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">Content Management</CardTitle>
                      <CardDescription>
                        Oversee all classes, lessons, and learning materials
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active Classes</span>
                        <span className="font-medium">{adminStats.totalClasses}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/settings">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Settings className="h-6 w-6 text-orange-500" />
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">System Settings</CardTitle>
                      <CardDescription>
                        Configure system settings and global preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="font-medium">{adminStats.systemHealth}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/analytics">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                        <Badge variant="outline" className="text-xs">
                          Reports
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">Analytics & Reports</CardTitle>
                      <CardDescription>
                        View detailed analytics and generate reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active Users</span>
                        <span className="font-medium">{adminStats.activeUsers}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system events and user activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {activity.type === "user" && <UserCheck className="h-4 w-4 text-primary" />}
                      {activity.type === "content" && <BookOpen className="h-4 w-4 text-primary" />}
                      {activity.type === "system" && <Settings className="h-4 w-4 text-primary" />}
                      {activity.type === "issue" && <AlertCircle className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activities
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

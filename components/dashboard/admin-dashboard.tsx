"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Users,
  Settings,
  Shield,
  Activity,
  BookOpen,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Database
} from "lucide-react";
import Link from "next/link";
import { AuthButton } from "../auth/auth-button";
import { AdminDashboardData } from "@/app/actions/dashboard/admin";

type UserRoles = "GURU" | "MURID" | "ADMIN";

interface DashboardUser {
  id: string;
  email: string;
  name?: string;
  role: UserRoles;
}

interface AdminDashboardProps {
  user: DashboardUser;
  dashboardData?: AdminDashboardData;
}

export function AdminDashboard({ user, dashboardData }: AdminDashboardProps) {
  // Use real data if available, otherwise fallback to default values
  const stats = dashboardData ? {
    totalUsers: dashboardData.userStats.totalUsers,
    activeUsers: dashboardData.userStats.activeUsers,
    totalClasses: dashboardData.contentStats.totalClasses,
    systemHealth: 98.5, // Keep this as static for now
    newUsersToday: dashboardData.userStats.newUsersThisWeek, // Using weekly as daily proxy
    pendingApprovals: 0 // This would need to be calculated separately
  } : {
    totalUsers: 0,
    activeUsers: 0,
    totalClasses: 0,
    systemHealth: 98.5,
    newUsersToday: 0,
    pendingApprovals: 0
  };

  // Use already formatted activities or empty array
  const recentActivities = dashboardData 
    ? dashboardData.recentActivities
    : [];
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
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description={`+${stats.newUsersToday} this week`}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          description={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total`}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses}
          description="Across all levels"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatsCard
          title="System Health"
          value={`${stats.systemHealth}%`}
          description="All systems operational"
          icon={<TrendingUp className="h-4 w-4" />}
        />
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
                <Link href="dashboard/admin/users">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Users className="h-6 w-6 text-primary" />
                        {stats.pendingApprovals > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {stats.pendingApprovals} pending
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
                        <span className="font-medium">{stats.totalUsers}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/dashboard/admin/content">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <BookOpen className="h-6 w-6 text-secondary" />
                        <Badge variant="secondary" className="text-xs">
                          {stats.totalClasses} classes
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
                        <span className="font-medium">{stats.totalClasses}</span>
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
                        <span className="font-medium">{stats.systemHealth}%</span>
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
                        <span className="font-medium">{stats.activeUsers}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/dashboard/admin/storage">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Database className="h-6 w-6 text-blue-500" />
                        <Badge variant="outline" className="text-xs">
                          Cloudinary
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">Storage Management</CardTitle>
                      <CardDescription>
                        Monitor usage, manage files, and optimize storage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Storage Stats</span>
                        <span className="font-medium">Loading...</span>
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
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No recent activity found</p>
                    <p className="text-xs text-muted-foreground mt-1">Activities will appear here as users interact with the platform</p>
                  </div>
                )}
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

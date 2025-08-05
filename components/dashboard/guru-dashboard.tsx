"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import {
  BookOpen,
  Users,
  FileText,
  PlusCircle,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { AuthButton } from "../auth/auth-button";
import { Difficulty } from "@prisma/client";

type UserRoles = "GURU" | "MURID" | "ADMIN";

interface DashboardUser {
  id: string;
  email: string;
  name?: string;
  role: UserRoles;
}

interface GuruStats {
  totalClasses: number;
  publishedClasses: number;
  draftClasses: number;
  totalStudents: number;
  totalMateris: number;
}

interface RecentClass {
  id: number;
  title: string;
  level: Difficulty;
  students: number;
  materis: number;
  thumbnail: string | null;
  createdAt: Date;
}

interface GuruDashboardProps {
  stats: GuruStats;
  recentClasses: RecentClass[];
  user: DashboardUser;
}

const levelLabels: Record<Difficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate", 
  ADVANCED: "Advanced",
};

const levelColors: Record<Difficulty, string> = {
  BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function GuruDashboard({ stats, recentClasses, user }: GuruDashboardProps) {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}! Ready to inspire your students today?
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <AuthButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses}
          description={`${stats.publishedClasses} published, ${stats.draftClasses} drafts`}
          icon={<BookOpen className="h-4 w-4" />}
        />

        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          description="Across all classes"
          icon={<Users className="h-4 w-4" />}
        />

        <StatsCard
          title="Published Classes"
          value={stats.publishedClasses}
          description="Live for students"
          icon={<FileText className="h-4 w-4" />}
        />

        <StatsCard
          title="Total Materials"
          value={stats.totalMateris}
          description="Learning materials"
          icon={<BookOpen className="h-4 w-4" />}
        />
      </div>

      {/* Teaching Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Teaching Tools</CardTitle>
          <CardDescription>
            Manage your classes and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/guru/kelas-builder">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <PlusCircle className="h-6 w-6 text-emerald-500" />
                    <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-800">
                      Available
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">Kelas Builder</CardTitle>
                  <CardDescription>
                    Create comprehensive Korean language classes with guided steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Build Classes</span>
                    <span className="font-medium">Step-by-step</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/guru/classes">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" className="text-xs">
                      {stats.totalClasses} classes
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">My Classes</CardTitle>
                  <CardDescription>
                    View and manage your classes and materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Classes</span>
                    <span className="font-medium">{stats.totalClasses}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* New: Whiteboard */}
            <Link href="/dashboard/guru/teach/white-board">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <Badge variant="outline" className="text-xs">
                      New
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">Whiteboard</CardTitle>
                  <CardDescription>
                    Open a collaborative whiteboard (Excalidraw)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Interactive Tool</span>
                    <span className="font-medium">Excalidraw</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* New: Live Session */}
            <Link href="/dashboard/guru/teach/live-session">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Calendar className="h-6 w-6 text-purple-600" />
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">Live Session</CardTitle>
                  <CardDescription>
                    Start or join a real-time class session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Realtime</span>
                    <span className="font-medium">Soon</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* New: Create Vocabulary Set */}
            <Link href="/dashboard/guru/vocabulary/create">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <PlusCircle className="h-6 w-6 text-teal-600" />
                    <Badge variant="default" className="text-xs bg-teal-100 text-teal-800">
                      Available
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">Create Vocabulary Set</CardTitle>
                  <CardDescription>
                    Build and manage custom vocabulary sets for your classes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vocabulary</span>
                    <span className="font-medium">Set Builder</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* New: Create Soal Set */}
            <Link href="/dashboard/guru/soal/create">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <PlusCircle className="h-6 w-6 text-rose-600" />
                    <Badge variant="outline" className="text-xs">
                      New
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">Create Soal Set</CardTitle>
                  <CardDescription>
                    Create question sets for latihan or tryout assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Assessment</span>
                    <span className="font-medium">Soal Builder</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

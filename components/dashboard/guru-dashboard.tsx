"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedClasses} published, {stats.draftClasses} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Classes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedClasses}</div>
            <p className="text-xs text-muted-foreground">
              Live for students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMateris}</div>
            <p className="text-xs text-muted-foreground">
              Learning materials
            </p>
          </CardContent>
        </Card>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>

      {/* Recent Classes */}
      {recentClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Classes</CardTitle>
            <CardDescription>
              Your recently created classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClasses.map((classItem) => (
                <Link key={classItem.id} href={`/kelas/${classItem.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${levelColors[classItem.level]}`}>
                            {levelLabels[classItem.level]}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          {classItem.students}
                        </div>
                      </div>
                      <h3 className="font-medium mb-2">{classItem.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{classItem.materis} materials</span>
                        <span>{new Date(classItem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/guru/classes">
                  View All Classes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for no classes */}
      {recentClasses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-muted-foreground mb-4">
              Start creating your first class to share your knowledge with students.
            </p>
            <Button asChild>
              <Link href="/dashboard/guru/kelas-builder">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Class
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

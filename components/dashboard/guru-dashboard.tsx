"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Clock, 
  Star, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Award,
  PlusCircle
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

interface GuruDashboardProps {
  user: DashboardUser;
}

const guruStats = {
  totalClasses: 6,
  totalStudents: 342,
  completedLessons: 128,
  averageRating: 4.8,
  thisWeekHours: 24.5,
  upcomingLessons: 8
};

const myClasses = [
  {
    id: 1,
    name: "Beginner Korean (한국어 기초)",
    level: "Beginner",
    students: 124,
    progress: 75,
    nextLesson: "Past Tense Forms",
    nextTime: "Today, 2:00 PM",
    rating: 4.9
  },
  {
    id: 2,
    name: "Korean Conversation (한국어 회화)",
    level: "Intermediate", 
    students: 89,
    progress: 45,
    nextLesson: "Restaurant Dialogue",
    nextTime: "Tomorrow, 10:00 AM",
    rating: 4.7
  },
  {
    id: 3,
    name: "Korean Writing (한글 쓰기)",
    level: "Beginner",
    students: 156,
    progress: 90,
    nextLesson: "Essay Structure",
    nextTime: "Wed, 3:00 PM",
    rating: 4.8
  }
];

const recentFeedback = [
  {
    student: "Park Min-jun",
    class: "Beginner Korean",
    message: "Excellent explanation of grammar rules!",
    rating: 5,
    time: "2 hours ago"
  },
  {
    student: "Kim So-young",
    class: "Korean Conversation",
    message: "Very helpful practice sessions",
    rating: 5,
    time: "1 day ago"
  },
  {
    student: "Lee Jae-woo",
    class: "Korean Writing",
    message: "Clear guidance on writing techniques",
    rating: 4,
    time: "2 days ago"
  }
];

export function GuruDashboard({ user }: GuruDashboardProps) {
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
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guruStats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guruStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teaching Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guruStats.thisWeekHours}h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guruStats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              From {guruStats.totalStudents} students
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Teaching Tools */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Teaching Tools</CardTitle>
              <CardDescription>
                Manage your classes, content, and student progress
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
                          New
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

                <Link href="/guru/content">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <Badge variant="secondary" className="text-xs">
                          {guruStats.completedLessons} lessons
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">Content Management</CardTitle>
                      <CardDescription>
                        Create, edit, and organize learning materials and courses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Lessons</span>
                        <span className="font-medium">{guruStats.completedLessons}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/guru/classes">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <GraduationCap className="h-6 w-6 text-green-500" />
                        <Badge variant="outline" className="text-xs">
                          {guruStats.upcomingLessons} upcoming
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">My Classes</CardTitle>
                      <CardDescription>
                        View and manage your classes and student progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Active Classes</span>
                        <span className="font-medium">{guruStats.totalClasses}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/guru/analytics">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="h-6 w-6 text-blue-500" />
                        <Badge variant="outline" className="text-xs">
                          Reports
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">Analytics</CardTitle>
                      <CardDescription>
                        Track student progress and class performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Students</span>
                        <span className="font-medium">{guruStats.totalStudents}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/guru/feedback">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <MessageSquare className="h-6 w-6 text-orange-500" />
                        <Badge variant="outline" className="text-xs">
                          {guruStats.averageRating} ★
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">Student Feedback</CardTitle>
                      <CardDescription>
                        View ratings and feedback from your students
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avg Rating</span>
                        <span className="font-medium">{guruStats.averageRating}/5.0</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* My Classes Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Class Overview</CardTitle>
              <CardDescription>
                Quick view of your active classes and upcoming lessons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myClasses.map((classItem) => (
                  <Link key={classItem.id} href={`/guru/classes/${classItem.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{classItem.level}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs">{classItem.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {classItem.students}
                          </div>
                        </div>
                        <h3 className="font-medium mb-2">{classItem.name}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{classItem.progress}%</span>
                          </div>
                          <Progress value={classItem.progress} className="h-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Next: {classItem.nextLesson}</span>
                            <span className="text-muted-foreground">{classItem.nextTime}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Feedback */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>
                Latest student reviews and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeedback.map((feedback, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{feedback.student}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(feedback.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{feedback.class}</p>
                      <p className="text-sm">{feedback.message}</p>
                      <p className="text-xs text-muted-foreground">{feedback.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

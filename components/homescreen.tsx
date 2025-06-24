"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  BookOpen,
  Users,
  PlayCircle,
  Trophy,
  Star,
  Zap,
  Clock,
  Calendar,
  ArrowRight,
  Target,
  Flame,
  Brain,
  Headphones
} from 'lucide-react';
import Link from 'next/link';
import { AuthButton } from "./auth/auth-button";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface HomescreenProps {
  user: User;
}

// Mock data - replace with real data from your API
const mockData = {
  weeklyStreak: 5,
  totalXP: 1250,
  level: 8,
  progressToNextLevel: 75,
  studyTimeToday: 2.5,
  completedLessons: 45,
  totalLessons: 60,
  dailyVocabulary: {
    word: "안녕하세요",
    pronunciation: "annyeonghaseyo",
    meaning: "Hello (formal)",
    example: "안녕하세요, 만나서 반갑습니다."
  },
  apps: [
    { 
      id: 1, 
      name: "Grammar Practice", 
      icon: Brain, 
      description: "Master Korean grammar rules", 
      link: "/apps/grammar",
      color: "text-blue-500"
    },
    { 
      id: 2, 
      name: "Vocabulary Builder", 
      icon: BookOpen, 
      description: "Expand your vocabulary", 
      link: "/vocabulary",
      color: "text-green-500"
    },
    { 
      id: 3, 
      name: "Speaking Practice", 
      icon: Users, 
      description: "Improve pronunciation", 
      link: "/apps/speaking",
      color: "text-orange-500"
    },
    { 
      id: 4, 
      name: "Listening Test", 
      icon: Headphones, 
      description: "Train your listening skills", 
      link: "/apps/listening",
      color: "text-purple-500"
    }
  ],
  latestCourse: {
    title: "Beginner Korean Grammar",
    progress: 60,
    nextLesson: "Lesson 8: Past Tense",
    timeLeft: "2 days",
    link: "/kelas"
  },
  latestEvent: {
    title: "Live Speaking Session",
    date: "Today, 7:00 PM",
    instructor: "Teacher Kim",
    participants: 12,
    link: "/live-session"
  },
  upcomingActivities: [
    {
      title: "Korean Writing Practice",
      time: "Tomorrow, 3:00 PM",
      type: "Assignment",
      priority: "high"
    },
    {
      title: "Vocabulary Quiz",
      time: "Wed, 10:00 AM", 
      type: "Quiz",
      priority: "medium"
    },
    {
      title: "Grammar Review",
      time: "Thu, 2:00 PM",
      type: "Review",
      priority: "low"
    }
  ]
};

export default function Homescreen({ user }: HomescreenProps) {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || user.email}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your Korean learning journey?
          </p>
        </div>
        <div className="flex gap-2">
          {(user.role === "ADMIN" || user.role === "GURU") && (
            <Link href="/dashboard">
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}
          <AuthButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.level}</div>
            <div className="mt-2">
              <Progress value={mockData.progressToNextLevel} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {mockData.progressToNextLevel}% to level {mockData.level + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Points</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalXP.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.weeklyStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it going!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.completedLessons}/{mockData.totalLessons}
            </div>
            <div className="mt-2">
              <Progress 
                value={(mockData.completedLessons / mockData.totalLessons) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Vocabulary */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Vocabulary (일일 어휘)</CardTitle>
          <CardDescription>
            Learn a new Korean word every day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{mockData.dailyVocabulary.word}</div>
              <div className="text-lg text-muted-foreground">/{mockData.dailyVocabulary.pronunciation}/</div>
              <div className="text-lg font-medium">{mockData.dailyVocabulary.meaning}</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Example:</p>
              <p className="text-lg">{mockData.dailyVocabulary.example}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Learning Activities */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                Pick up where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{mockData.latestCourse.title}</h3>
                    <Badge variant="secondary">{mockData.latestCourse.progress}%</Badge>
                  </div>
                  <Progress value={mockData.latestCourse.progress} className="h-2 mb-3" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>Next: {mockData.latestCourse.nextLesson}</span>
                    <span>Due in {mockData.latestCourse.timeLeft}</span>
                  </div>
                  <Link href={mockData.latestCourse.link}>
                    <Button className="w-full">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </Link>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{mockData.latestEvent.title}</h3>
                    <Badge variant="outline">Live</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{mockData.latestEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{mockData.latestEvent.participants} participants</span>
                  </div>
                  <Link href={mockData.latestEvent.link}>
                    <Button variant="outline" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Join Session
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Apps */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Tools</CardTitle>
              <CardDescription>
                Practice with specialized learning apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {mockData.apps.map((app) => {
                  const IconComponent = app.icon;
                  return (
                    <Link key={app.id} href={app.link}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <IconComponent className={`h-6 w-6 ${app.color}`} />
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                          <CardDescription>{app.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4">
                <Link href="/apps">
                  <Button variant="outline" className="w-full">
                    View All Apps <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Activities */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Activities</CardTitle>
              <CardDescription>
                Your scheduled learning tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.upcomingActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {activity.type === "Assignment" && <BookOpen className="h-4 w-4 text-primary" />}
                      {activity.type === "Quiz" && <Brain className="h-4 w-4 text-primary" />}
                      {activity.type === "Review" && <Star className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <Badge 
                          variant={activity.priority === "high" ? "destructive" : activity.priority === "medium" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

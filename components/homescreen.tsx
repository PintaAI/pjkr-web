"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { StatsCard } from "./ui/stats-card";
import DailyVocab from "./home/daily-vocab";
import {
  BookOpen,
  Users,
  PlayCircle,
  Trophy,
  Star,
  Zap,
  Clock,
  ArrowRight,
  Target,
  Flame,
  Brain,
  Headphones
} from 'lucide-react';
import Link from 'next/link';
import { SearchComponent } from "./ui/search";

interface User {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  currentStreak?: number;
  xp?: number;
  level?: number;
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
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            안녕!👋 {user.name || user.email} 🇮🇩🇰🇷
          </h1>
          <p className="text-muted-foreground">
            Udah siap belajar hari ini? Yuk terus tingkatkan kemampuan bahasa Koreamu!
          </p>
        </div>
        <div className="flex-1 max-w-md">
          <SearchComponent />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Current Level"
          value={user.level || 1}
          description="Keep learning to level up!"
          icon={<Trophy className="h-4 w-4" />}
        />

        <StatsCard
          title="Experience Points"
          value={(user.xp || 0).toLocaleString()}
          description="Total earned"
          icon={<Zap className="h-4 w-4" />}
        />

        <StatsCard
          title="Study Streak"
          value={`${user.currentStreak || 0} days`}
          description="Keep it going!"
          icon={<Flame className="h-4 w-4" />}
        />

        <StatsCard
          title="Progress"
          value={`${mockData.completedLessons}/${mockData.totalLessons}`}
          description="Lessons completed"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Daily Vocabulary moved into sidebar (compact) */}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
        {/* Learning Activities */}
        <div className="lg:col-span-2">
          {/* Learning Apps */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Tools</CardTitle>
              <CardDescription>
                Practice with specialized learning apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center min-h-[100px] text-muted-foreground text-lg font-semibold">
                Coming soon
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Daily Vocabulary + Upcoming Activities */}
        <div className="space-y-6">
          <DailyVocab user={user} take={5}/>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest learning activity
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
                          variant={
                            activity.priority === "high"
                              ? "destructive"
                              : activity.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
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

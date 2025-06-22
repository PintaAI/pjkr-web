"use client";

import React from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
  weeklyStrike: 5,
  totalXP: 1250,
  level: 8,
  progressToNextLevel: 75,
  // Weekly strike calendar data
  strikeDays: [true, true, false, true, true, false, false], // M, T, W, T, F, S, S
  currentDayIndex: 4, // Friday (0-indexed)
  dailyVocabulary: {
    word: "안녕하세요",
    pronunciation: "annyeonghaseyo",
    meaning: "Hello (formal)",
    example: "안녕하세요, 만나서 반갑습니다."
  },
  apps: [
    { id: 1, name: "Grammar Practice", icon: "📝", description: "Master Korean grammar", link: "/apps/grammar" },
    { id: 2, name: "Vocabulary Builder", icon: "📚", description: "Expand your vocabulary", link: "/apps/vocabulary" },
    { id: 3, name: "Speaking Practice", icon: "🎤", description: "Improve pronunciation", link: "/apps/speaking" },
    { id: 4, name: "Listening Test", icon: "👂", description: "Train your listening", link: "/apps/listening" }
  ],
  latestCourse: {
    title: "Beginner Korean Grammar",
    progress: 60,
    nextLesson: "Lesson 8: Past Tense",
    timeLeft: "2 days",
    link: "/kelas/beginner-grammar"
  },
  latestEvent: {
    title: "Live Speaking Session",
    date: "Today, 7:00 PM",
    instructor: "Teacher Kim",
    participants: 12,
    link: "/live-session/speaking-practice"
  }
};



export default function Homescreen({ user }: HomescreenProps) {
  return (
    <div className="bg-background text-foreground min-h-screen">     
      <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-4">
        <div className="flex justify-end">
          <AuthButton variant="outline" />
        </div>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.name || user.email}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your Korean learning journey?
          </p>
          {(user.role === "ADMIN" || user.role === "GURU") && (
            <div className="mt-4">
              <Link href="/dashboard">
                <Button>
                  Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* User Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{mockData.level}</div>
              <div className="mt-2">
                <Progress value={mockData.progressToNextLevel} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{mockData.progressToNextLevel}% to level {mockData.level + 1}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total XP</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{mockData.totalXP.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">experience points</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Vocabulary */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Daily Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{mockData.dailyVocabulary.word}</div>
                <div className="text-lg text-muted-foreground mb-2">/{mockData.dailyVocabulary.pronunciation}/</div>
                <div className="text-lg font-medium">{mockData.dailyVocabulary.meaning}</div>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Example:</p>
                <p className="text-lg">{mockData.dailyVocabulary.example}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Course and Event */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-500" />
                Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">{mockData.latestCourse.title}</h3>
              <div className="mb-3">
                <Progress value={mockData.latestCourse.progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">{mockData.latestCourse.progress}% completed</p>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Next: {mockData.latestCourse.nextLesson}</p>
              <p className="text-sm text-muted-foreground mb-4">Due in {mockData.latestCourse.timeLeft}</p>
              <Link href={mockData.latestCourse.link}>
                <Button className="w-full">
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Upcoming Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">{mockData.latestEvent.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mockData.latestEvent.date}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{mockData.latestEvent.participants} participants</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">with {mockData.latestEvent.instructor}</p>
              <Link href={mockData.latestEvent.link}>
                <Button variant="outline" className="w-full">
                  Join Session <Users className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* App List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Learning Apps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockData.apps.map((app) => (
                <Link key={app.id} href={app.link}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{app.icon}</div>
                      <h3 className="font-semibold text-sm mb-1">{app.name}</h3>
                      <p className="text-xs text-muted-foreground">{app.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/apps">
                <Button variant="outline">
                  View All Apps <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

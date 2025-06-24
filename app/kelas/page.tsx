"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, BookOpen, Clock, Users, Star, Play, Calendar, Target } from "lucide-react"
import Link from "next/link"

const kelasStats = {
  enrolledClasses: 4,
  completedLessons: 28,
  totalLessons: 45,
  studyTime: 18.5, // hours this week
  streak: 9
}

const kelasList = [
  {
    id: 1,
    name: "Beginner Korean (한국어 기초)",
    description: "Learn basic Korean grammar, vocabulary, and pronunciation",
    level: "Beginner",
    progress: 75,
    instructor: "Teacher Kim",
    students: 124,
    lessons: 20,
    duration: "8 weeks",
    nextLesson: "Lesson 16: Past Tense",
    color: "bg-blue-500",
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    name: "Korean Conversation (한국어 회화)",
    description: "Practice daily conversations and improve speaking skills",
    level: "Intermediate",
    progress: 45,
    instructor: "Teacher Lee",
    students: 89,
    lessons: 15,
    duration: "6 weeks",
    nextLesson: "Lesson 8: Ordering Food",
    color: "bg-green-500",
    image: "/api/placeholder/300/200"
  },
  {
    id: 3,
    name: "Korean Writing (한글 쓰기)",
    description: "Master Hangul writing and Korean sentence structure",
    level: "Beginner",
    progress: 90,
    instructor: "Teacher Park",
    students: 156,
    lessons: 12,
    duration: "4 weeks",
    nextLesson: "Lesson 11: Complex Sentences",
    color: "bg-purple-500",
    image: "/api/placeholder/300/200"
  },
  {
    id: 4,
    name: "TOPIK Preparation (토픽 준비)",
    description: "Prepare for TOPIK exam with practice tests and strategies",
    level: "Advanced",
    progress: 20,
    instructor: "Teacher Choi",
    students: 67,
    lessons: 25,
    duration: "12 weeks",
    nextLesson: "Lesson 6: Reading Comprehension",
    color: "bg-orange-500",
    image: "/api/placeholder/300/200"
  }
]

const upcomingLessons = [
  {
    class: "Beginner Korean",
    lesson: "Past Tense Forms",
    time: "Today, 2:00 PM",
    duration: "45 min",
    type: "Live Session"
  },
  {
    class: "Korean Conversation",
    lesson: "Restaurant Dialogue",
    time: "Tomorrow, 10:00 AM",
    duration: "30 min",
    type: "Practice"
  },
  {
    class: "Korean Writing",
    lesson: "Essay Structure",
    time: "Wed, 3:00 PM",
    duration: "60 min",
    type: "Workshop"
  }
]

export default function KelasPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelas (Classes)</h1>
          <p className="text-muted-foreground">
            Continue your Korean learning journey with structured classes
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Browse All Classes
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kelasStats.enrolledClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active classes
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
              {kelasStats.completedLessons}/{kelasStats.totalLessons}
            </div>
            <div className="mt-2">
              <Progress 
                value={(kelasStats.completedLessons / kelasStats.totalLessons) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kelasStats.studyTime}h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kelasStats.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Classes Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>
                Your enrolled Korean language classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {kelasList.map((kelas) => (
                  <Link key={kelas.id} href={`/kelas/${kelas.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{kelas.level}</Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {kelas.students}
                          </div>
                        </div>
                        <CardTitle className="text-lg">{kelas.name}</CardTitle>
                        <CardDescription>{kelas.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{kelas.progress}%</span>
                          </div>
                          <Progress value={kelas.progress} className="h-2" />
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{kelas.lessons} lessons</span>
                            <span>{kelas.duration}</span>
                          </div>
                          
                          <div className="pt-2">
                            <p className="text-sm font-medium">Next: {kelas.nextLesson}</p>
                            <p className="text-xs text-muted-foreground">with {kelas.instructor}</p>
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

        {/* Upcoming Lessons */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Lessons</CardTitle>
              <CardDescription>
                Your scheduled learning sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingLessons.map((lesson, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{lesson.lesson}</p>
                        <Badge variant="outline" className="text-xs">
                          {lesson.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{lesson.class}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.time}</span>
                        <span>•</span>
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

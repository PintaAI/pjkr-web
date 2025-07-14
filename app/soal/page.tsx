"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Clock, Trophy, Target, Users, BookOpen, Brain } from "lucide-react"
import Link from "next/link"

const soalStats = {
  totalQuestions: 450,
  completed: 180,
  correctAnswers: 150,
  averageScore: 83,
  timeSpent: 25.5, // hours
  streak: 12
}

const categories = [
  {
    id: 1,
    title: "Latihan",
    description: "Practice questions for skill improvement",
    icon: BookOpen,
    questionsCount: 250,
    completed: 120,
    difficulty: "Mixed",
    color: "bg-blue-500",
    link: "/soal/latihan"
  },
  {
    id: 2,
    title: "Tryout",
    description: "Mock exams to test your knowledge",
    icon: Brain,
    questionsCount: 200,
    completed: 60,
    difficulty: "Advanced",
    color: "bg-purple-500",
    link: "/soal/tryout"
  }
]

const recentActivity = [
  {
    type: "Latihan",
    title: "Grammar Basics",
    score: 85,
    questions: 20,
    timeAgo: "2 hours ago",
    status: "completed"
  },
  {
    type: "Tryout",
    title: "TOEFL Reading Practice",
    score: 92,
    questions: 30,
    timeAgo: "1 day ago",
    status: "completed"
  },
  {
    type: "Latihan",
    title: "Vocabulary Set 1",
    score: 78,
    questions: 15,
    timeAgo: "2 days ago",
    status: "completed"
  },
  {
    type: "Tryout",
    title: "Speaking Assessment",
    score: null,
    questions: 25,
    timeAgo: "3 days ago",
    status: "in-progress"
  }
]

export default function SoalPage() {

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Soal & Latihan</h1>
          <p className="text-muted-foreground">
            Practice questions and mock exams to improve your skills
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Quick Practice
          </Button>
          <Button variant="outline">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soalStats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              {soalStats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soalStats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              {soalStats.correctAnswers}/{soalStats.completed} correct
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soalStats.timeSpent}h</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soalStats.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Categories */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Practice Categories</CardTitle>
              <CardDescription>
                Choose a category to start practicing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  const progress = Math.round((category.completed / category.questionsCount) * 100)
                  
                  return (
                    <Link key={category.id} href={category.link}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg ${category.color}/10`}>
                              <Icon className={`h-5 w-5 text-${category.color.split('-')[1]}-500`} />
                            </div>
                            <Badge variant="secondary">{category.difficulty}</Badge>
                          </div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{category.questionsCount} questions</span>
                              <span>{progress}% complete</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="text-sm text-muted-foreground">
                              {category.completed} of {category.questionsCount} completed
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
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
                Your latest practice sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.questions} questions</span>
                        {activity.score && (
                          <>
                            <span>•</span>
                            <span>{activity.score}%</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/soal/latihan">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                <span>Start Practice</span>
                <span className="text-xs text-muted-foreground">Random questions</span>
              </Button>
            </Link>
            
            <Link href="/soal/tryout">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                <Brain className="h-6 w-6" />
                <span>Take Tryout</span>
                <span className="text-xs text-muted-foreground">Mock exam</span>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
              <Trophy className="h-6 w-6" />
              <span>View Results</span>
              <span className="text-xs text-muted-foreground">Your progress</span>
            </Button>
            
            <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Leaderboard</span>
              <span className="text-xs text-muted-foreground">Compare scores</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

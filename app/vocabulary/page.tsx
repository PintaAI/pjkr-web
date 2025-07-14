"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, BookOpen, Trophy, Target, Plus, Star } from "lucide-react"

const vocabularyStats = {
  totalWords: 1250,
  masteredWords: 850,
  todayGoal: 20,
  completed: 12,
  streak: 7
}

const vocabularyCategories = [
  {
    id: 1,
    title: "Academic English",
    description: "Essential words for academic contexts",
    wordCount: 300,
    difficulty: "Intermediate",
    progress: 75,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Business English", 
    description: "Professional vocabulary for workplace",
    wordCount: 250,
    difficulty: "Advanced",
    progress: 60,
    color: "bg-green-500"
  },
  {
    id: 3,
    title: "TOEFL Preparation",
    description: "High-frequency TOEFL vocabulary",
    wordCount: 400,
    difficulty: "Advanced",
    progress: 45,
    color: "bg-purple-500"
  },
  {
    id: 4,
    title: "Daily Conversation",
    description: "Common words for everyday use",
    wordCount: 300,
    difficulty: "Beginner",
    progress: 90,
    color: "bg-orange-500"
  }
]

const recentWords = [
  { word: "Ambiguous", meaning: "Having more than one possible meaning", mastered: true },
  { word: "Advocate", meaning: "To publicly support or recommend", mastered: true },
  { word: "Coherent", meaning: "Logical and consistent", mastered: false },
  { word: "Deteriorate", meaning: "To become worse in quality", mastered: false },
  { word: "Elaborate", meaning: "To explain in more detail", mastered: true }
]

export default function VocabularyPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vocabulary</h1>
          <p className="text-muted-foreground">
            Expand your vocabulary with structured learning
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Word
          </Button>
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Practice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vocabularyStats.totalWords}</div>
            <p className="text-xs text-muted-foreground">
              {vocabularyStats.masteredWords} mastered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vocabularyStats.completed}/{vocabularyStats.todayGoal}
            </div>
            <div className="mt-2">
              <Progress 
                value={(vocabularyStats.completed / vocabularyStats.todayGoal) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vocabularyStats.streak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastery Rate</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((vocabularyStats.masteredWords / vocabularyStats.totalWords) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vocabulary categories or words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Categories */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Categories</CardTitle>
              <CardDescription>
                Choose a category to start learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {vocabularyCategories.map((category) => (
                  <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <Badge variant="secondary">{category.difficulty}</Badge>
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category.wordCount} words</span>
                          <span>{category.progress}% complete</span>
                        </div>
                        <Progress value={category.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Words */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Words</CardTitle>
              <CardDescription>
                Your latest vocabulary additions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWords.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.mastered ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{item.word}</p>
                      <p className="text-xs text-muted-foreground">{item.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Words
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

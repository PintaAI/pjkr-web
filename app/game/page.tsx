"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gamepad2, Trophy, Target, Clock, Star, Zap, Users, Award, Play, } from "lucide-react"

const gameStats = {
  totalGames: 45,
  gamesWon: 32,
  currentStreak: 8,
  bestScore: 2450,
  totalPlayTime: 12.5, // hours
  level: 15,
  experiencePoints: 3420,
  experienceToNext: 580
}

const gameCategories = [
  {
    id: 1,
    title: "Word Puzzle",
    description: "Challenge your vocabulary with word games",
    icon: Target,
    gamesCount: 15,
    completed: 12,
    difficulty: "Easy",
    color: "bg-green-500",
    playTime: "5-10 min",
    players: "1 Player"
  },
  {
    id: 2,
    title: "Grammar Quest",
    description: "Adventure through grammar challenges",
    icon: Zap,
    gamesCount: 20,
    completed: 15,
    difficulty: "Medium",
    color: "bg-blue-500",
    playTime: "10-15 min",
    players: "1 Player"
  },
  {
    id: 3,
    title: "Speed Reading",
    description: "Race against time to read and understand",
    icon: Clock,
    gamesCount: 10,
    completed: 5,
    difficulty: "Hard",
    color: "bg-purple-500",
    playTime: "3-5 min",
    players: "1 Player"
  },
  {
    id: 4,
    title: "Multiplayer Quiz",
    description: "Compete with friends in real-time",
    icon: Users,
    gamesCount: 8,
    completed: 3,
    difficulty: "Mixed",
    color: "bg-orange-500",
    playTime: "15-20 min",
    players: "2-6 Players"
  }
]

const recentGames = [
  {
    title: "Word Builder Challenge",
    category: "Word Puzzle",
    score: 1850,
    duration: "8 min",
    result: "won",
    timeAgo: "30 min ago"
  },
  {
    title: "Grammar Sprint",
    category: "Grammar Quest",
    score: 2100,
    duration: "12 min",
    result: "won",
    timeAgo: "2 hours ago"
  },
  {
    title: "Speed Comprehension",
    category: "Speed Reading",
    score: 890,
    duration: "4 min",
    result: "lost",
    timeAgo: "1 day ago"
  },
  {
    title: "English Trivia Battle",
    category: "Multiplayer Quiz",
    score: 1650,
    duration: "18 min",
    result: "won",
    timeAgo: "2 days ago"
  }
]

const achievements = [
  { title: "First Win", description: "Win your first game", unlocked: true },
  { title: "Speed Demon", description: "Complete 5 speed reading games", unlocked: true },
  { title: "Grammar Master", description: "Perfect score in grammar quest", unlocked: false },
  { title: "Social Player", description: "Play 10 multiplayer games", unlocked: false }
]

export default function GamePage() {
  const [activeTab, setActiveTab] = useState<"games" | "achievements">("games")

  const winRate = Math.round((gameStats.gamesWon / gameStats.totalGames) * 100)
  const levelProgress = Math.round((gameStats.experiencePoints / (gameStats.experiencePoints + gameStats.experienceToNext)) * 100)

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Games</h1>
          <p className="text-muted-foreground">
            Learn English through fun and interactive games
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Quick Play
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
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameStats.level}</div>
            <div className="mt-2">
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {gameStats.experienceToNext} XP to next level
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <p className="text-xs text-muted-foreground">
              {gameStats.gamesWon} wins of {gameStats.totalGames} games
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameStats.bestScore.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Personal record
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameStats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Games won in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "games" ? "default" : "ghost"}
          onClick={() => setActiveTab("games")}
          className="rounded-b-none"
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          Games
        </Button>
        <Button
          variant={activeTab === "achievements" ? "default" : "ghost"}
          onClick={() => setActiveTab("achievements")}
          className="rounded-b-none"
        >
          <Award className="h-4 w-4 mr-2" />
          Achievements
        </Button>
      </div>

      {activeTab === "games" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Game Categories */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Game Categories</CardTitle>
                <CardDescription>
                  Choose a game type to start playing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {gameCategories.map((category) => {
                    const Icon = category.icon
                    const progress = Math.round((category.completed / category.gamesCount) * 100)
                    
                    return (
                      <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
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
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>{category.gamesCount} games</span>
                              <span>{progress}% complete</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{category.playTime}</span>
                              <span>{category.players}</span>
                            </div>
                            <Button className="w-full mt-2">
                              <Play className="h-4 w-4 mr-2" />
                              Play Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Games */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
                <CardDescription>
                  Your latest gaming sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentGames.map((game, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        game.result === 'won' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{game.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {game.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{game.score} pts</span>
                          <span>•</span>
                          <span>{game.duration}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{game.timeAgo}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Games
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              Track your gaming milestones and unlock rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className={`${achievement.unlocked ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <Award className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  )
}

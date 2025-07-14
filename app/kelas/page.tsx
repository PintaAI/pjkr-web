import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Users, Star, Play, Calendar, Target } from "lucide-react"
import Link from "next/link"

interface KelasData {
  id: number
  title: string
  description: string | null
  level: string
  thumbnail: string | null
  author: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  materis: Array<{
    id: number
    title: string
    order: number
    isDemo: boolean
  }>
  members: Array<{
    id: string
    name: string | null
    image: string | null
  }>
  _count: {
    materis: number
    members: number
    completions: number
  }
}

interface UserStats {
  enrolledClasses: number
  completedLessons: number
  totalLessons: number
  studyTime: number
  streak: number
}

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

const levelColors: Record<string, string> = {
  BEGINNER: "bg-blue-500",
  INTERMEDIATE: "bg-green-500", 
  ADVANCED: "bg-orange-500"
}

async function getKelasData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const kelasResponse = await fetch(`${baseUrl}/api/kelas`, {
      cache: 'no-store' // Ensure fresh data on each request
    })
    
    if (!kelasResponse.ok) {
      throw new Error('Failed to fetch classes')
    }
    
    const kelasData = await kelasResponse.json()
    
    if (kelasData.success) {
      return kelasData.data
    }
    
    return []
  } catch (err) {
    console.error('Error fetching kelas data:', err)
    return []
  }
}

export default async function KelasPage() {
  const kelasList = await getKelasData()
  
  // Calculate user stats from the fetched data
  const totalClasses = kelasList.length
  const totalMateris = kelasList.reduce((sum: number, kelas: KelasData) => sum + kelas._count.materis, 0)
  
  const userStats: UserStats = {
    enrolledClasses: totalClasses,
    completedLessons: Math.floor(totalMateris * 0.6), // Mock completion rate
    totalLessons: totalMateris,
    studyTime: 18.5, // Mock data for now
    streak: 9 // Mock data for now
  }

  const calculateProgress = (kelas: KelasData): number => {
    // Mock progress calculation - in real app, this would come from user completion data
    return Math.floor(Math.random() * 100)
  }

  const getNextLesson = (kelas: KelasData): string => {
    // Mock next lesson - in real app, this would be based on user's progress
    const lessons = [
      "Grammar Basics",
      "Vocabulary Building", 
      "Conversation Practice",
      "Reading Comprehension",
      "Writing Practice"
    ]
    return lessons[Math.floor(Math.random() * lessons.length)]
  }



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
            <div className="text-2xl font-bold">{userStats.enrolledClasses}</div>
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
              {userStats.completedLessons}/{userStats.totalLessons}
            </div>
            <div className="mt-2">
              <Progress 
                value={userStats.totalLessons > 0 ? (userStats.completedLessons / userStats.totalLessons) * 100 : 0} 
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
            <div className="text-2xl font-bold">{userStats.studyTime}h</div>
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
            <div className="text-2xl font-bold">{userStats.streak} days</div>
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
                {kelasList.map((kelas: KelasData) => {
                  const progress = calculateProgress(kelas)
                  const nextLesson = getNextLesson(kelas)
                  
                  return (
                    <Link key={kelas.id} href={`/kelas/${kelas.id}`}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{kelas.level}</Badge>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-3 w-3 mr-1" />
                              {kelas._count.members}
                            </div>
                          </div>
                          <CardTitle className="text-lg">{kelas.title}</CardTitle>
                          <CardDescription>{kelas.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{kelas._count.materis} lessons</span>
                              <span>{kelas.level.toLowerCase()}</span>
                            </div>
                            
                            <div className="pt-2">
                              <p className="text-sm font-medium">Next: {nextLesson}</p>
                              <p className="text-xs text-muted-foreground">with {kelas.author.name || 'Instructor'}</p>
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

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Progress } from "@/components/ui/progress"
import {  Target,  Star, Zap,  GraduationCap } from "lucide-react"
import { useSession } from "@/lib/hooks/use-session"


export default function GamePage() {
   const { user, isLoading } = useSession()

   if (isLoading) {
     return (
       <div className="container mx-auto px-6 py-8 max-w-6xl">
         <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
           <p className="text-muted-foreground">Loading your statistics...</p>
         </div>
       </div>
     )
   }

   if (!user) {
     return (
       <div className="container mx-auto px-6 py-8 max-w-6xl">
         <div className="text-center">
           <p className="text-red-500">Please log in to view your statistics</p>
         </div>
       </div>
     )
   }

   // Calculate level progress (assuming 1000 XP per level)
   const currentLevel = user.level || 1
   const currentXP = user.xp || 0
   const xpForNextLevel = currentLevel * 1000
   const xpProgress = currentXP % 1000
   const levelProgress = Math.round((xpProgress / 1000) * 100)

   return (
     <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
       {/* Header */}
       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
         <div>
           <h1 className="text-3xl font-bold tracking-tight">Your Statistics</h1>
           <p className="text-muted-foreground">
             Track your learning progress and achievements
           </p>
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
             <div className="text-2xl font-bold">{currentLevel}</div>
             <div className="mt-2">
               <Progress value={levelProgress} className="h-2" />
               <p className="text-xs text-muted-foreground mt-1">
                 {1000 - xpProgress} XP to next level
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
             <div className="text-2xl font-bold">{currentXP.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
               Total XP earned
             </p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
             <Target className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{user.currentStreak || 0}</div>
             <p className="text-xs text-muted-foreground">
               Days learning in a row
             </p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Classes Joined</CardTitle>
             <GraduationCap className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{(user.joinedKelasCount as number) || 0}</div>
             <p className="text-xs text-muted-foreground">
               Active class enrollments
             </p>
           </CardContent>
         </Card>
       </div>

     </div>
   )
}

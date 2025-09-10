import { getUserProfileById } from "@/app/actions/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, BookOpen, FileQuestion, Trophy, Flame, Star, UserX } from "lucide-react";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  const result = await getUserProfileById(userId);

  if (!result.success) {
    if (result.error === "Profile not found") {
      notFound();
    }
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <UserX className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold">Profile Not Available</p>
                <p className="text-muted-foreground">{result.error || "Unable to load profile"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = result.data;
  const isOwnProfile = result.isOwnProfile;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name || "Anonymous User"}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">{user.role}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Level {user.level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{user.xp} XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{user.currentStreak} day streak</span>
                </div>
              </div>
              {!isOwnProfile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Viewing {user.name || "this user's"} profile
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{user.joinedKelas.length}</p>
                <p className="text-sm text-muted-foreground">Joined Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileQuestion className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{user.soals.length}</p>
                <p className="text-sm text-muted-foreground">Questions Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{user.vocabularyItems.length}</p>
                <p className="text-sm text-muted-foreground">Vocabulary Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{user.stats.totalActivities}</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content Tabs */}
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Joined Classes</CardTitle>
              <CardDescription>
                {isOwnProfile ? "Classes you've enrolled in" : `Classes ${user.name || 'this user'} has joined`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.joinedKelas.length === 0 ? (
                <p className="text-muted-foreground">
                  {isOwnProfile ? "No classes joined yet." : "No public classes to show."}
                </p>
              ) : (
                <div className="space-y-4">
                  {user.joinedKelas.map((kelas: any) => (
                    <div key={kelas.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={kelas.thumbnail || ""} alt={kelas.title} />
                        <AvatarFallback>{kelas.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{kelas.title}</h3>
                        <p className="text-sm text-muted-foreground">{kelas.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{kelas.level}</Badge>
                          <Badge variant="outline">{kelas.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {kelas._count.materis} materials
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(kelas.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Items</CardTitle>
              <CardDescription>
                {isOwnProfile ? "Words and phrases you've created" : `Vocabulary items ${user.name || 'this user'} has created`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.vocabularyItems.length === 0 ? (
                <p className="text-muted-foreground">
                  {isOwnProfile ? "No vocabulary items created yet." : "No public vocabulary items to show."}
                </p>
              ) : (
                <div className="space-y-2">
                  {user.vocabularyItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{item.korean}</span>
                        <span className="text-muted-foreground ml-2">•</span>
                        <span className="text-muted-foreground">{item.indonesian}</span>
                        {item.collection && (
                          <Badge variant="outline" className="ml-2">
                            {item.collection.title}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.isLearned ? "default" : "secondary"}>
                          {item.isLearned ? "Learned" : "Learning"}
                        </Badge>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Questions Created</CardTitle>
              <CardDescription>
                {isOwnProfile ? "Assessment questions you've authored" : `Questions ${user.name || 'this user'} has created`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.soals.length === 0 ? (
                <p className="text-muted-foreground">
                  {isOwnProfile ? "No questions created yet." : "No public questions to show."}
                </p>
              ) : (
                <div className="space-y-4">
                  {user.soals.map((soal: any) => (
                    <div key={soal.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{soal.pertanyaan}</p>
                          {soal.explanation && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {soal.explanation}
                            </p>
                          )}
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{soal.difficulty}</Badge>
                            <Badge variant={soal.isActive ? "default" : "secondary"}>
                              {soal.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {soal.koleksiSoal && (
                              <Badge variant="outline">{soal.koleksiSoal.nama}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                {isOwnProfile ? "Your learning activities and achievements" : `${user.name || 'This user'}'s recent activity`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.activityLogs.length === 0 ? (
                <p className="text-muted-foreground">
                  {isOwnProfile ? "No recent activity." : "No public activity to show."}
                </p>
              ) : (
                <div className="space-y-3">
                  {user.activityLogs.slice(0, 20).map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{activity.type.replace(/_/g, ' ')}</span>
                        {activity.xpEarned && activity.xpEarned > 0 && (
                          <Badge variant="outline" className="text-green-600">
                            +{activity.xpEarned} XP
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
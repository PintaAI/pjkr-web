import { getUserProfileById } from "@/app/actions/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Star, UserX } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostsTab from "@/components/profile/posts-tab";
import ClassesTab from "@/components/profile/classes-tab";
import { getServerSession } from "@/lib/session";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const session = await getServerSession();

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
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Profile Header - Instagram Style */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 md:h-40 md:w-40">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="text-2xl md:text-3xl">
                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-light mb-1">{user.name || "Anonymous User"}</h1>
              <p className="text-muted-foreground text-sm mb-2">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4 text-sm">
                <Badge variant="secondary" className="px-2 py-1">{user.role}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Level {user.level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-orange-500" />
                  <span>{user.xp} XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span>{user.currentStreak} day streak</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-4">
                <p className="text-sm leading-relaxed max-w-md mx-auto md:mx-0 whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}

            {/* Edit Profile Button */}
            {isOwnProfile && (
              <div className="mb-4">
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm" className="px-4 py-1 text-sm font-medium border-gray-300 hover:border-gray-400">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            )}

            {!isOwnProfile && (
              <p className="text-sm text-muted-foreground">
                Viewing {user.name || "this user's"} profile
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          
            
           
            
              <PostsTab posts={user.authoredPosts} isOwnProfile={isOwnProfile} currentUserId={session?.user?.id} />
         
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {user.role.toLowerCase() === "guru" ? "Created Classes" : "Joined Classes"}
              </CardTitle>
              <CardDescription>
                {user.role.toLowerCase() === "guru"
                  ? (isOwnProfile ? "Classes you've created" : `Classes ${user.name || 'this user'} has created`)
                  : (isOwnProfile ? "Classes you've enrolled in" : `Classes ${user.name || 'this user'} has joined`)
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassesTab user={user} isOwnProfile={isOwnProfile} />
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
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageCircle, 
  Users, 
  Clock, 
  Send,
  Settings,
  Heart,
  ThumbsUp,
} from 'lucide-react'

interface LiveSession {
  id: string
  title: string
  description: string
  host: {
    name: string
    avatar: string
    title: string
    bio: string
  }
  participants: number
  startTime: string
  duration: number
  status: string
  category: string
  topics: string[]
}

interface Comment {
  id: string
  user: string
  message: string
  timestamp: string
  likes: number
}

interface LiveSessionComponentProps {
  session: LiveSession
}

export function LiveSessionComponent({ session }: LiveSessionComponentProps) {
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: 'John Doe',
      message: 'Great explanation! This is really helpful.',
      timestamp: new Date().toISOString(),
      likes: 5
    },
    {
      id: '2',
      user: 'Jane Smith',
      message: 'Can you share the code example again?',
      timestamp: new Date().toISOString(),
      likes: 2
    },
    {
      id: '3',
      user: 'Mike Johnson',
      message: 'This is exactly what I needed to learn. Thank you!',
      timestamp: new Date().toISOString(),
      likes: 8
    },
    {
      id: '4',
      user: 'Sarah Wilson',
      message: 'Could you go over the async/await part once more?',
      timestamp: new Date().toISOString(),
      likes: 3
    }
  ])

  const [participantCount, setParticipantCount] = useState(session.participants)

  useEffect(() => {
    // Simulate live participant count changes
    const interval = setInterval(() => {
      setParticipantCount(prev => prev + Math.floor(Math.random() * 3) - 1)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: 'You',
        message: newComment,
        timestamp: new Date().toISOString(),
        likes: 0
      }
      setComments(prev => [...prev, comment])
      setNewComment('')
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getElapsedTime = () => {
    const start = new Date(session.startTime)
    const now = new Date()
    const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60)
    return elapsed > 0 ? `${elapsed}m` : '0m'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Conference */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {/* Main Video Stream */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">{session.host.name}</p>
                      <p className="text-sm opacity-75">Host Video Stream</p>
                    </div>
                  </div>

                  {/* User's Video (Small overlay) */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      {isVideoOn ? (
                        <div className="text-white text-xs text-center">
                          <Video className="h-6 w-6 mx-auto mb-1" />
                          <p>You</p>
                        </div>
                      ) : (
                        <div className="text-white text-xs text-center">
                          <VideoOff className="h-6 w-6 mx-auto mb-1" />
                          <p>You</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                      <Button
                        size="sm"
                        variant={isVideoOn ? "default" : "secondary"}
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isAudioOn ? "default" : "secondary"}
                        onClick={() => setIsAudioOn(!isAudioOn)}
                        className="rounded-full w-10 h-10 p-0"
                      >
                        {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full w-10 h-10 p-0"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Live Indicator */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive" className="animate-pulse">
                      🔴 LIVE
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Description */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 LIVE
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{participantCount} watching</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Started {getElapsedTime()} ago</span>
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">{session.title}</CardTitle>
                <CardDescription className="text-base">{session.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Topics Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.topics.map((topic, index) => (
                        <Badge key={index} variant="outline">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {session.host.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{session.host.name}</p>
                      <p className="text-sm text-muted-foreground">{session.host.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{session.host.bio}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Comments List */}
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 pb-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                            {comment.user[0]}
                          </div>
                          <span className="text-sm font-medium">{comment.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm pl-8">{comment.message}</p>
                        <div className="flex items-center gap-2 pl-8">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Comment Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
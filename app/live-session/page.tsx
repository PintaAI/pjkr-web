import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Video } from 'lucide-react'

// Dummy live session data
const liveSessions = [
  {
    id: 'room-1',
    title: 'JavaScript Fundamentals Bootcamp',
    description: 'Learn the basics of JavaScript programming with hands-on exercises and real-world examples.',
    host: {
      name: 'Sarah Johnson',
      avatar: '/placeholder-avatar.jpg',
      title: 'Senior Frontend Developer'
    },
    participants: 45,
    startTime: '2025-06-13T20:00:00Z',
    duration: 120, // minutes
    status: 'live',
    category: 'Programming'
  },
  {
    id: 'room-2',
    title: 'React Advanced Patterns',
    description: 'Deep dive into advanced React patterns including hooks, context, and performance optimization.',
    host: {
      name: 'Mike Chen',
      avatar: '/placeholder-avatar.jpg',
      title: 'React Specialist'
    },
    participants: 32,
    startTime: '2025-06-13T19:30:00Z',
    duration: 90,
    status: 'live',
    category: 'React'
  },
  {
    id: 'room-3',
    title: 'Database Design Workshop',
    description: 'Learn how to design efficient database schemas and optimize queries for better performance.',
    host: {
      name: 'Alex Rivera',
      avatar: '/placeholder-avatar.jpg',
      title: 'Database Architect'
    },
    participants: 28,
    startTime: '2025-06-13T21:00:00Z',
    duration: 150,
    status: 'upcoming',
    category: 'Database'
  },
  {
    id: 'room-4',
    title: 'UI/UX Design Principles',
    description: 'Explore modern design principles and create user-friendly interfaces that convert.',
    host: {
      name: 'Emma Davis',
      avatar: '/placeholder-avatar.jpg',
      title: 'UX Designer'
    },
    participants: 67,
    startTime: '2025-06-13T18:45:00Z',
    duration: 105,
    status: 'live',
    category: 'Design'
  }
]

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'live':
      return 'bg-red-500 text-white'
    case 'upcoming':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export default function LiveSessionsPage() {
  const liveSessions_filtered = liveSessions.filter(session => session.status === 'live')
  const upcomingSessions = liveSessions.filter(session => session.status === 'upcoming')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Sessions</h1>
        <p className="text-muted-foreground">
          Join live learning sessions with industry experts and connect with fellow learners.
        </p>
      </div>

      {/* Live Sessions */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Video className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-semibold">Currently Live</h2>
          <Badge variant="destructive" className="animate-pulse">
            {liveSessions_filtered.length} LIVE
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveSessions_filtered.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className={getStatusColor(session.status)} variant="secondary">
                      {session.status.toUpperCase()}
                    </Badge>
                    <CardTitle className="mt-2 line-clamp-2">{session.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-3">
                      {session.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Host Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {session.host.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session.host.name}</p>
                      <p className="text-xs text-muted-foreground">{session.host.title}</p>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{session.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Started at {formatTime(session.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{session.duration} minutes</span>
                    </div>
                  </div>

                  {/* Join Button */}
                  <Link href={`/live-session/${session.id}`}>
                    <Button className="w-full" variant={session.status === 'live' ? 'default' : 'outline'}>
                      {session.status === 'live' ? 'Join Live Session' : 'View Details'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge className={getStatusColor(session.status)} variant="secondary">
                      {session.status.toUpperCase()}
                    </Badge>
                    <CardTitle className="mt-2 line-clamp-2">{session.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-3">
                      {session.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Host Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {session.host.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session.host.name}</p>
                      <p className="text-xs text-muted-foreground">{session.host.title}</p>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{session.participants} registered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Starts at {formatTime(session.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{session.duration} minutes</span>
                    </div>
                  </div>

                  {/* Join Button */}
                  <Link href={`/live-session/${session.id}`}>
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

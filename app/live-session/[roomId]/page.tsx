import { LiveSessionComponent } from '@/components/live-session-detail'
import { notFound } from 'next/navigation'


// Dummy live session data (same as in the list page)
const liveSessions = [
  {
    id: 'room-1',
    title: 'JavaScript Fundamentals Bootcamp',
    description: 'Learn the basics of JavaScript programming with hands-on exercises and real-world examples. In this comprehensive session, we\'ll cover variables, functions, objects, arrays, and modern ES6+ features.',
    host: {
      name: 'Sarah Johnson',
      avatar: '/placeholder-avatar.jpg',
      title: 'Senior Frontend Developer',
      bio: 'Sarah has 8+ years of experience building scalable web applications at top tech companies.'
    },
    participants: 45,
    startTime: '2025-06-13T20:00:00Z',
    duration: 120,
    status: 'live',
    category: 'Programming',
    topics: ['Variables & Data Types', 'Functions & Scope', 'Objects & Arrays', 'ES6+ Features', 'Async Programming']
  },
  {
    id: 'room-2',
    title: 'React Advanced Patterns',
    description: 'Deep dive into advanced React patterns including hooks, context, and performance optimization. Perfect for developers looking to level up their React skills.',
    host: {
      name: 'Mike Chen',
      avatar: '/placeholder-avatar.jpg',
      title: 'React Specialist',
      bio: 'Mike is a React core contributor and has been working with React since its early days.'
    },
    participants: 32,
    startTime: '2025-06-13T19:30:00Z',
    duration: 90,
    status: 'live',
    category: 'React',
    topics: ['Custom Hooks', 'Context Patterns', 'Performance Optimization', 'Code Splitting', 'Testing Strategies']
  },
  {
    id: 'room-3',
    title: 'Database Design Workshop',
    description: 'Learn how to design efficient database schemas and optimize queries for better performance.',
    host: {
      name: 'Alex Rivera',
      avatar: '/placeholder-avatar.jpg',
      title: 'Database Architect',
      bio: 'Alex specializes in designing high-performance database systems for enterprise applications.'
    },
    participants: 28,
    startTime: '2025-06-13T21:00:00Z',
    duration: 150,
    status: 'upcoming',
    category: 'Database',
    topics: ['Schema Design', 'Query Optimization', 'Indexing Strategies', 'Performance Tuning', 'Scaling Patterns']
  },
  {
    id: 'room-4',
    title: 'UI/UX Design Principles',
    description: 'Explore modern design principles and create user-friendly interfaces that convert.',
    host: {
      name: 'Emma Davis',
      avatar: '/placeholder-avatar.jpg',
      title: 'UX Designer',
      bio: 'Emma has designed award-winning interfaces for Fortune 500 companies and startups alike.'
    },
    participants: 67,
    startTime: '2025-06-13T18:45:00Z',
    duration: 105,
    status: 'live',
    category: 'Design',
    topics: ['User Research', 'Information Architecture', 'Visual Design', 'Usability Testing', 'Design Systems']
  }
]

interface LiveSessionPageProps {
  params: {
    roomId: string
  }
}

export default function LiveSessionPage({ params }: LiveSessionPageProps) {
  const session = liveSessions.find(s => s.id === params.roomId)

  if (!session) {
    notFound()
  }

  return <LiveSessionComponent session={session} />
}

// Generate static params for better performance
export async function generateStaticParams() {
  return liveSessions.map((session) => ({
    roomId: session.id,
  }))
}

// Generate metadata for each session
export async function generateMetadata({ params }: LiveSessionPageProps) {
  const session = liveSessions.find(s => s.id === params.roomId)
  
  if (!session) {
    return {
      title: 'Live Session Not Found',
    }
  }

  return {
    title: `${session.title} - Live Session`,
    description: session.description,
  }
}
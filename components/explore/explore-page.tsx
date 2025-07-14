"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  BookOpen,
  PlayCircle,
  Star,
  Clock,
  Brain,
  Search,
  Compass,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { useState } from 'react';


// Simplified mock data
const mockData = {
  featuredContent: [
    {
      id: 1,
      type: "Quiz",
      title: "Korean Greetings",
      description: "Learn basic Korean greetings",
      thumbnail: "🇰🇷",
      difficulty: "Beginner",
      timeEstimate: "5 min",
      rating: 4.8,
    },
    {
      id: 2,
      type: "Vocabulary",
      title: "Food & Dining",
      description: "Essential food vocabulary",
      thumbnail: "🍜",
      difficulty: "Beginner",
      timeEstimate: "10 min",
      rating: 4.7,
    },
    {
      id: 3,
      type: "Grammar",
      title: "Present Tense",
      description: "Master Korean present tense",
      thumbnail: "📚",
      difficulty: "Intermediate",
      timeEstimate: "15 min",
      rating: 4.9,
    },
    {
      id: 4,
      type: "Culture",
      title: "K-Drama Phrases",
      description: "Popular K-drama expressions",
      thumbnail: "🎭",
      difficulty: "Intermediate",
      timeEstimate: "8 min",
      rating: 4.6,
    },
    {
      id: 5,
      type: "Conversation",
      title: "Everyday Chat",
      description: "Common conversation topics",
      thumbnail: "💬",
      difficulty: "All Levels",
      timeEstimate: "12 min",
      rating: 4.8,
    },
    {
      id: 6,
      type: "Pronunciation",
      title: "Sound Practice",
      description: "Korean pronunciation guide",
      thumbnail: "🎵",
      difficulty: "Beginner",
      timeEstimate: "7 min",
      rating: 4.5,
    },
  ],

  teachers: [
    {
      id: 1,
      name: "김선생님",
      specialization: "Conversation",
      avatar: "👩‍🏫",
      rating: 4.9,
      price: "₩25,000/hr",
      isOnline: true,
    },
    {
      id: 2,
      name: "박선생님",
      specialization: "Grammar",
      avatar: "👨‍🏫",
      rating: 4.8,
      price: "₩30,000/hr",
      isOnline: false,
    },
    {
      id: 3,
      name: "이선생님",
      specialization: "TOPIK Prep",
      avatar: "👩‍💼",
      rating: 4.9,
      price: "₩35,000/hr",
      isOnline: true,
    },
  ],

  categories: [
    { name: "Vocabulary", icon: BookOpen, count: 60 },
    { name: "Grammar", icon: Brain, count: 45 },
    { name: "Conversation", icon: MessageCircle, count: 30 },
    { name: "Culture", icon: GraduationCap, count: 25 },
  ],
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "All Levels": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredContent = mockData.featuredContent.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Compass className="h-8 w-8 text-primary" />
          Explore Korean Learning
        </h1>
        <p className="text-muted-foreground">
          Discover quizzes, vocabulary sets, teachers, and more
        </p>
        
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {mockData.categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.name}
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover:bg-primary/5"
                >
                  <IconComponent className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">{category.count} items</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Featured Content */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Featured Content</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContent.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{item.thumbnail}</div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary">{item.type}</Badge>
                    <Badge className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.timeEstimate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </div>
                </div>
                <Button className="w-full">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Teachers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Featured Teachers</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {mockData.teachers.map((teacher) => (
            <Card key={teacher.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="text-3xl">{teacher.avatar}</div>
                    {teacher.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <CardDescription>{teacher.specialization}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{teacher.rating}</span>
                  </div>
                  <span className="font-medium text-primary">{teacher.price}</span>
                </div>
                <Button className="w-full" variant={teacher.isOnline ? "default" : "secondary"}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {teacher.isOnline ? "Chat Now" : "Schedule"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

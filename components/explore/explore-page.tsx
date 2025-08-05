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
    <div className="relative">
      {/* Soft radial backdrop accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="mx-auto h-64 w-[80%] max-w-5xl rounded-full blur-3xl opacity-40 dark:opacity-25 bg-primary/10" />
      </div>

      <div className="container mx-auto px-6 py-10 max-w-6xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center space-y-5">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
            <span className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary h-10 w-10 shadow-sm">
              <Compass className="h-6 w-6" />
            </span>
            <span className="relative">
              Explore Korean Learning
              <span className="absolute left-0 -bottom-1 h-[3px] w-full bg-primary/30 rounded-full" />
            </span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Discover quizzes, vocabulary sets, teachers, and more
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content, topics, or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search content"
              className="pl-11 h-11 rounded-xl bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-200 focus-visible:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            />
          </div>
        </div>

        {/* Categories */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Browse by Category</CardTitle>
            <CardDescription>Quickly jump into what you want to practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {mockData.categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.name}
                    variant="outline"
                    className="group h-20 rounded-lg flex flex-col gap-1.5 border-border/70 bg-background/50 hover:bg-muted/50 transition-colors"
                    aria-label={`Category ${category.name}`}
                  >
                    <span className="inline-flex items-center justify-center rounded-md h-8 w-8 border border-border/60 bg-background/80 group-hover:text-primary transition-colors">
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <div className="text-center">
                      <div className="font-medium text-sm">{category.name}</div>
                      <div className="text-[11px] text-muted-foreground">{category.count} items</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Featured Content */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Featured Content</h2>
            <Button variant="ghost" className="hover:bg-primary/10">View all</Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer border-border/70 transition-colors hover:border-primary/20 rounded-xl"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">{item.thumbnail}</div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge variant="secondary" className="rounded px-2 py-0.5 text-[11px]">{item.type}</Badge>
                      <Badge className={`${getDifficultyColor(item.difficulty)} rounded px-2 py-0.5 text-[11px]`}>
                        {item.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-1">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {item.timeEstimate}
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {item.rating}
                    </div>
                  </div>
                  <Button className="w-full" variant="secondary">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Featured Teachers</h2>
            <Button variant="ghost" className="hover:bg-primary/10">View all</Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {mockData.teachers.map((teacher) => (
              <Card
                key={teacher.id}
                className="group cursor-pointer border-border/70 transition-colors hover:border-primary/20 rounded-xl"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="text-3xl">{teacher.avatar}</div>
                      {teacher.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{teacher.name}</CardTitle>
                      <CardDescription>{teacher.specialization}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{teacher.rating}</span>
                    </div>
                    <span className="text-primary text-sm font-medium">{teacher.price}</span>
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
    </div>
  );
}

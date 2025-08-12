"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  BookOpen,
  Brain,
  Target,
  Calendar,
  Users,
  MessageCircle,
  Clock,
} from 'lucide-react';

// TODO: Implement Explore Page Features
const exploreFeatures = [
  {
    id: 1,
    title: "Content Discovery",
    description: "Browse quizzes, vocabulary sets, and learning materials",
    status: "pending",
    icon: BookOpen,
    estimatedTime: "2-3 days"
  },
  {
    id: 2,
    title: "Teacher Marketplace",
    description: "Find and connect with Korean language teachers",
    status: "pending", 
    icon: Users,
    estimatedTime: "3-4 days"
  },
  {
    id: 3,
    title: "Advanced Search",
    description: "Search by difficulty, topic, and learning style",
    status: "pending",
    icon: Brain,
    estimatedTime: "1-2 days"
  },
  {
    id: 4,
    title: "Category System",
    description: "Organized content by vocabulary, grammar, conversation",
    status: "pending",
    icon: Target,
    estimatedTime: "1 day"
  },
  {
    id: 5,
    title: "Schedule Integration",
    description: "Book lessons and track learning schedule",
    status: "pending",
    icon: Calendar,
    estimatedTime: "2-3 days"
  },
  {
    id: 6,
    title: "Community Features",
    description: "Discussion forums and peer learning",
    status: "pending",
    icon: MessageCircle,
    estimatedTime: "3-5 days"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "pending": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function ExplorePage() {
  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Explore Page
        </h1>
        <p className="text-lg text-muted-foreground">
          Coming soon - Discover Korean learning content and connect with teachers
        </p>
      </div>

      {/* Implementation Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Implementation Status
          </CardTitle>
          <CardDescription>
            Current status of explore page features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exploreFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(feature.status)}>
                      {feature.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {feature.estimatedTime}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            What would you like to do?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BookOpen className="h-6 w-6" />
              <span>Browse Content</span>
              <span className="text-xs opacity-70">Coming soon</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Find Teachers</span>
              <span className="text-xs opacity-70">Coming soon</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Brain className="h-6 w-6" />
              <span>Practice Skills</span>
              <span className="text-xs opacity-70">Coming soon</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageCircle className="h-6 w-6" />
              <span>Join Community</span>
              <span className="text-xs opacity-70">Coming soon</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

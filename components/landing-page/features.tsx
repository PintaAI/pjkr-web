"use client";
import React from 'react';
import { Card, CardContent, CardTitle } from "../ui/card";
import { BookOpen, Users, PlayCircle } from 'lucide-react';

const features = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "Comprehensive Content",
    description: "Access a wide range of learning materials from beginner to advanced levels."
  },
  {
    icon: <PlayCircle className="w-8 h-8 text-primary" />,
    title: "Interactive Learning",
    description: "Gamified lessons and interactive exercises that make learning fun."
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Live Sessions",
    description: "Join live sessions with certified instructors.",
    link: "/live-session"
  }
];

export const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            Effective and engaging learning methods for everyone
          </p>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-8 h-full flex flex-col">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  {feature.icon}
                </div>
              </div>
              <CardTitle className="mb-4 text-xl">{feature.title}</CardTitle>
              <CardContent className="p-0 flex-grow">
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

"use client";
import React from 'react';
import { Button } from "../ui/button";
import { GraduationCap } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-6 text-center max-w-4xl">
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-primary-foreground/20 rounded-3xl flex items-center justify-center">
            <GraduationCap className="w-20 h-20 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Welcome to Your Learning Platform
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Your comprehensive platform for learning and growing your skills.
        </p>
        <div className="flex justify-center">
          <Button size="lg" variant="secondary" className="px-8 py-4 text-base">
            Start Learning Now
          </Button>
        </div>
      </div>
    </section>
  );
};

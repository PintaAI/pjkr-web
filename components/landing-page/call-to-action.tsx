"use client";
import React from 'react';
import { Button } from "../ui/button";

export const CallToAction = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-6 text-center max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
          Join thousands of other learners and begin your learning journey today.
        </p>
        <div className="flex justify-center">
          <Button size="lg" className="px-10 py-4 text-base">
            Sign Up Free Now
          </Button>
        </div>
      </div>
    </section>
  );
};

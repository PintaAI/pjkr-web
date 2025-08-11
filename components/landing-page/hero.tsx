"use client";
import React from 'react';
import { Button } from "../ui/button";
import Image from 'next/image';

export const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-6 text-center max-w-4xl">
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-primary-foreground/20 rounded-3xl flex items-center justify-center">
            <Image
              priority={true}
              src="/logo/hakgyo-light.png"
              alt="Hakgyo Logo"
              width={80}
              height={80}
              className="dark:hidden"
            />
            <Image
              priority={true}
              src="/logo/hakgyo-dark.png"
              alt="Hakgyo Logo"
              width={80}
              height={80}
              className="hidden dark:block"
            />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Welcome to Hakgyo
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

"use client";
import React from 'react';
import { Header, Hero, Features, CallToAction, Footer } from './';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      <CallToAction />
      <Footer />
    </div>
  );
}

"use client";
import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-6 text-center text-muted-foreground max-w-6xl">
        <p className="text-sm">&copy; {new Date().getFullYear()} Your App Name. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

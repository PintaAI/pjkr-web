"use client";
import React from 'react';
import { Button } from "../ui/button";
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle';
import { AuthButton } from '../auth/auth-button';
import Image from 'next/image';

const navigation = [
  { name: 'About', href: '#about' },
  { name: 'Features', href: '#features' },
  { name: 'Live Sessions', href: '/live-session' },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/logo/hakgyo-light.png"
                  alt="Hakgyo Logo"
                  width={40}
                  height={40}
                  className="dark:hidden p-1"
                />
                <Image
                  src="/logo/hakgyo-dark.png"
                  alt="Hakgyo Logo"
                  width={40}
                  height={40}
                  className="hidden dark:block p-1"
                />
              </div>
              <span className="font-bold text-xl hidden sm:block text-foreground text-shadow-sm">Hakgyo</span>
            </Link>
          </div>

          {/* Centered Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton variant="outline" size="sm" className="shadow-sm hidden sm:inline-flex" />
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

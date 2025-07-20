import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utility functions
export function daysAgo(days: number): Date {
  return new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
}

export function hoursAgo(hours: number): Date {
  return new Date(Date.now() - (hours * 60 * 60 * 1000))
}

export function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - (minutes * 60 * 1000))
}

export function weeksAgo(weeks: number): Date {
  return new Date(Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000))
}

export function isWithinDays(date: Date, days: number): boolean {
  return new Date(date).getTime() > daysAgo(days).getTime()
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

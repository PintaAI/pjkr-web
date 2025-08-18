
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nanoid } from 'nanoid';
// UI
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ID Generation
export const generateTempId = (prefix: string) => `${prefix}_${nanoid(8)}`;
export const generateTempIdWithIndex = (prefix: string, index: number) =>
  `${prefix}_${nanoid(8)}_${index}`;

// Array Manipulation
export function reorderArray<T extends { order?: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

// Validation
export const validateText = (text: string | null | undefined): boolean => {
  return !!text && text.trim().length > 0;
};



export const reindexOrder = <T extends { order?: number }>(items: T[]): T[] => {
  return items.map((item, index) => ({
    ...item,
    order: index,
  }));
};
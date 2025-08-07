import { KelasType, Difficulty, VocabularyType, PartOfSpeech } from '@prisma/client';

// Types for the store
export interface KelasMetaData {
  title: string;
  description?: string;
  jsonDescription?: any;
  htmlDescription?: string;
  type: KelasType;
  level: Difficulty;
  thumbnail?: string;
  icon?: string;
  isPaidClass: boolean;
  price?: number;
  discount?: number;
  promoCode?: string;
}

export interface MateriData {
  id?: number;
  title: string;
  description: string;
  jsonDescription: any;
  htmlDescription: string;
  order: number;
  isDemo: boolean;
  isDraft: boolean;
  tempId?: string; // For optimistic updates
}

export interface VocabularyItemData {
  id?: number;
  korean: string;
  indonesian: string;
  type: VocabularyType;
  pos?: PartOfSpeech;
  audioUrl?: string;
  exampleSentences: string[];
  order: number;
  tempId?: string; // For optimistic updates
}

export interface VocabularySetData {
  id?: number;
  title: string;
  description?: string;
  icon: string;
  isPublic: boolean;
  items: VocabularyItemData[];
  tempId?: string; // For optimistic updates
}

export interface SoalOpsiData {
  id?: number;
  opsiText: string;
  isCorrect: boolean;
  order: number;
  tempId?: string;
}

export interface SoalData {
  id?: number;
  pertanyaan: string;
  difficulty?: Difficulty;
  explanation?: string;
  isActive: boolean;
  order?: number;
  opsis: SoalOpsiData[];
  tempId?: string;
}

export interface KoleksiSoalData {
  id?: number;
  nama: string;
  deskripsi?: string;
  isPrivate: boolean;
  isDraft: boolean;
  soals: SoalData[];
  tempId?: string;
}

export interface SoalSetData {
  id?: number;
  koleksiSoalId: number;
  title: string;
  description?: string;
  tempId?: string; // For optimistic updates
}

export type BuilderStep = 'meta' | 'content' | 'vocabulary' | 'assessment' | 'review';
import { User } from './auth';

// Kelas (Class/Course) Types
export interface Kelas {
  id: number;
  title: string;
  description?: string;
  jsonDescription?: any;
  htmlDescription?: string;
  type: 'REGULAR' | 'EVENT' | 'GROUP' | 'PRIVATE' | 'FUN';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  thumbnail?: string;
  icon?: string;
  isPaidClass: boolean;
  price?: string;
  discount?: string;
  promoCode?: string;
  isDraft: boolean;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

// Materi (Material) Types
export interface Materi {
  id: number;
  title: string;
  description: string;
  jsonDescription: any;
  htmlDescription: string;
  order: number;
  isDemo: boolean;
  isDraft: boolean;
  koleksiSoalId?: number;
  passingScore?: number;
  kelasId: number;
  kelas?: Kelas;
  createdAt: string;
  updatedAt: string;
}

// Vocabulary Types
export interface VocabularySet {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  isPublic: boolean;
  isDraft: boolean;
  userId?: string;
  kelasId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyItem {
  id: number;
  korean: string;
  indonesian: string;
  isLearned: boolean;
  type: 'WORD' | 'SENTENCE' | 'IDIOM';
  pos?: 'KATA_KERJA' | 'KATA_BENDA' | 'KATA_SIFAT' | 'KATA_KETERANGAN';
  audioUrl?: string;
  exampleSentences: string[];
  order: number;
  creatorId: string;
  collectionId?: number;
  createdAt: string;
  updatedAt: string;
}

// Soal (Question) Types
export interface Soal {
  id: number;
  koleksiSoalId: number;
  authorId: string;
  pertanyaan: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  explanation?: string;
  isActive: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
  opsis: Opsi[];
  attachments: SoalAttachment[];
}

export interface Opsi {
  id: number;
  soalId: number;
  opsiText: string;
  isCorrect: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  attachments: OpsiAttachment[];
}

export interface SoalAttachment {
  id: number;
  soalId: number;
  url: string;
  type: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface OpsiAttachment {
  id: number;
  opsiId: number;
  url: string;
  type: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface KoleksiSoal {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeSession {
  id: string;
  koleksiSoalId: number;
  userId: string;
  createdAt: string;
}

export interface PracticeResult {
  id: number;
  score: number;
  correctCount: number;
  totalCount: number;
}

// Tryout Types
export interface Tryout {
  id: number;
  nama: string;
  startTime: string;
  endTime: string;
  duration: number;
  koleksiSoalId: number;
  isActive: boolean;
  guruId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TryoutResult {
    id: number;
    score: number;
    correctCount: number;
    totalCount: number;
    details?: any;
}

export interface TryoutParticipant {
  id: number;
  tryoutId: number;
  userId: string;
  startTime: string;
  endTime?: string;
}

// Post Types
export interface Post {
  id: number;
  title: string;
  description?: string;
  jsonDescription?: any;
  htmlDescription: string;
  type: 'DISCUSSION' | 'ANNOUNCEMENT' | 'QUESTION' | 'SHARE' | 'TUTORIAL';
  isPublished: boolean;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author?: User;
  kelasId?: number;
}

export interface Comment {
    id: number;
    content: string;
    // Add other fields as necessary
}

// Live Session Types
export interface LiveSession {
  id: string;
  name: string;
  description?: string;
  streamCallId?: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  scheduledStart: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  kelasId: number;
}

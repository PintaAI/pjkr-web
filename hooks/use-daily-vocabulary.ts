import { useState, useEffect } from 'react';

// Use the actual Prisma types
type VocabularyType = 'WORD' | 'SENTENCE' | 'IDIOM';
type PartOfSpeech = 'KATA_KERJA' | 'KATA_BENDA' | 'KATA_SIFAT' | 'KATA_KETERANGAN';

interface VocabularyItem {
  id: number;
  korean: string;
  indonesian: string;
  type: VocabularyType;
  pos: PartOfSpeech | null;
  exampleSentences: string[];
  audioUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  role?: string;
}

interface UseDailyVocabularyReturn {
  vocabulary: VocabularyItem[];
  loading: boolean;
  error: string | null;
}

export function useDailyVocabulary(user: User | null, take: number = 5): UseDailyVocabularyReturn {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyVocabulary = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch vocabulary from API route
        const response = await fetch(`/api/vocabulary/daily?userId=${user.id}&take=${take}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch vocabulary');
        }

        const data = await response.json();
        const vocabularyItems = Array.isArray(data) ? data : [data];
        setVocabulary(vocabularyItems);
      } catch (err) {
        console.error('Error fetching daily vocabulary:', err);
        setError('Failed to load vocabulary');
        
        // Fallback to mock data
        const mockVocabularies = getMockVocabularies(take);
        setVocabulary(mockVocabularies);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyVocabulary();
  }, [user]);

  return { vocabulary, loading, error };
}

// Mock data for fallback
function getMockVocabularies(count: number): VocabularyItem[] {
  const mockVocabularies = [
    {
      id: 1,
      korean: "안녕하세요",
      indonesian: "Halo (formal)",
      type: "WORD" as VocabularyType,
      pos: "KATA_BENDA" as PartOfSpeech,
      exampleSentences: ["안녕하세요, 만나서 반갑습니다.", "선생님 안녕하세요!"],
      audioUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      korean: "감사합니다",
      indonesian: "Terima kasih",
      type: "WORD" as VocabularyType,
      pos: "KATA_BENDA" as PartOfSpeech,
      exampleSentences: ["정말 감사합니다.", "도움을 주셔서 감사합니다."],
      audioUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      korean: "좋은 아침입니다",
      indonesian: "Selamat pagi",
      type: "SENTENCE" as VocabularyType,
      pos: null,
      exampleSentences: ["좋은 아침입니다, 선생님!", "오늘 아침은 날씨가 좋네요."],
      audioUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      korean: "배고파요",
      indonesian: "Lapar",
      type: "WORD" as VocabularyType,
      pos: "KATA_SIFAT" as PartOfSpeech,
      exampleSentences: ["배고파요, 밥 먹을 시간이에요.", "점심이 너무 늦어서 배고파요."],
      audioUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 5,
      korean: "어제는 비가 왔어요",
      indonesian: "Hari kemarin hujan",
      type: "SENTENCE" as VocabularyType,
      pos: null,
      exampleSentences: ["어제는 비가 와서 외출하기 어려웠어요.", "날씨가 너무 덥지 않아서 좋았어요."],
      audioUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Return requested number of random items
  const shuffled = [...mockVocabularies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
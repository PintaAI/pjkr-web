import { useState, useEffect } from 'react';

// Use the actual Prisma types
type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface Opsi {
  id: number;
  opsiText: string;
  isCorrect: boolean;
  order: number;
}

interface SoalItem {
  id: number;
  pertanyaan: string;
  difficulty: Difficulty | null;
  explanation: string | null;
  opsis: Opsi[];
  koleksiSoal: {
    nama: string;
    deskripsi: string | null;
  };
}

interface User {
  id: string;
  role?: string;
}

interface UseDailySoalReturn {
  soal: SoalItem[];
  loading: boolean;
  error: string | null;
}

export function useDailySoal(user: User | null, take: number = 5): UseDailySoalReturn {
  const [soal, setSoal] = useState<SoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailySoal = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch soal from API route
        const response = await fetch(`/api/soal/daily?userId=${user.id}&take=${take}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch soal');
        }

        const data = await response.json();
        const soalItems = Array.isArray(data) ? data : [data];
        setSoal(soalItems);
      } catch (err) {
        console.error('Error fetching daily soal:', err);
        setError('Failed to load soal');
        
        // Fallback to mock data
        const mockSoals = getMockSoals(take);
        setSoal(mockSoals);
      } finally {
        setLoading(false);
      }
    };

    fetchDailySoal();
  }, [user]);

  return { soal, loading, error };
}

// Mock data for fallback
function getMockSoals(count: number): SoalItem[] {
  const mockSoals: SoalItem[] = [
    {
      id: 1,
      pertanyaan: "Apa bahasa Korea untuk 'Halo'?",
      difficulty: "BEGINNER",
      explanation: "안녕하세요 (annyeonghaseyo) adalah cara formal untuk mengatakan halo.",
      opsis: [
        { id: 1, opsiText: "안녕하세요", isCorrect: true, order: 0 },
        { id: 2, opsiText: "감사합니다", isCorrect: false, order: 1 },
        { id: 3, opsiText: "죄송합니다", isCorrect: false, order: 2 },
        { id: 4, opsiText: "안녕히 가세요", isCorrect: false, order: 3 }
      ],
      koleksiSoal: {
        nama: "Basic Greetings",
        deskripsi: "Dasar sapaan dalam bahasa Korea"
      }
    },
    {
      id: 2,
      pertanyaan: "Apa arti dari '감사합니다'?",
      difficulty: "BEGINNER",
      explanation: "감사합니다 (gamsahamnida) berarti terima kasih secara formal.",
      opsis: [
        { id: 1, opsiText: "Terima kasih", isCorrect: true, order: 0 },
        { id: 2, opsiText: "Maaf", isCorrect: false, order: 1 },
        { id: 3, opsiText: "Sampai jumpa", isCorrect: false, order: 2 },
        { id: 4, opsiText: "Halo", isCorrect: false, order: 3 }
      ],
      koleksiSoal: {
        nama: "Basic Greetings",
        deskripsi: "Dasar sapaan dalam bahasa Korea"
      }
    },
    {
      id: 3,
      pertanyaan: "Bagaimana mengatakan 'Saya lapar' dalam bahasa Korea?",
      difficulty: "BEGINNER",
      explanation: "배고파요 (baegopayo) berarti saya lapar.",
      opsis: [
        { id: 1, opsiText: "배고파요", isCorrect: true, order: 0 },
        { id: 2, opsiText: "배부르다", isCorrect: false, order: 1 },
        { id: 3, opsiText: "목말라요", isCorrect: false, order: 2 },
        { id: 4, opsiText: "피곤해요", isCorrect: false, order: 3 }
      ],
      koleksiSoal: {
        nama: "Daily Expressions",
        deskripsi: "Ekspresi sehari-hari dalam bahasa Korea"
      }
    },
    {
      id: 4,
      pertanyaan: "Apa bahasa Korea untuk 'selamat pagi'?",
      difficulty: "BEGINNER",
      explanation: "좋은 아침입니다 (joeun achimimnida) berarti selamat pagi secara formal.",
      opsis: [
        { id: 1, opsiText: "좋은 아침입니다", isCorrect: true, order: 0 },
        { id: 2, opsiText: "안녕히 주무셨어요", isCorrect: false, order: 1 },
        { id: 3, opsiText: "안녕히 가세요", isCorrect: false, order: 2 },
        { id: 4, opsiText: "잘 자요", isCorrect: false, order: 3 }
      ],
      koleksiSoal: {
        nama: "Daily Greetings",
        deskripsi: "Sapaan berdasarkan waktu"
      }
    },
    {
      id: 5,
      pertanyaan: "Apa arti dari '죄송합니다'?",
      difficulty: "BEGINNER",
      explanation: "죄송합니다 (joesonghamnida) berarti maaf secara formal.",
      opsis: [
        { id: 1, opsiText: "Maaf", isCorrect: true, order: 0 },
        { id: 2, opsiText: "Terima kasih", isCorrect: false, order: 1 },
        { id: 3, opsiText: "Sampai jumpa", isCorrect: false, order: 2 },
        { id: 4, opsiText: "Halo", isCorrect: false, order: 3 }
      ],
      koleksiSoal: {
        nama: "Basic Expressions",
        deskripsi: "Ekspresi dasar dalam bahasa Korea"
      }
    }
  ];

  return mockSoals.slice(0, count);
}

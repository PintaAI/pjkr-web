import ExplorePage from "@/components/explore/explore-page";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

// Force dynamic rendering since we use server session
export const dynamic = 'force-dynamic';

// Helper function to get random items from an array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default async function Explore() {
   const session = await getServerSession();

   // If user is not authenticated, redirect to landing page
   if (!session?.user) {
     redirect('/');
   }

   try {
     // Fetch random Kelas (classes) - only published ones
     const kelasData = await prisma.kelas.findMany({
       where: {
         isDraft: false,
       },
       include: {
         author: {
           select: {
             id: true,
             name: true,
             image: true,
           },
         },
         _count: {
           select: {
             materis: true,
             members: true,
           },
         },
       },
     });

     // Fetch random VocabularyItems
     const vocabData = await prisma.vocabularyItem.findMany({
       include: {
         creator: {
           select: {
             id: true,
             name: true,
             image: true,
           },
         },
         collection: {
           select: {
             id: true,
             title: true,
           },
         },
       },
     });

     // Fetch random Users
     const userData = await prisma.user.findMany({
       select: {
         id: true,
         name: true,
         email: true,
         image: true,
         role: true,
         level: true,
         xp: true,
         currentStreak: true,
         joinedKelas: {
           select: {
             id: true,
           },
         },
         soals: {
           select: {
             id: true,
           },
         },
         vocabularyItems: {
           select: {
             id: true,
           },
         },
         activityLogs: {
           select: {
             id: true,
           },
         },
       },
     });

     // Fetch random Soals - only active ones
     const soalData = await prisma.soal.findMany({
       where: {
         isActive: true,
       },
       include: {
         author: {
           select: {
             id: true,
             name: true,
             image: true,
           },
         },
         opsis: {
           select: {
             id: true,
             opsiText: true,
             isCorrect: true,
           },
         },
         koleksiSoal: {
           select: {
             nama: true,
           },
         },
       },
     });

     // Get random samples from each category
     const randomKelas = getRandomItems(kelasData, 4);
     const randomVocab = getRandomItems(vocabData, 10);
     const randomUsers = getRandomItems(userData, 7);
     const randomSoals = getRandomItems(soalData, 6);

     // Transform data to match frontend expectations
     const transformedKelas = randomKelas.map(kelas => ({
       id: kelas.id,
       title: kelas.title,
       description: kelas.description || '',
       type: kelas.type,
       level: kelas.level,
       thumbnail: kelas.thumbnail,
       isPaidClass: kelas.isPaidClass,
       price: kelas.price?.toNumber() || null,
       author: {
         id: kelas.author.id,
         name: kelas.author.name || '',
         image: kelas.author.image,
       },
       _count: kelas._count,
     }));

     const transformedVocab = randomVocab.map(vocab => ({
       id: vocab.id,
       korean: vocab.korean,
       indonesian: vocab.indonesian,
       type: vocab.type,
       pos: vocab.pos,
       exampleSentences: vocab.exampleSentences,
       audioUrl: vocab.audioUrl,
       author: {
         id: vocab.creator.id,
         name: vocab.creator.name || '',
         image: vocab.creator.image || ''
       },
       collection: vocab.collection,
       difficulty: 'BEGINNER' as const,
       rating: 4.5,
       totalLearners: Math.floor(Math.random() * 1000) + 100,
     }));

     const transformedUsers = randomUsers.map(user => ({
       id: user.id,
       name: user.name || '',
       email: user.email,
       image: user.image || '',
       role: user.role,
       level: user.level,
       xp: user.xp,
       currentStreak: user.currentStreak,
       joinedKelasCount: user.joinedKelas.length,
       soalsCount: user.soals.length,
       vocabularyItemsCount: user.vocabularyItems.length,
       totalActivities: user.activityLogs.length,
       bio: `Experienced ${user.role.toLowerCase()} in Korean learning.`,
     }));

     const transformedSoals = randomSoals.map(soal => ({
       id: soal.id,
       pertanyaan: soal.pertanyaan,
       difficulty: soal.difficulty || 'BEGINNER',
       explanation: soal.explanation || '',
       options: soal.opsis.map(o => o.opsiText),
       correctOptionIndex: soal.opsis.findIndex(o => o.isCorrect),
       author: {
         id: soal.author.id,
         name: soal.author.name || '',
         image: soal.author.image || ''
       },
       isActive: soal.isActive,
       collectionName: soal.koleksiSoal.nama,
     }));

     // Combine all content types
     const allContent = [
       ...transformedKelas.map(item => ({ type: 'kelas' as const, data: item, id: `kelas-${item.id}` })),
       ...transformedVocab.map(item => ({ type: 'vocab' as const, data: item, id: `vocab-${item.id}` })),
       ...transformedUsers.map(item => ({ type: 'user' as const, data: item, id: `user-${item.id}` })),
       ...transformedSoals.map(item => ({ type: 'soal' as const, data: item, id: `soal-${item.id}` })),
     ];

     // Shuffle the combined array
     const shuffledContent = [...allContent].sort(() => Math.random() - 0.5);

     return <ExplorePage initialData={shuffledContent} />;
   } catch (error) {
     console.error('Error fetching explore data:', error);
     return <ExplorePage initialData={[]} />;
   }
}

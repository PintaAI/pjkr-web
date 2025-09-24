"use client";

import { Video, MessageSquare, GraduationCap, Megaphone, FileText, BookOpen, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { KelasType, Difficulty } from "@prisma/client";
import { useSession } from "@/lib/hooks/use-session";
import { useKelasEnrollment } from "@/lib/hooks/use-kelas-enrollment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import DetailTab from "./tabs/detail-tab";
import LiveSessionTab from "./tabs/live-session-tab";
import DiscussionTab from "./tabs/discussion-tab";
import VocabularyTab from "./tabs/vocabulary-tab";
import SoalTab from "./tabs/soal-tab";
import { useState, useRef,} from "react";
import { useAnimation } from "framer-motion";
import React from "react";
import { useKelasColors } from "@/lib/hooks/use-kelas-colors";
import { ColorExtractor } from "react-color-extractor";

// Import modular components
import KelasHeader from "./components/kelas-header";
import KelasStats from "./components/kelas-stats";
import KelasAuthor from "./components/kelas-author";
import KelasPricingCard from "./components/kelas-pricing-card";
import KelasMaterialsList from "./components/kelas-materials-list";
import { MateriCard } from "./components/materi-card";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Materi {
  id: number;
  title: string;
  description: string;
  order: number;
  isDemo: boolean;
  createdAt: Date;
}

interface LiveSession {
  id: string;
  name: string;
  description: string | null;
  status: string;
  scheduledStart: Date;
  scheduledEnd: Date | null;
}

interface VocabSet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
  } | null;
  kelas: {
    id: number;
    title: string;
    level: string;
  } | null;
  items: Array<{
    id: number;
    korean: string;
    indonesian: string;
    type: string;
  }>;
}

interface SoalSet {
  id: number;
  nama: string;
  deskripsi: string | null;
  isPrivate: boolean;
  isDraft: boolean;
  createdAt: Date;
  soals: Array<{
    id: number;
    pertanyaan: string;
    difficulty: string | null;
  }>;
  user: {
    id: string;
    name: string | null;
  } | null;
  kelasKoleksiSoals: Array<{
    kelas: {
      id: number;
      title: string;
      level: string;
    };
  }>;
}

interface Post {
  id: number;
  title: string;
  type: string;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Kelas {
  id: number;
  title: string;
  description: string | null;
  jsonDescription?: any;
  htmlDescription?: string | null;
  type: KelasType;
  level: Difficulty;
  thumbnail: string | null;
  icon: string | null;
  isPaidClass: boolean;
  price: any;
  discount: any;
  promoCode: string | null;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: Author;
  materis: Materi[];
  liveSessions: LiveSession[];
  vocabularySets: VocabSet[];
  soalSets: SoalSet[];
  posts: Post[];
  _count: {
    members: number;
    materis: number;
    liveSessions: number;
    vocabularySets: number;
    posts: number;
    kelasKoleksiSoals: number;
  };
}

interface KelasDetailPageProps {
  kelas: Kelas;
}

export default function KelasDetailPage({ kelas }: KelasDetailPageProps) {
  const router = useRouter();
  const { user, isLoading } = useSession();
  
  // Initialize color extraction from thumbnail
  const { colors, isExtracting, handleColorExtraction } = useKelasColors(kelas.thumbnail);

  // Use the enrollment hook
  const enrollment = useKelasEnrollment(kelas.id);
  
  // Prevent hydration mismatch by using the existing isClient state
  const [isClient, setIsClient] = useState(false);

  // State for materials list visibility
  const [showMaterials, setShowMaterials] = useState(false);
  // Track if we already performed the automatic teaser for materials list
  const [hasTeasedMaterials, setHasTeasedMaterials] = useState(false);
  
  // Refs for timeout cleanup
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation controls for teaser
  const teaserControls = useAnimation();
  
  // Set isClient to true after component mounts on client side
  React.useEffect(() => {
    setIsClient(true);
    if (kelas.materis.length > 0) {
      // Run teaser once then leave header visible
      teaserControls.start({
        opacity: [0, 1],
        scale: [0.95, 1],
        transition: {
          duration: 0.6,
          ease: "easeOut"
        }
      });
    } else {
      // Ensure header shown even with no materi
      teaserControls.start({ opacity: 1, scale: 1 });
    }
  }, [teaserControls, kelas.materis.length]);
  
  // Automatic "tease" animation for materials dropdown: briefly open then close
  React.useEffect(() => {
    if (!hasTeasedMaterials && kelas.materis.length > 0 && isClient) {
      // Delay a bit so header animation finishes
      openTimeoutRef.current = setTimeout(() => {
        setShowMaterials(true);
        // Close after a short showcase
        closeTimeoutRef.current = setTimeout(() => {
          setShowMaterials(false);
          setHasTeasedMaterials(true);
        }, 1600);
      }, 800);
    }
    
    // Cleanup function to clear both timeouts
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [hasTeasedMaterials, kelas.materis.length, isClient]);
  
  // Check if current user is the author of this kelas


  const handleBack = () => {
    router.back();
  };

  const handleNavigateToLearn = () => {
    router.push(`/kelas/${kelas.id}/learn`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto -mt-6">
      {/* Hidden Color Extractor - extracts colors from thumbnail */}
      {kelas.thumbnail && (
        <div className="hidden">
          <ColorExtractor
            src={kelas.thumbnail}
            getColors={handleColorExtraction}
            maxColors={5}
            format="hex"
          />
        </div>
      )}

      {/* Header */}
      <KelasHeader
        kelas={{
          title: kelas.title,
          description: kelas.description,
          thumbnail: kelas.thumbnail,
          level: kelas.level,
          type: kelas.type,
          isDraft: kelas.isDraft,
        }}
        onBack={handleBack}
        teaserControls={teaserControls}
      />

      <div className="px-6 space-y-6">
        {/* Compact stats and pricing row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: Stats and Author */}
          <div className="flex-1 space-y-4">
            {/* Stats */}
            <KelasStats
              stats={{
                members: kelas._count.members,
                materis: kelas._count.materis,
                kelasKoleksiSoals: kelas._count.kelasKoleksiSoals,
                vocabularySets: kelas._count.vocabularySets,
              }}
            />

            {/* Author */}
            <KelasAuthor author={kelas.author} />
          </div>

          {/* Right column: Pricing */}
          <div className="relative">
            <KelasPricingCard
              kelas={{
                id: kelas.id,
                title: kelas.title,
                isPaidClass: kelas.isPaidClass,
                price: kelas.price,
                discount: kelas.discount,
                promoCode: kelas.promoCode,
              }}
              enrollment={enrollment}
              user={user}
              isClient={isClient}
              isLoading={isLoading}
              onNavigateToLearn={handleNavigateToLearn}
            />

            {/* Materials Section */}
            <KelasMaterialsList
              materis={kelas.materis}
              showMaterials={showMaterials}
              setShowMaterials={setShowMaterials}
              hasTeasedMaterials={hasTeasedMaterials}
              kelasId={kelas.id}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="pt-6">
          <Tabs defaultValue="information" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger
                value="information"
                className="flex items-center gap-2 text-primary"
              >
                <FileText className="w-4 h-4 text-primary" />
                Information
              </TabsTrigger>
              <TabsTrigger
                value="materi"
                className="flex items-center gap-2 text-primary"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Materi & Live Class
              </TabsTrigger>
              <TabsTrigger
                value="discussion"
                className="flex items-center gap-2 text-primary"
              >
                <MessageSquare className="w-4 h-4 text-primary" />
                Discussion
              </TabsTrigger>
              <TabsTrigger
                value="vocabulary"
                className="flex items-center gap-2 text-primary"
              >
                <GraduationCap className="w-4 h-4 text-primary" />
                Vocabulary
              </TabsTrigger>
              <TabsTrigger
                value="questions"
                className="flex items-center gap-2 text-primary"
              >
                <Brain className="w-4 h-4 text-primary" />
                Questions
              </TabsTrigger>
            </TabsList>

            {/* Information Tab */}
            <TabsContent value="information" className="mt-6">
              <DetailTab
                htmlDescription={kelas.htmlDescription}
                jsonDescription={kelas.jsonDescription}
              />
            </TabsContent>

            {/* Materi Tab */}
            <TabsContent value="materi" className="mt-6">
              {/* Materi Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Materi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kelas.materis.map((materi) => (
                    <MateriCard
                      key={materi.id}
                      materi={materi}
                      onClick={() => router.push(`/kelas/${kelas.id}/materi/${materi.id}`)}
                    />
                  ))}
                </div>
              </div>

              {/* Live Sessions Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Live Sessions</h3>
                <LiveSessionTab liveSessions={kelas.liveSessions} />
              </div>
            </TabsContent>


            {/* Discussion Tab */}
            <TabsContent value="discussion" className="mt-6">
              <DiscussionTab
                kelasId={kelas.id}
                kelasTitle={kelas.title}
                initialPosts={kelas.posts.map(post => ({
                  ...post,
                  htmlDescription: post.title, // Fallback since we don't have htmlDescription in the basic Post interface
                  shareCount: 0,
                  viewCount: 0,
                  _count: {
                    comments: post.commentCount,
                    likes: post.likeCount,
                  },
                }))}
                initialPostsCount={kelas._count.posts}
              />
            </TabsContent>

            {/* Vocabulary Tab */}
            <TabsContent value="vocabulary" className="mt-6">
              <VocabularyTab vocabularySets={kelas.vocabularySets} kelasId={kelas.id} />
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="mt-6">
              <SoalTab soalSets={kelas.soalSets} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Running Text Ads Placeholder */}
        <div className="mt-8 mb-6">
          <Card className="border-dashed border-2 bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 text-primary">
                <Megaphone className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <h3 className="font-medium text-lg mb-1">Advertisement Space</h3>
                  <p className="text-sm text-secondary">
                    Running text ads will be displayed here
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-primary"></div>
                  <div className="w-2 h-2 rounded-full animate-pulse bg-secondary" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full animate-pulse bg-primary" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

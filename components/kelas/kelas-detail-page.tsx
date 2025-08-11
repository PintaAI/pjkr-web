"use client";

import { Video, MessageSquare, GraduationCap, Megaphone, FileText } from "lucide-react";
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
import { useState, useRef,} from "react";
import { useAnimation } from "framer-motion";
import React from "react";

// Import modular components
import KelasHeader from "./components/kelas-header";
import KelasStats from "./components/kelas-stats";
import KelasAuthor from "./components/kelas-author";
import KelasPricingCard from "./components/kelas-pricing-card";
import KelasMaterialsList from "./components/kelas-materials-list";

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

interface VocabularySet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  _count: {
    items: number;
  };
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
  vocabularySets: VocabularySet[];
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
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="pt-6">
          <Tabs defaultValue="detail" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="detail" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detail
              </TabsTrigger>
              <TabsTrigger value="live-session" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Live Session
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussion
              </TabsTrigger>
              <TabsTrigger value="vocabulary" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Vocabulary
              </TabsTrigger>
            </TabsList>

            {/* Detail Tab */}
            <TabsContent value="detail" className="mt-6">
              <DetailTab
                htmlDescription={kelas.htmlDescription}
                jsonDescription={kelas.jsonDescription}
              />
            </TabsContent>

            {/* Live Session Tab */}
            <TabsContent value="live-session" className="mt-6">
              <LiveSessionTab liveSessions={kelas.liveSessions} />
            </TabsContent>

            {/* Discussion Tab */}
            <TabsContent value="discussion" className="mt-6">
              <DiscussionTab
                kelasId={kelas.id}
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
              <VocabularyTab vocabularySets={kelas.vocabularySets} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Running Text Ads Placeholder */}
        <div className="mt-8 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-dashed border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400">
                <Megaphone className="w-6 h-6" />
                <div className="text-center">
                  <h3 className="font-medium text-lg mb-1">Advertisement Space</h3>
                  <p className="text-sm text-blue-500 dark:text-blue-300">
                    Running text ads will be displayed here
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-400 dark:text-blue-500">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  FileText,
  PlusCircle,
  Calendar
} from "lucide-react";
import Link from "next/link";

import { Difficulty } from "@prisma/client";
import { SearchComponent } from "@/components/ui/search";
import { ManageClasses } from "@/components/dashboard/manage-classes";
import { ManageVocab } from "@/components/dashboard/manage-vocab";
import { ManageSoals } from "@/components/dashboard/manage-soals";
import { getGuruVocabularySets } from "@/app/actions/kelas/vocabulary";
import { getGuruSoalSets } from "@/app/actions/kelas/soal-set";
import { useEffect, useState } from "react";

const teachingTools = [
  {
    href: "/dashboard/guru/kelas-builder",
    icon: <PlusCircle className="h-6 w-6 text-emerald-500" />,
    badge: { text: "Available", variant: "default", className: "bg-emerald-100 text-emerald-800" },
    title: "Kelas Builder",
    description: "Create comprehensive Korean language classes with guided steps",
    footerLeft: "Build Classes",
    footerRight: "Step-by-step",
  },
  {
    href: "/dashboard/guru/teach/white-board",
    icon: <BookOpen className="h-6 w-6 text-blue-600" />,
    badge: { text: "New", variant: "outline", className: "" },
    title: "Whiteboard",
    description: "Open a collaborative whiteboard (Excalidraw)",
    footerLeft: "Interactive Tool",
    footerRight: "Excalidraw",
  },
  {
    href: "/dashboard/guru/teach/live-session",
    icon: <Calendar className="h-6 w-6 text-purple-600" />,
    badge: { text: "Coming Soon", variant: "outline", className: "" },
    title: "Live Session",
    description: "Start or join a real-time class session",
    footerLeft: "Realtime",
    footerRight: "Soon",
  },
  {
    href: "/dashboard/guru/vocabulary/create",
    icon: <PlusCircle className="h-6 w-6 text-teal-600" />,
    badge: { text: "Available", variant: "default", className: "bg-teal-100 text-teal-800" },
    title: "Create Vocabulary Set",
    description: "Build and manage custom vocabulary sets for your classes",
    footerLeft: "Vocabulary",
    footerRight: "Set Builder",
  },
  {
    href: "/dashboard/guru/soal/create",
    icon: <PlusCircle className="h-6 w-6 text-rose-600" />,
    badge: { text: "New", variant: "outline", className: "" },
    title: "Create Soal Set",
    description: "Create question sets for latihan or tryout assessments",
    footerLeft: "Assessment",
    footerRight: "Soal Builder",
  },
];

type UserRoles = "GURU" | "MURID" | "ADMIN";

interface DashboardUser {
  id: string;
  email: string;
  name?: string;
  role: UserRoles;
}

interface GuruStats {
  totalClasses: number;
  publishedClasses: number;
  draftClasses: number;
  totalStudents: number;
  totalMateris: number;
}

interface RecentClass {
  id: number;
  title: string;
  level: Difficulty;
  students: number;
  materis: number;
  thumbnail: string | null;
  createdAt: Date;
}

interface VocabSet {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  isPublic: boolean;
  createdAt: Date;
  items: Array<{
    id: number;
    korean: string;
    indonesian: string;
    type: string;
  }>;
  kelas: {
    id: number;
    title: string;
    level: string;
  } | null;
  user: {
    id: string;
    name: string | null;
  } | null;
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

interface GuruDashboardProps {
  stats: GuruStats;
  recentClasses: RecentClass[];
  classes: any[];
  user: DashboardUser;
}




export function GuruDashboard({ stats, user, classes }: GuruDashboardProps) {
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([]);
  const [soalSets, setSoalSets] = useState<SoalSet[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vocabResult = await getGuruVocabularySets();
        if (vocabResult.success && vocabResult.data) {
          setVocabSets(vocabResult.data);
        }
        const soalResult = await getGuruSoalSets();
        if (soalResult.success && soalResult.data) {
          setSoalSets(soalResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name || user.email}! Di sini tempat untuk mengelola kelas jadwal live, materi, dan kosa kata
          </p>
        </div>
        <div className="flex gap-2 w-90">
          <SearchComponent />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses}
          description={`${stats.publishedClasses} published, ${stats.draftClasses} drafts`}
          icon={<BookOpen className="h-4 w-4" />}
        />

        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          description="Across all classes"
          icon={<Users className="h-4 w-4" />}
        />

        <StatsCard
          title="Published Classes"
          value={stats.publishedClasses}
          description="Live for students"
          icon={<FileText className="h-4 w-4" />}
        />

        <StatsCard
          title="Total Materials"
          value={stats.totalMateris}
          description="Learning materials"
          icon={<BookOpen className="h-4 w-4" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="classes">Manage Classes</TabsTrigger>
          <TabsTrigger value="vocabulary">Manage Vocabulary</TabsTrigger>
          <TabsTrigger value="soals">Manage Soals</TabsTrigger>
        </TabsList>

        <TabsContent value="tools">
          {/* Teaching Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Alat untuk Mengajar</CardTitle>
              <CardDescription>
                Manage your classes and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teachingTools.map((tool,) => (
                  <Link href={tool.href} key={tool.title}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          {tool.icon}
                          {tool.badge && (
                            <Badge
                              variant={tool.badge.variant as "default" | "secondary" | "outline" | "destructive" | undefined}
                              className={`text-xs ${tool.badge.className}`}
                            >
                              {tool.badge.text}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{tool.title}</CardTitle>
                        <CardDescription>
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{tool.footerLeft}</span>
                          <span className="font-medium">
                            {tool.footerRight === "stats.totalClasses"
                              ? stats.totalClasses
                              : tool.footerRight}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <ManageClasses classes={classes} embedded={true} />
        </TabsContent>

        <TabsContent value="vocabulary">
          <ManageVocab embedded={true} vocabSets={vocabSets} />
        </TabsContent>

        <TabsContent value="soals">
          <ManageSoals embedded={true} soalSets={soalSets} />
        </TabsContent>
      </Tabs>

    </div>
  );
}

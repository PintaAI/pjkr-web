"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  FileText,
  PlusCircle,
  Calendar,
  Wrench,
  FileQuestion,
  BarChart3
} from "lucide-react";
import Link from "next/link";

import { Difficulty } from "@prisma/client";
import { SearchComponent } from "@/components/ui/search";
import { ManageClasses } from "@/components/dashboard/manage-classes";
import { ManageVocab } from "@/components/dashboard/manage-vocab";
import { ManageSoals } from "@/components/dashboard/manage-soals";
import { GuruDashboardStatistics } from "@/components/dashboard/guru-dashboard-statistics";
import { VocabSheet, VocabSet } from "@/components/dashboard/vocab-sheet";
import { SoalSheet, SoalSet } from "@/components/dashboard/soal-sheet";
import { getGuruVocabularySets } from "@/app/actions/kelas/vocabulary";
import { getGuruSoalSets } from "@/app/actions/kelas/soal-set";
import { useEffect, useState } from "react";

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



interface GuruDashboardProps {
  stats: GuruStats;
  recentClasses: RecentClass[];
  classes: any[];
  user: DashboardUser;
}




export function GuruDashboard({ stats, user, classes }: GuruDashboardProps) {
  const [vocabSets, setVocabSets] = useState<VocabSet[]>([]);
  const [soalSets, setSoalSets] = useState<SoalSet[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [soalSheetOpen, setSoalSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      const validTabs = ['tools', 'classes', 'vocabulary', 'soals', 'statistics'];
      return validTabs.includes(hash) ? hash : 'tools';
    }
    return 'tools';
  });

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleVocabSuccess = () => {
    setSheetOpen(false);
    fetchData();
  };

  const handleSoalSuccess = () => {
    setSoalSheetOpen(false);
    fetchData();
  };

  const teachingTools = [
    {
      href: "/dashboard/guru/kelas-builder",
      isLink: true,
      icon: <PlusCircle className="h-6 w-6 text-emerald-500" />,
      badge: { text: "Available", variant: "default", className: "bg-emerald-100 text-emerald-800" },
      title: "Kelas Builder",
      description: "Create comprehensive Korean language classes with guided steps",
      footerLeft: "Build Classes",
      footerRight: "Step-by-step",
    },
    {
      href: "/dashboard/guru/teach/white-board",
      isLink: true,
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      badge: { text: "New", variant: "outline", className: "" },
      title: "Whiteboard",
      description: "Open a collaborative whiteboard (Excalidraw)",
      footerLeft: "Interactive Tool",
      footerRight: "Excalidraw",
    },
    {
      href: "/dashboard/guru/teach/live-session",
      isLink: true,
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      badge: { text: "Coming Soon", variant: "outline", className: "" },
      title: "Live Session",
      description: "Start or join a real-time class session",
      footerLeft: "Realtime",
      footerRight: "Soon",
    },
    {
      onClick: () => setSheetOpen(true),
      isLink: false,
      icon: <PlusCircle className="h-6 w-6 text-teal-600" />,
      badge: { text: "Available", variant: "default", className: "bg-teal-100 text-teal-800" },
      title: "Create Vocabulary Set",
      description: "Build and manage custom vocabulary sets for your classes",
      footerLeft: "Vocabulary",
      footerRight: "Set Builder",
    },
    {
      onClick: () => setSoalSheetOpen(true),
      isLink: false,
      icon: <PlusCircle className="h-6 w-6 text-rose-600" />,
      badge: { text: "Available", variant: "default", className: "bg-teal-100 text-teal-800" },
      title: "Create Soal Set",
      description: "Create question sets for latihan or tryout assessments",
      footerLeft: "Assessment",
      footerRight: "Soal Builder",
    },
  ];

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
      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); window.location.hash = value; }} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="tools" className="flex-1">
            <Wrench className="w-4 h-4 mr-2" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex-1">
            <BookOpen className="w-4 h-4 mr-2" />
            Manage Classes
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Manage Vocabulary
          </TabsTrigger>
          <TabsTrigger value="soals" className="flex-1">
            <FileQuestion className="w-4 h-4 mr-2" />
            Manage Soals
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools">
          {/* Teaching Tools */}
          <Card className="bg-gradient-to-br from-card to-muted/20 mt-4">
            <CardHeader>
              <CardTitle className="text-xl">Alat untuk Mengajar</CardTitle>
              <CardDescription>
                Manage your classes and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teachingTools.map((tool) => (
                  tool.isLink ? (
                    <Link href={tool.href!} key={tool.title}>
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
                  ) : (
                    <Card onClick={tool.onClick} key={tool.title} className="cursor-pointer hover:shadow-md transition-shadow h-full">
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
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <ManageClasses classes={classes} />
        </TabsContent>

        <TabsContent value="vocabulary">
          <ManageVocab vocabSets={vocabSets} />
        </TabsContent>

        <TabsContent value="soals">
          <ManageSoals soalSets={soalSets} />
        </TabsContent>

        <TabsContent value="statistics">
          <GuruDashboardStatistics />
        </TabsContent>
      </Tabs>

      <VocabSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        vocabSet={null}
        onSuccess={handleVocabSuccess}
        onCancel={() => setSheetOpen(false)}
      />

      <SoalSheet
        isOpen={soalSheetOpen}
        onOpenChange={setSoalSheetOpen}
        soalSet={null}
        onSuccess={handleSoalSuccess}
        onCancel={() => setSoalSheetOpen(false)}
      />
    </div>
  );
}

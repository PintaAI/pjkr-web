"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, Search, Filter, Star, Clock, DollarSign } from "lucide-react";
import { KelasType, Difficulty } from "@prisma/client";
import Link from "next/link";
import { filterKelas } from "@/app/actions/kelas-public";
import Image from "next/image";

interface KelasItem {
  id: number;
  title: string;
  description: string | null;
  type: KelasType;
  level: Difficulty;
  thumbnail: string | null;
  isPaidClass: boolean;
  price: any; // Handle Prisma Decimal type
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    materis: number;
    members: number;
  };
}

interface KelasListPageProps {
  initialKelas: KelasItem[];
  initialStats: {
    totalClasses: number;
    totalStudents: number;
    typeStats: { type: KelasType; _count: { id: number } }[];
    levelStats: { level: Difficulty; _count: { id: number } }[];
  } | null;
  initialMeta: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

const typeLabels: Record<KelasType, string> = {
  REGULAR: "Regular",
  EVENT: "Event",
  GROUP: "Group",
  PRIVATE: "Private",
  FUN: "Fun",
};

const levelLabels: Record<Difficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const levelColors: Record<Difficulty, string> = {
  BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function KelasListPage({ initialKelas, initialStats, initialMeta }: KelasListPageProps) {
  const [kelas, setKelas] = useState<KelasItem[]>(initialKelas);
  const [stats] = useState(initialStats);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<KelasType | "ALL">("ALL");
  const [levelFilter, setLevelFilter] = useState<Difficulty | "ALL">("ALL");

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        level: levelFilter !== "ALL" ? levelFilter : undefined,
        limit: 12,
        offset: 0,
      };

      const result = await filterKelas(params);
      
      if (result.success) {
        setKelas(result.data);
        setMeta(result.meta);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, levelFilter]);

  const handleLoadMore = async () => {
    if (!meta.hasMore || loading) return;
    
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        level: levelFilter !== "ALL" ? levelFilter : undefined,
        limit: 12,
        offset: meta.offset + meta.limit,
      };

      const result = await filterKelas(params);
      
      if (result.success) {
        setKelas(prev => [...prev, ...result.data]);
        setMeta(result.meta);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search || typeFilter !== "ALL" || levelFilter !== "ALL") {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, typeFilter, levelFilter, handleSearch]);

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-3">
          Explore Classes
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover Korean language classes tailored to your learning journey
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalClasses}</div>
              <p className="text-xs text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Students</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Learning together</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Beginner</p>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.levelStats.find(s => s.level === "BEGINNER")?._count.id || 0}
              </div>
              <p className="text-xs text-muted-foreground">Entry level</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Advanced</p>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.levelStats.find(s => s.level === "ADVANCED")?._count.id || 0}
              </div>
              <p className="text-xs text-muted-foreground">Expert level</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as KelasType | "ALL")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Class Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.entries(typeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as Difficulty | "ALL")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            {Object.entries(levelLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kelas.map((kelasItem) => (
          <Card key={kelasItem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                {kelasItem.thumbnail ? (
                  <Image 
                    src={kelasItem.thumbnail} 
                    alt={kelasItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[kelasItem.type]}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className={levelColors[kelasItem.level]}>
                  {levelLabels[kelasItem.level]}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                  {kelasItem.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {kelasItem.description || "No description available"}
                </p>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={kelasItem.author.image || ""} />
                  <AvatarFallback>
                    {kelasItem.author.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {kelasItem.author.name || "Unknown"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{kelasItem._count.materis}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{kelasItem._count.members}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {kelasItem.isPaidClass ? (
                    <>
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-semibold text-green-600">
                        ${kelasItem.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-semibold text-green-600">Free</span>
                  )}
                </div>
                <Button asChild size="sm">
                  <Link href={`/kelas/${kelasItem.id}`}>
                    View Class
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {meta.hasMore && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleLoadMore} 
            disabled={loading}
            variant="outline"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* No Results */}
      {kelas.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No classes found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or check back later for new classes.
          </p>
        </div>
      )}
    </div>
  );
}

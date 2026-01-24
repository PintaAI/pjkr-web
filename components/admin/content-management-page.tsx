"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Eye,
  FileText,
  Activity,
  TrendingUp
} from "lucide-react";

import {
  getAllClasses,
  getContentStats,
  adminDeleteClass,
  type ClassFilters,
  type ClassWithAuthor
} from "@/app/actions/dashboard/admin";
import { ManageLayout } from "@/components/dashboard/manage-layout";
import { KelasCard, GuruKelas } from "@/components/kelas/kelas-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ContentStats {
  totalClasses: number;
  publishedClasses: number;
  draftClasses: number;
  totalMaterials: number;
  totalEnrollments: number;
  classesThisWeek: number;
}

interface ContentManagementPageProps {
  initialClasses: ClassWithAuthor[];
  initialStats: ContentStats;
  totalPages: number;
  currentPage: number;
}

const typeLabels = {
  REGULAR: "Regular",
  EVENT: "Event",
  GROUP: "Group",
  PRIVATE: "Private",
  FUN: "Fun",
};

const levelLabels = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export function ContentManagementPage({
  initialClasses,
  initialStats,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage
}: ContentManagementPageProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [stats, setStats] = useState(initialStats);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "REGULAR" | "EVENT" | "GROUP" | "PRIVATE" | "FUN">("ALL");
  const [filterLevel, setFilterLevel] = useState<"ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("ALL");

  const fetchClasses = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const filters: ClassFilters = {
        search: searchTerm,
        status: filterStatus,
        type: filterType,
        level: filterLevel,
        page,
        limit: 12
      };

      const result = await getAllClasses(filters);
      setClasses(result.classes);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, filterType, filterLevel]);

  const fetchStats = async () => {
    try {
      const newStats = await getContentStats();
      setStats(newStats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handlePageChange = (page: number) => {
    fetchClasses(page);
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) return;
    try {
      const result = await adminDeleteClass(id);
      if (result.success) {
        setClasses(prev => prev.filter(cls => cls.id !== id));
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  };

  const mapToGuruKelas = (cls: ClassWithAuthor): GuruKelas => ({
    ...cls,
    id: cls.id,
    title: cls.title,
    description: cls.description,
    type: cls.type as any,
    level: cls.level as any,
    thumbnail: cls.thumbnail,
    isPaidClass: cls.isPaidClass,
    isDraft: cls.isDraft,
    createdAt: cls.createdAt,
    updatedAt: cls.updatedAt,
    author: {
      id: cls.author.id,
      name: cls.author.name,
      image: null,
    },
    _count: {
      materis: cls._count.materis,
      members: cls._count.members,
    }
  });

  // Stabilize handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setTimeout(() => fetchClasses(1), 0);
  }, [fetchClasses]);

  const handleStatusChange = useCallback((value: string) => {
    setFilterStatus(value as "ALL" | "PUBLISHED" | "DRAFT");
    setTimeout(() => fetchClasses(1), 0);
  }, [fetchClasses]);

  const handleTypeChange = useCallback((value: string) => {
    setFilterType(value as any);
    setTimeout(() => fetchClasses(1), 0);
  }, [fetchClasses]);

  const handleLevelChange = useCallback((value: string) => {
    setFilterLevel(value as any);
    setTimeout(() => fetchClasses(1), 0);
  }, [fetchClasses]);

  // Memoize filters to prevent re-renders
  const filters = useMemo(() => [
    {
      key: "status",
      type: "select" as const,
      label: "Status",
      value: filterStatus,
      options: [
        { value: "ALL", label: "All Status" },
        { value: "PUBLISHED", label: "Published" },
        { value: "DRAFT", label: "Draft" },
      ],
      onChange: handleStatusChange,
    },
    {
      key: "type",
      type: "select" as const,
      label: "Type",
      value: filterType,
      options: [
        { value: "ALL", label: "All Types" },
        ...Object.entries(typeLabels).map(([key, label]) => ({ value: key, label })),
      ],
      onChange: handleTypeChange,
    },
    {
      key: "level",
      type: "select" as const,
      label: "Level",
      value: filterLevel,
      options: [
        { value: "ALL", label: "All Levels" },
        ...Object.entries(levelLabels).map(([key, label]) => ({ value: key, label })),
      ],
      onChange: handleLevelChange,
    },
  ], [filterStatus, filterType, filterLevel, handleStatusChange, handleTypeChange, handleLevelChange]);

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Stats - Keeping these valid for Admin overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.classesThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.publishedClasses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalClasses > 0 ? Math.round((stats.publishedClasses / stats.totalClasses) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draftClasses}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting publication
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materials</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">
              Total content pieces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Total student enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.publishedClasses > 0 ? Math.round(stats.totalEnrollments / stats.publishedClasses) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per published class
            </p>
          </CardContent>
        </Card>
      </div>

      <ManageLayout
        title="Content Management"
        description="Manage all classes created by teachers across the platform"
        placeholder="Search classes, descriptions, or teachers..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
        loading={loading}
        error={null}
        items={classes}
        renderItem={(cls: ClassWithAuthor) => (
          <KelasCard
            key={cls.id}
            data={mapToGuruKelas(cls)}
            isGuruMode={true}
            onView={(id) => window.location.href = `/kelas/${id}`}
            onDelete={handleDeleteClass}
          />
        )}
        emptyTitle="No classes found"
        emptyMessage="No classes match your current filters. Try adjusting your search criteria."
      >
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </ManageLayout>
    </div>
  );
}

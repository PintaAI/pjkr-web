"use client";

import { useState, } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  Search, 
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  User,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { 
  getAllClasses, 
  getContentStats, 
  adminToggleClassStatus, 
  adminDeleteClass,
  type ClassFilters,
  type ClassWithAuthor 
} from "@/app/actions/admin-dashboard";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

const levelColors = {
  BEGINNER: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  ADVANCED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
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
  
  // Actions state
  const [isToggling, setIsToggling] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const fetchClasses = async (page: number = 1) => {
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
  };

  const fetchStats = async () => {
    try {
      const newStats = await getContentStats();
      setStats(newStats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleSearch = () => {
    fetchClasses(1);
  };

  const handleFilterChange = () => {
    fetchClasses(1);
  };

  const handlePageChange = (page: number) => {
    fetchClasses(page);
  };

  const handleToggleStatus = async (id: number) => {
    setIsToggling(id);
    try {
      const result = await adminToggleClassStatus(id);
      if (result.success) {
        setClasses(prev => prev.map(cls => 
          cls.id === id ? { ...cls, isDraft: !cls.isDraft } : cls
        ));
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to toggle class status:", error);
    } finally {
      setIsToggling(null);
    }
  };

  const handleDeleteClass = async (id: number) => {
    setIsDeleting(id);
    try {
      const result = await adminDeleteClass(id);
      if (result.success) {
        setClasses(prev => prev.filter(cls => cls.id !== id));
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to delete class:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const publishedClasses = classes.filter(cls => !cls.isDraft);
  const draftClasses = classes.filter(cls => cls.isDraft);

  const ClassCard = ({ cls }: { cls: ClassWithAuthor }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {typeLabels[cls.type as keyof typeof typeLabels]}
              </Badge>
              <Badge className={`text-xs ${levelColors[cls.level as keyof typeof levelColors]}`}>
                {levelLabels[cls.level as keyof typeof levelLabels]}
              </Badge>
              {cls.isDraft && (
                <Badge variant="secondary" className="text-xs">
                  Draft
                </Badge>
              )}
              {cls.isPaidClass && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  Paid
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{cls.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {cls.description || "No description available"}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <User className="h-4 w-4" />
              <span>{cls.author.name || cls.author.email}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/kelas/${cls.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Class
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    disabled={isToggling === cls.id}
                  >
                    {cls.isDraft ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        {isToggling === cls.id ? "Publishing..." : "Publish"}
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        {isToggling === cls.id ? "Unpublishing..." : "Unpublish"}
                      </>
                    )}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {cls.isDraft ? "Publish" : "Unpublish"} Class
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to {cls.isDraft ? "publish" : "unpublish"} "{cls.title}"? 
                      {cls.isDraft 
                        ? " This will make the class available to students."
                        : " This will hide the class from students and move it back to drafts."
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleToggleStatus(cls.id)}
                      className={cls.isDraft ? "bg-primary" : "bg-orange-600 hover:bg-orange-700"}
                    >
                      {cls.isDraft ? "Publish" : "Unpublish"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={(e) => e.preventDefault()}
                    disabled={isDeleting === cls.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === cls.id ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Class</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{cls.title}"? This action cannot be undone and will remove all associated materials and enrollments.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteClass(cls.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{cls._count.materis} materials</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{cls._count.members} students</span>
          </div>
          {cls.isPaidClass && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <DollarSign className="h-4 w-4" />
              <span>${cls.price}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(cls.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ type }: { type: "all" | "published" | "draft" }) => (
    <Card className="text-center py-12">
      <CardContent>
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No {type === "all" ? "" : type} classes found
        </h3>
        <p className="text-muted-foreground">
          {type === "all" 
            ? "No classes match your current filters. Try adjusting your search criteria."
            : `No ${type} classes found. ${type === "published" ? "Classes will appear here once they are published." : "Draft classes created by teachers will appear here."}`
          }
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Manage all classes created by teachers across the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes, descriptions, or teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={(value: any) => {
          setFilterStatus(value);
          handleFilterChange();
        }}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={(value: any) => {
          setFilterType(value);
          handleFilterChange();
        }}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.entries(typeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterLevel} onValueChange={(value: any) => {
          setFilterLevel(value);
          handleFilterChange();
        }}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            {Object.entries(levelLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} className="lg:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Classes Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Classes ({classes.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedClasses.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({draftClasses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading classes...</p>
            </div>
          ) : classes.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </div>
              
              {totalPages > 1 && (
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
              )}
            </>
          ) : (
            <EmptyState type="all" />
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          {publishedClasses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publishedClasses.map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          ) : (
            <EmptyState type="published" />
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          {draftClasses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {draftClasses.map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          ) : (
            <EmptyState type="draft" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

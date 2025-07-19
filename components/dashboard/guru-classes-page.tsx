"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  Search, 
  Plus,
  Edit3,
  Eye,
  Trash2,
  Calendar,
  Star,
  DollarSign,
  Clock,
  FileText,
  Settings,
  MoreVertical,
  Filter
} from "lucide-react";
import { KelasType, Difficulty } from "@prisma/client";
import Link from "next/link";
import { deleteDraftKelas, publishKelas } from "@/app/actions/kelas";
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

interface KelasItem {
  id: number;
  title: string;
  description: string | null;
  type: KelasType;
  level: Difficulty;
  thumbnail: string | null;
  isPaidClass: boolean;
  price: any;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    materis: number;
    members: number;
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface GuruClassesPageProps {
  classes: KelasItem[];
  user: User;
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

export function GuruClassesPage({ classes: initialClasses, user }: GuruClassesPageProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<KelasType | "ALL">("ALL");
  const [filterLevel, setFilterLevel] = useState<Difficulty | "ALL">("ALL");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState<number | null>(null);

  const draftClasses = classes.filter(cls => cls.isDraft);
  const publishedClasses = classes.filter(cls => !cls.isDraft);

  const filteredClasses = (classList: KelasItem[]) => {
    return classList.filter(cls => {
      const matchesSearch = cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "ALL" || cls.type === filterType;
      const matchesLevel = filterLevel === "ALL" || cls.level === filterLevel;
      
      return matchesSearch && matchesType && matchesLevel;
    });
  };

  const handleDeleteClass = async (id: number) => {
    setIsDeleting(id);
    try {
      const result = await deleteDraftKelas(id);
      if (result.success) {
        setClasses(prev => prev.filter(cls => cls.id !== id));
      } else {
        console.error("Failed to delete class:", result.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePublishClass = async (id: number) => {
    setIsPublishing(id);
    try {
      const result = await publishKelas(id);
      if (result.success) {
        setClasses(prev => prev.map(cls => 
          cls.id === id ? { ...cls, isDraft: false } : cls
        ));
      } else {
        console.error("Failed to publish class:", result.error);
      }
    } catch (error) {
      console.error("Publish error:", error);
    } finally {
      setIsPublishing(null);
    }
  };

  const ClassCard = ({ cls }: { cls: KelasItem }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {typeLabels[cls.type]}
              </Badge>
              <Badge className={`text-xs ${levelColors[cls.level]}`}>
                {levelLabels[cls.level]}
              </Badge>
              {cls.isDraft && (
                <Badge variant="secondary" className="text-xs">
                  Draft
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{cls.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {cls.description || "No description available"}
            </p>
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
              {cls.isDraft ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/guru/kelas-builder?edit=${cls.id}`}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handlePublishClass(cls.id)}
                    disabled={isPublishing === cls.id || cls._count.materis === 0}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isPublishing === cls.id ? "Publishing..." : "Publish"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDeleteClass(cls.id)}
                    disabled={isDeleting === cls.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting === cls.id ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/guru/classes/${cls.id}/analytics`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/guru/classes/${cls.id}/settings`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
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

        {cls.isDraft && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/guru/kelas-builder?edit=${cls.id}`}>
                <Edit3 className="h-4 w-4 mr-2" />
                Continue Editing
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  disabled={cls._count.materis === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Publish Class</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to publish "{cls.title}"? Once published, students will be able to enroll in this class.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handlePublishClass(cls.id)}>
                    Publish
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const EmptyState = ({ type }: { type: "draft" | "published" }) => (
    <Card className="text-center py-12">
      <CardContent>
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No {type} classes yet
        </h3>
        <p className="text-muted-foreground mb-4">
          {type === "draft" 
            ? "Start creating your first class to share your knowledge with students."
            : "Publish your draft classes to make them available to students."
          }
        </p>
        {type === "draft" && (
          <Button asChild>
            <Link href="/dashboard/guru/kelas-builder">
              <Plus className="h-4 w-4 mr-2" />
              Create New Class
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-muted-foreground">
            Manage your drafted and published classes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/guru/kelas-builder">
            <Plus className="h-4 w-4 mr-2" />
            Create New Class
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedClasses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{draftClasses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {classes.reduce((total, cls) => total + cls._count.members, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={(value) => setFilterType(value as KelasType | "ALL")}>
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

        <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as Difficulty | "ALL")}>
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
      </div>

      {/* Classes Tabs */}
      <Tabs defaultValue="drafts" className="w-full">
        <TabsList>
          <TabsTrigger value="drafts">
            Drafts ({draftClasses.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedClasses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-6">
          {filteredClasses(draftClasses).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses(draftClasses).map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          ) : (
            <EmptyState type="draft" />
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-6">
          {filteredClasses(publishedClasses).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses(publishedClasses).map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
            </div>
          ) : (
            <EmptyState type="published" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  BookOpen,
  Users,
  Plus,
  Eye,
} from "lucide-react";
import { KelasType, Difficulty } from "@prisma/client";
import { deleteDraftKelas, publishKelas, unpublishKelas } from "@/app/actions/kelas";
import { KelasCard, GuruKelas } from "@/components/kelas/kelas-card";
import { toast } from "sonner";
import { SearchFilters } from "@/components/ui/search-filters";

// Types
interface KelasItem extends GuruKelas {
  createdAt: Date;
  updatedAt: Date;
  price: any;
  icon: string | null;
  discount: number | null;
  promoCode: string | null;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface ManageClassesProps {
  classes: any[];
  user?: User;
  embedded?: boolean;
}

// Constants
const TYPE_LABELS: Record<KelasType, string> = {
  REGULAR: "Regular",
  EVENT: "Event",
  GROUP: "Group",
  PRIVATE: "Private",
  FUN: "Fun",
};

const LEVEL_LABELS: Record<Difficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};


// Filter options
const FILTER_TYPES = [
  { value: "ALL", label: "All Types" },
  ...Object.entries(TYPE_LABELS).map(([key, label]) => ({ value: key, label })),
];

const FILTER_LEVELS = [
  { value: "ALL", label: "All Levels" },
  ...Object.entries(LEVEL_LABELS).map(([key, label]) => ({ value: key, label })),
];

// Custom hook for class management
const useClassManagement = (initialClasses: any[]) => {
  const [classes, setClasses] = useState(() =>
    initialClasses.map(cls => ({
      ...cls,
      author: {
        id: '',
        name: 'You',
        image: null
      }
    }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<KelasType | "ALL">("ALL");
  const [filterLevel, setFilterLevel] = useState<Difficulty | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState<number | null>(null);
  const [isUnpublishing, setIsUnpublishing] = useState<number | null>(null);

  // Filter functions
  const filteredClasses = () => {
    return classes.filter(cls => {
      const matchesSearch = cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cls.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "ALL" || cls.type === filterType;
      const matchesLevel = filterLevel === "ALL" || cls.level === filterLevel;
      const matchesStatus = filterStatus === "ALL" ||
                           (filterStatus === "PUBLISHED" && !cls.isDraft) ||
                           (filterStatus === "DRAFT" && cls.isDraft);

      return matchesSearch && matchesType && matchesLevel && matchesStatus;
    });
  };

  // Action handlers
  const handleDeleteClass = async (id: number) => {
    setIsDeleting(id);
    try {
      const result = await deleteDraftKelas(id);
      if (result.success) {
        setClasses(prev => prev.filter(cls => cls.id !== id));
        toast.success("Class deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete class");
      }
    } catch {
      toast.error("An unexpected error occurred");
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
        toast.success("Class published successfully");
      } else {
        toast.error(result.error || "Failed to publish class");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPublishing(null);
    }
  };

  const handleUnpublishClass = async (id: number) => {
    setIsUnpublishing(id);
    try {
      const result = await unpublishKelas(id);
      if (result.success) {
        setClasses(prev => prev.map(cls =>
          cls.id === id ? { ...cls, isDraft: true } : cls
        ));
        toast.success("Class unpublished successfully");
      } else {
        toast.error(result.error || "Failed to unpublish class");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUnpublishing(null);
    }
  };

  return {
    classes,
    setClasses,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterLevel,
    setFilterLevel,
    filterStatus,
    setFilterStatus,
    isDeleting,
    isPublishing,
    isUnpublishing,
    filteredClasses,
    handleDeleteClass,
    handlePublishClass,
    handleUnpublishClass,
  };
};

// Stats calculation helper
const calculateStats = (classes: any[]) => {
  const totalStudents = classes.reduce((total, cls) => total + cls._count.members, 0);
  const totalMaterials = classes.reduce((total, cls) => total + cls._count.materis, 0);
  const publishedCount = classes.filter(cls => !cls.isDraft).length;
  const draftCount = classes.filter(cls => cls.isDraft).length;

  return {
    totalClasses: classes.length,
    totalStudents,
    totalMaterials,
    publishedCount,
    draftCount,
  };
};

// Components
const ClassCard = ({ cls, actions }: { cls: KelasItem; actions: any }) => (
  <KelasCard
    data={cls}
    isGuruMode={true}
    onView={actions.onView}
    onEdit={actions.onEdit}
    onDelete={actions.onDelete}
    onPublish={actions.onPublish}
    onUnpublish={actions.onUnpublish}
  />
);


const StatsCards = ({ stats }: { stats: ReturnType<typeof calculateStats> }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatsCard
      title="Total Classes"
      value={stats.totalClasses}
      description={`${stats.publishedCount} published, ${stats.draftCount} drafts`}
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
      value={stats.publishedCount}
      description="Live for students"
      icon={<Eye className="h-4 w-4" />}
    />
    <StatsCard
      title="Total Materials"
      value={stats.totalMaterials}
      description="Learning materials"
      icon={<BookOpen className="h-4 w-4" />}
    />
  </div>
);



const ClassGrid = ({
  filteredClasses,
  onCreateClass,
  onDeleteClass,
  onPublishClass,
  onUnpublishClass
}: {
  filteredClasses: KelasItem[];
  onCreateClass: () => void;
  onDeleteClass: (id: number) => void;
  onPublishClass: (id: number) => void;
  onUnpublishClass: (id: number) => void;
}) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-dashed border-2" onClick={onCreateClass}>
      <CardContent className="flex flex-col items-center justify-center h-48">
        <Plus className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-sm sm:text-base font-semibold leading-snug text-center">
          Create New Class
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground text-center">
          Start building a new class
        </p>
      </CardContent>
    </Card>
    {filteredClasses.map((cls) => (
      <ClassCard
        key={cls.id}
        cls={cls}
        actions={{
          onView: (id: number) => (window.location.href = `/kelas/${id}`),
          onEdit: (id: number) => (window.location.href = `/dashboard/guru/kelas-builder?edit=${id}`),
          onDelete: (id: number) => onDeleteClass(id),
          onPublish: (id: number) => onPublishClass(id),
          onUnpublish: (id: number) => onUnpublishClass(id),
        }}
      />
    ))}
  </div>
);

export function ManageClasses({ classes: initialClasses, embedded = false }: Omit<ManageClassesProps, 'user'>) {
  const management = useClassManagement(initialClasses);
  const stats = calculateStats(management.classes);

  const handleCreateClass = () => {
    window.location.href = "/dashboard/guru/kelas-builder";
  };

  return (
    <div className={embedded ? "" : "container mx-auto px-6 py-8 max-w-6xl"}>
      {!embedded && (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Managemen Kelas</h1>
              <p className="text-muted-foreground">
                Manage your drafted and published classes
              </p>
            </div>
            <Button onClick={handleCreateClass}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Class
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />
        </>
      )}

      {/* Filters */}
      <SearchFilters
        placeholder="Search classes..."
        searchValue={management.searchTerm}
        onSearchChange={management.setSearchTerm}
        filters={[
          {
            key: "type",
            type: "select",
            label: "Class Type",
            value: management.filterType,
            options: FILTER_TYPES,
            onChange: (value) => management.setFilterType(value as KelasType | "ALL"),
          },
          {
            key: "level",
            type: "select",
            label: "Difficulty",
            value: management.filterLevel,
            options: FILTER_LEVELS,
            onChange: (value) => management.setFilterLevel(value as Difficulty | "ALL"),
          },
          {
            key: "status",
            type: "select",
            label: "Status",
            value: management.filterStatus,
            options: [
              { value: "ALL", label: "All Classes" },
              { value: "PUBLISHED", label: "Published" },
              { value: "DRAFT", label: "Draft" },
            ],
            onChange: (value) => management.setFilterStatus(value as "ALL" | "PUBLISHED" | "DRAFT"),
          },
        ]}
      />

      {/* Classes Grid */}
      {management.filteredClasses().length > 0 ? (
        <ClassGrid
          filteredClasses={management.filteredClasses()}
          onCreateClass={handleCreateClass}
          onDeleteClass={management.handleDeleteClass}
          onPublishClass={management.handlePublishClass}
          onUnpublishClass={management.handleUnpublishClass}
        />
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No classes found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters, or create your first class.
            </p>
            <Button onClick={handleCreateClass}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Class
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

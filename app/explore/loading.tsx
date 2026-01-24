import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/75 border-b shadow-md -mx-4 lg:-mx-6 -mt-4 lg:-mt-6">
        <div>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-6">
                Explore
              </h1>
            </div>
            <p className="text-lg mt-2 text-muted-foreground max-w-2xl mx-auto">
              Discover Korean learning content, connect with teachers, and explore vocabulary collections
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-4">
            <Skeleton className="h-10 flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-12" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-14" />
              <Skeleton className="h-9 w-18" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="break-inside-avoid mb-4">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

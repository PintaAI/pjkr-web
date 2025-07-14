import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span>/</span>
        <Skeleton className="h-4 w-12" />
        <span>/</span>
        <Skeleton className="h-4 w-20" />
        <span>/</span>
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* Page Title */}
      <Skeleton className="h-9 w-48 mb-6" />
      <Skeleton className="h-5 w-96 mb-6" />
      
      {/* Lessons Section */}
      <div className="mb-8">
        <Skeleton className="h-8 w-24 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg flex justify-between items-center">
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

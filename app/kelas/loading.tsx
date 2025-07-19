import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <div className="ml-auto">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="relative">
              <Skeleton className="w-full h-48" />
              <div className="absolute top-4 left-4">
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="absolute top-4 right-4">
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <CardContent className="p-6">
              <div className="mb-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-8">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

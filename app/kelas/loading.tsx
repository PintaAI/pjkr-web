import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          {/* Matches h1 text-3xl font-bold tracking-tight height */}
          <Skeleton className="h-9 w-64 mb-2.5" />
          {/* Matches subtitle text-muted-foreground single line */}
          <Skeleton className="h-4 w-[28rem]" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="py-[26px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-14 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search wrapper should be relative flex-1 like live page */}
        <div className="relative flex-1">
          {/* leading icon space simulated via full-width skeleton with pl-10 equivalent width */}
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Type select (w-full sm:w-48) */}
        <Skeleton className="h-10 w-full sm:w-48" />
        {/* Level select (w-full sm:w-48) */}
        <Skeleton className="h-10 w-full sm:w-48" />
        {/* Small outline button space with same vertical rhythm as inputs */}
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Class Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="group overflow-hidden py-0">
            {/* Media skeleton with 16:9 aspect to match real card */}
            <div className="relative">
              <div className="relative w-full aspect-[16/9] bg-muted/40">
                <Skeleton className="absolute inset-0" />
                {/* gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                {/* badges row: top-2 with left flex gap-2 */}
                <div className="absolute top-2 left-2 flex gap-2">
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="absolute top-2 right-2">
                  <Skeleton className="h-6 w-20" />
                </div>
                {/* Bottom overlay: author + counts with exact gaps */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-3">
                    {/* Author */}
                    <div className="flex min-w-0 items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    {/* Divider dot mimicking a small • */}
                    <div className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    {/* Counts */}
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-3 w-8" />
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-3 w-8" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* CardContent with title and description only */}
            <CardContent className="sm:px-4 pt-0 pb-3 sm:pb-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-8 mb-8">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

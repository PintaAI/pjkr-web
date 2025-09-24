import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MateriListLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 -mt-6 space-y-6">
      {/* Header with thumbnail skeleton */}
      <div className="relative h-48 rounded-xl overflow-hidden mb-6 bg-muted">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

        {/* Breadcrumb skeleton */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-1 mx-1" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-1 mx-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Header content skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-6 w-12" />
          </div>
          <Skeleton className="h-4 w-80 mb-2" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-1 mx-1" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Materi body skeleton */}
      <Card>
        <CardContent className="p-6 space-y-4">

        </CardContent>
      </Card>
    </div>
  )
}
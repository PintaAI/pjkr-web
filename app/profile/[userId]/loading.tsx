import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Profile Header Skeleton - Instagram Style */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
          {/* Profile Picture Skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full" />
          </div>

          {/* Profile Info Skeleton */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <Skeleton className="h-8 w-48 md:w-64 mx-auto md:mx-0 mb-2" />
              <Skeleton className="h-4 w-32 md:w-40 mx-auto md:mx-0 mb-3" />
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            {/* Bio Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-4 w-full max-w-md mx-auto md:mx-0 mb-1" />
              <Skeleton className="h-4 w-3/4 max-w-md mx-auto md:mx-0 mb-1" />
              <Skeleton className="h-4 w-1/2 max-w-md mx-auto md:mx-0" />
            </div>

            {/* Edit Button Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-8 w-24 mx-auto md:mx-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>

        {/* Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-2" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
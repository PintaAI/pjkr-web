import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function SkeletonStatsCard({ 
  title, 
  icon: Icon 
}: { 
  title: string; 
  icon: React.ElementType; 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-16 mb-2" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

export function SkeletonUserRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-4 rounded" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8 rounded" />
      </TableCell>
    </TableRow>
  );
}

export function SkeletonLoadingMore() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-16 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading more users...</span>
        </div>
      </TableCell>
    </TableRow>
  );
}

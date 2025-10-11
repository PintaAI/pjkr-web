"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/lib/hooks/use-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Database,
  Image as ImageIcon,
  Video,
  FileText,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Resource {
  public_id: string;
  resource_type: 'image' | 'video' | 'raw';
  bytes: number;
  secure_url: string;
  created_at: string;
}

interface StorageStats {
  usage: {
    storage: number;
    images: number;
    videos: number;
    raw: number;
    transforms: number;
  };
}

interface ApiResponse {
  success: boolean;
  data?: {
    stats: StorageStats;
    resources: Resource[];
    next_cursor?: string;
    has_more: boolean;
  };
  error?: string;
}

export default function StorageManagement() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = usePermissions();

  const [apiData, setApiData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);

  const fetchStorageData = async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/api/storage', window.location.origin);
      url.searchParams.set('max_results', '20');
      if (cursor) url.searchParams.set('next_cursor', cursor);
      const res = await fetch(url.toString());
      const json: ApiResponse = await res.json();
      if (json.success && json.data) {
        setApiData(prev => cursor ? { ...prev!, resources: json.data!.resources, next_cursor: json.data!.next_cursor, has_more: json.data!.has_more } : json.data);
        setNextCursor(json.data!.next_cursor);
      } else {
        setError(json.error || "Failed to fetch data");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };



  const handleBulkDelete = async () => {
    if (selectedResources.length === 0) return;
    
    if (!confirm(`Delete ${selectedResources.length} selected files?`)) return;
    
    try {
      const deletePromises = selectedResources.map(resource =>
        fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            publicId: resource.public_id,
            resource_type: resource.resource_type
          }),
        })
      );
      
      const results = await Promise.all(deletePromises);
      const failed = results.filter(res => !res.ok);
      
      if (failed.length > 0) {
        alert(`${failed.length} deletions failed`);
      } else {
        alert(`${selectedResources.length} files deleted successfully`);
      }
      
      // Clear selection and refresh
      setSelectedResources([]);
      fetchStorageData(nextCursor);
    } catch {
      alert('Bulk delete error');
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/unauthorized");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    fetchStorageData();
  }, []);


  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatCount = (count: number) => count.toLocaleString();

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !apiData) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-destructive mr-2" />
          <span className="text-destructive">{error || "No data available"}</span>
        </div>
        <div className="text-center mt-4">
          <Button onClick={() => fetchStorageData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = apiData.stats;

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Storage Management</h1>
          <p className="text-muted-foreground">
            Monitor your Cloudinary storage usage and manage assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchStorageData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link href="/api/upload">
            <Button>
              Upload Media
            </Button>
          </Link>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Storage Usage"
          value={formatBytes(stats.usage.storage)}
          description="Calculated from actual files"
          icon={<Database className="h-4 w-4" />}
        />
        <StatsCard
          title="Images"
          value={formatCount(stats.usage.images)}
          description="Image files"
          icon={<ImageIcon className="h-4 w-4" />}
        />
        <StatsCard
          title="Videos"
          value={formatCount(stats.usage.videos)}
          description="Video files"
          icon={<Video className="h-4 w-4" />}
        />
        <StatsCard
          title="Documents"
          value={formatCount(stats.usage.raw)}
          description="Document files"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatsCard
          title="Transforms"
          value={formatCount(stats.usage.transforms)}
          description="Image transformations"
          icon={<RefreshCw className="h-4 w-4" />}
        />
      </div>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>Manage your assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedResources.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {selectedResources.length} item(s) selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedResources([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
          <DataTable
            columns={columns}
            data={apiData.resources}
            onRowSelectionChange={setSelectedResources}
          />
        </CardContent>
      </Card>
    </div>
  );
}
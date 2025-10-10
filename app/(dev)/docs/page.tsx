import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Book, Code, Globe, ArrowRight, Loader2 } from "lucide-react";
import fs from "fs/promises";
import path from "path";

// Icon mapping for different doc types
const iconMap: Record<string, { icon: any; color: string; bgColor: string }> = {
  authentication: { 
    icon: Book, 
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900"
  },
  "server-actions": { 
    icon: Code, 
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900"
  },
  "api-routes": { 
    icon: Globe, 
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900"
  },
  readme: { 
    icon: FileText, 
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900"
  },
};

interface DocFile {
  name: string;
  slug: string;
  title: string;
  description: string;
}

async function getDocFiles(): Promise<DocFile[]> {
  try {
    const docsDirectory = path.join(process.cwd(), "docs");
    const files = await fs.readdir(docsDirectory);
    
    const docFiles = await Promise.all(
      files
        .filter(file => file.endsWith(".md"))
        .map(async (file) => {
          const filePath = path.join(docsDirectory, file);
          const content = await fs.readFile(filePath, "utf-8");
          
          // Extract title and description from markdown
          const lines = content.split("\n");
          const title = lines.find(line => line.startsWith("# "))?.replace("# ", "").trim() || 
                       file.replace(".md", "").replace(/-/g, " ");
          
          // Get first paragraph as description
          const descriptionLine = lines.find(line => 
            line.trim() && 
            !line.startsWith("#") && 
            !line.startsWith("---") &&
            !line.startsWith("```")
          )?.trim() || "";
          
          const slug = file.replace(".md", "").toLowerCase();
          
          return {
            name: file,
            slug,
            title,
            description: descriptionLine.slice(0, 150) + (descriptionLine.length > 150 ? "..." : ""),
          };
        })
    );
    
    // Sort: README first, then alphabetically
    return docFiles.sort((a, b) => {
      if (a.slug === "readme") return -1;
      if (b.slug === "readme") return 1;
      return a.slug.localeCompare(b.slug);
    });
  } catch (error) {
    console.error("Error reading docs:", error);
    return [];
  }
}

export default async function DocsPage() {
  const docFiles = await getDocFiles();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📚 Authentication & API Documentation</h1>
        <p className="text-muted-foreground text-lg">
          Complete guides for implementing authentication, authorization, server actions, and API routes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {docFiles.map((doc) => {
          const iconConfig = iconMap[doc.slug] || iconMap.readme;
          const Icon = iconConfig.icon;
          
          return (
            <Card key={doc.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${iconConfig.bgColor} rounded-lg`}>
                      <Icon className={`h-6 w-6 ${iconConfig.color}`} />
                    </div>
                    <div>
                      <CardTitle>{doc.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{doc.name}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {doc.description}
                </p>
                <Link href={`/docs/view/${doc.slug}`}>
                  <Button className="w-full" variant="outline">
                    View Documentation <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {docFiles.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">No documentation files found in the docs folder.</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>🚀 Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">User Roles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">MURID</span>
                <span className="text-muted-foreground">Student (default)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">GURU</span>
                <span className="text-muted-foreground">Teacher</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">ADMIN</span>
                <span className="text-muted-foreground">Administrator</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Subscription Tiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">FREE</span>
                <span className="text-muted-foreground">Basic features</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">PREMIUM</span>
                <span className="text-muted-foreground">Enhanced features</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">CUSTOM</span>
                <span className="text-muted-foreground">Full access</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Key Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
              <code className="text-xs bg-background px-2 py-1 rounded">lib/auth.ts</code>
              <code className="text-xs bg-background px-2 py-1 rounded">lib/auth-client.ts</code>
              <code className="text-xs bg-background px-2 py-1 rounded">lib/auth-actions.ts</code>
              <code className="text-xs bg-background px-2 py-1 rounded">lib/session.ts</code>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Total Documentation Files:</strong> {docFiles.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
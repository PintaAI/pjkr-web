"use client";

import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { 
  
  FileText, 
  
  AlertCircle,
  
  Eye
} from "lucide-react";
import KelasDetailPage from "@/components/kelas/kelas-detail-page";
import { useSession } from "@/lib/hooks/use-session";

export function StepReview() {
  const { 
    meta, 
    materis, 
    vocabSets, 
    soalSets 
  } = useKelasBuilderStore();
  
  const { session } = useSession();

  const hasTitle = meta.title && meta.title.trim() !== '';
  const hasDescription = meta.description && meta.description.trim() !== '';
  const hasContent = materis.length > 0;
  const hasValidPricing = !meta.isPaidClass || (meta.price && meta.price > 0);

  const isReadyToPublish = hasTitle && hasDescription && hasContent && hasValidPricing;

  // Create mock kelas data from the store for preview
  const mockKelasData = {
    id: 999,
    title: meta.title || "Your Course Title",
    description: meta.description || "Your course description will appear here",
    jsonDescription: meta.jsonDescription || null,
    htmlDescription: meta.htmlDescription || null,
    type: meta.type as any,
    level: meta.level as any,
    thumbnail: meta.thumbnail || null,
    icon: meta.icon || null,
    isPaidClass: meta.isPaidClass,
    price: meta.price || 0,
    discount: meta.discount || 0,
    promoCode: meta.promoCode || null,
    isDraft: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: session?.user?.id || "preview-author",
    author: {
      id: session?.user?.id || "preview-author",
      name: session?.user?.name || "Course Creator",
      image: session?.user?.image || null,
    },
    materis: materis.map((materi, index) => ({
      id: materi.id || index,
      title: materi.title,
      description: materi.description,
      order: index + 1,
      isDemo: materi.isDemo,
      createdAt: new Date(),
    })),
    liveSessions: [],
    vocabularySets: vocabSets.map((set, index) => ({
      id: set.id || index,
      title: set.title,
      description: set.description || null,
      icon: null,
      _count: { items: set.items?.length || 0 },
    })),
    posts: [],
    _count: {
      members: 0,
      materis: materis.length,
      liveSessions: 0,
      vocabularySets: vocabSets.length,
      posts: 0,
    },
  };

  return (
    <div className="space-y-6">
    
    
      {!isReadyToPublish && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Please complete all requirements before proceeding to publish.</p>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{materis.length}</div>
              <div className="text-sm text-muted-foreground">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{vocabSets.length}</div>
              <div className="text-sm text-muted-foreground">Vocabulary Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{soalSets.length}</div>
              <div className="text-sm text-muted-foreground">Question Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {materis.filter(m => m.isDemo).length}
              </div>
              <div className="text-sm text-muted-foreground">Demo Lessons</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Course Preview
            <Badge variant="secondary" className="ml-auto">How it will look</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="border rounded-lg overflow-hidden max-h-[700px] overflow-y-auto">
            <div className="scale-75 mt-6 origin-top-left" style={{ width: '133.33%' }}>
              <KelasDetailPage kelas={mockKelasData} />
            </div>
          </div>
        </CardContent>
      </Card>




    </div>
  );
}

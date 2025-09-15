"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Rocket,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Share2,
  FileText,
  Eye
} from "lucide-react";
import KelasDetailWrapper from "@/components/kelas/kelas-detail-wrapper";
import { useSession } from "@/lib/hooks/use-session";
import { toast } from "sonner";

export function StepReview() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  const {
    meta,
    materis,
    draftId,
    publishDraft,
    unpublishDraft,
    reset,
    kelasIsDraft,
    stepDirtyFlags,
    saveMeta,
    saveMateris
  } = useKelasBuilderStore();

  const { session } = useSession();

  const hasTitle = meta.title && meta.title.trim() !== '';
  const hasDescription = meta.description && meta.description.trim() !== '';
  const hasContent = materis.length > 0;
  const hasValidPricing = !meta.isPaidClass || (meta.price && meta.price > 0);

  const isReadyToPublish = hasTitle && hasDescription && hasContent && hasValidPricing;

  // Determine if the loaded kelas is already published on the server
  const isPublishedServer = !!draftId && !kelasIsDraft;
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
    vocabularySets: [],
    posts: [],
    _count: {
      members: 0,
      materis: materis.length,
      liveSessions: 0,
      vocabularySets: 0,
      posts: 0,
      kelasKoleksiSoals: 0, // TODO: Add question sets tracking to store
    },
  };

  const handlePublish = async () => {
    if (!draftId) return;

    // Unpublish path (already published and no local changes)
    if (!kelasIsDraft) {
      setIsPublishing(true);
      try {
        await unpublishDraft();
        toast.success('Course reverted to draft');
      } catch (error) {
        console.error('Error unpublishing course:', error);
        toast.error('Failed to unpublish');
      } finally {
        setIsPublishing(false);
      }
      return;
    }

    if (kelasIsDraft && !isReadyToPublish) return;

    setIsPublishing(true);
    try {
      if (kelasIsDraft) {
        await publishDraft();
        setIsPublished(true);
        toast.success('Course published successfully');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // Save changes to existing published course
        if (stepDirtyFlags.meta) {
          await saveMeta();
        }
        if (stepDirtyFlags.content) {
          await saveMateris();
        }
        toast.success('Changes saved');
      }
    } catch (error) {
      console.error('Error publishing/saving course:', error);
      toast.error(
        kelasIsDraft
          ? 'Failed to publish'
          : 'Failed to unpublish'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateNew = () => {
    reset();
    router.push('/dashboard/guru/kelas-builder');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (isPublished) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-600">Course Published Successfully!</h2>
            <p className="text-muted-foreground mt-2">
              Your course {meta.title} is now live and available to students.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Done</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleGoToDashboard}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateNew}
                className="flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" />
                Create New Course
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-semibold">Share Your Course</h4>
              <p className="text-sm text-muted-foreground">
                Share your published course with students and colleagues.
              </p>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Content Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{materis.length}</div>
              <div className="text-sm text-muted-foreground">Lessons</div>
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

      {/* Course Preview */}
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
              <KelasDetailWrapper kelas={mockKelasData} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publish Actions */}
      {isReadyToPublish ? (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Rocket className="h-5 w-5" />
              {isPublishedServer ? 'Ready to Save Changes' : 'Ready to Publish'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your course meets all requirements and is ready to be published.
              </AlertDescription>
            </Alert>
            
            {/* Checklist */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Course Title</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Course Description</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Course Content</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Pricing Configuration</span>
              </div>
            </div>
            
            {/* Prominent Publish Button */}
            <div className="text-center space-y-4">
              <Button
                onClick={handlePublish}
                disabled={
                  isPublishing ||
                  !draftId ||
                  (kelasIsDraft && !isReadyToPublish)
                }
                className="w-full max-w-md mx-auto h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    {kelasIsDraft
                      ? 'Publishing...'
                      : 'Unpublishing...'}
                  </>
                ) : (
                  <>
                    <Rocket className="h-6 w-6 mr-3" />
                    {kelasIsDraft
                      ? 'Publish Course Now'
                      : 'Unpublish Course'}
                    {!draftId && " (No Draft ID)"}
                  </>
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                {kelasIsDraft
                  ? 'This will make your course live and available to students'
                  : (false
                      ? 'This will save your changes to the published course'
                      : 'This will revert the course back to draft (students will lose access)')}
              </p>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button
                variant="ghost"
                onClick={handleGoToDashboard}
                disabled={isPublishing}
                className="text-muted-foreground hover:text-foreground"
              >
                Save as Draft & Return Later
              </Button>
            </div>
            
            {!draftId && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing Draft ID:</strong> You need to create a draft first before publishing.
                  Go back to the Meta step and save your course information.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Not Ready to Publish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                cek lagi apa yang kurang, pastikan semua langkah sudah lengkap:
              </AlertDescription>
            </Alert>
            
            {/* Checklist */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-3">
                {hasTitle ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={hasTitle ? 'text-green-600' : 'text-red-600'}>
                  Course Title
                </span>
              </div>
              <div className="flex items-center gap-3">
                {hasDescription ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={hasDescription ? 'text-green-600' : 'text-red-600'}>
                  Course Description
                </span>
              </div>
              <div className="flex items-center gap-3">
                {hasContent ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={hasContent ? 'text-green-600' : 'text-red-600'}>
                  Course Content
                </span>
              </div>
              <div className="flex items-center gap-3">
                {hasValidPricing ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={hasValidPricing ? 'text-green-600' : 'text-red-600'}>
                  Pricing Configuration
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

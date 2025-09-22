"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { KelasBuilderLayout } from "@/components/kelas-builder/kelas-builder-layout";
import { StepMeta } from "@/components/kelas-builder/steps/step-meta";
import { StepContent } from "@/components/kelas-builder/steps/step-content";
import { StepResources } from "@/components/kelas-builder/steps/step-resources";
import { StepReview } from "@/components/kelas-builder/steps/step-review";
import { AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function KelasBuilderPage() {

  const searchParams = useSearchParams();
  const {
    currentStep,
    isLoading,
    error,
    clearError,
    loadDraft,
    draftId
  } = useKelasBuilderStore();

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && !draftId) {
      const kelasId = parseInt(editId, 10);
      if (!isNaN(kelasId)) {
        loadDraft(kelasId);
      }
    }
  
  }, [searchParams, draftId, loadDraft]);

  if (searchParams.get('edit') && !draftId) {
    return (
      <KelasBuilderLayout>
        <div className="space-y-4">
          {/* Basic Information Card Skeleton */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex justify-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-32 text-center" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>

          {/* Pricing Card Skeleton */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg mb-6">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="mt-6 bg-muted/50 rounded-lg p-4">
              <Skeleton className="h-5 w-32 mb-3" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </KelasBuilderLayout>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'meta':
        return <StepMeta />;
      case 'content':
        return <StepContent />;
      case 'resources':
        return <StepResources />;
      case 'review':
        return <StepReview />;
      default:
        return <StepMeta />;
    }
  };

  if (error) {
    return (
      <KelasBuilderLayout>
        <div className="flex items-center justify-center min-h-screen">
          <AlertDialog open={true}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Error Loading Class
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  {error}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => clearError()}>
                  Try Again
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </KelasBuilderLayout>
    );
  }

  return (
    <KelasBuilderLayout>
      {renderCurrentStep()}
    </KelasBuilderLayout>
  );
}

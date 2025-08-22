"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { KelasBuilderLayout } from "@/components/kelas-builder/kelas-builder-layout";
import { StepMeta } from "@/components/kelas-builder/steps/step-meta";
import { StepContent } from "@/components/kelas-builder/steps/step-content";
import { StepVocabulary } from "@/components/kelas-builder/steps/step-vocabulary";
import { StepQuestions } from "@/components/kelas-builder/steps/step-questions";
import { StepReview } from "@/components/kelas-builder/steps/step-review";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'meta':
        return <StepMeta />;
      case 'content':
        return <StepContent />;
      case 'vocabulary':
        return <StepVocabulary />;
      case 'questions':
        return <StepQuestions />;
      case 'review':
        return <StepReview />;
      default:
        return <StepMeta />;
    }
  };

  if (isLoading) {
    return (
      <KelasBuilderLayout>
        {/* Minimalist loading overlay */}
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-background/80 border border-border rounded-lg p-6 shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
        {renderCurrentStep()}
      </KelasBuilderLayout>
    );
  }

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

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { KelasBuilderLayout } from "@/components/kelas-builder/kelas-builder-layout";
import { StepMeta } from "@/components/kelas-builder/steps/step-meta";
import { StepContent } from "@/components/kelas-builder/steps/step-content";
import { StepVocabulary } from "@/components/kelas-builder/steps/step-vocabulary";
import { StepAssessment } from "@/components/kelas-builder/steps/step-assessment";
import { StepReview } from "@/components/kelas-builder/steps/step-review";
import { StepPublish } from "@/components/kelas-builder/steps/step-publish";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

export default function KelasBuilderPage() {
  const router = useRouter();
  const { 
    currentStep, 
    isLoading, 
    error, 
    draftId, 
    reset, 
    clearError 
  } = useKelasBuilderStore();

  // Remove the problematic useEffect that was resetting data during navigation
  // The store should persist data between navigation steps

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'meta':
        return <StepMeta />;
      case 'content':
        return <StepContent />;
      case 'vocabulary':
        return <StepVocabulary />;
      case 'assessment':
        return <StepAssessment />;
      case 'review':
        return <StepReview />;
      case 'publish':
        return <StepPublish />;
      default:
        return <StepMeta />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading kelas builder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => clearError()} 
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/guru')} 
                variant="outline"
                size="sm"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <KelasBuilderLayout>
      {renderCurrentStep()}
    </KelasBuilderLayout>
  );
}

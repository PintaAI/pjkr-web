"use client";

import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  BookOpen,
  FileText,
  MessageSquare,
  ClipboardList,
  Rocket,
  Clock,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KelasBuilderLayoutProps {
  children: React.ReactNode;
}
// Define the steps for the Kelas Builder
const steps = [
  {
    id: 'meta',
    title: 'Info Dasar Kelas',
    description: 'Judul Kelas, deskripsi, dan pengaturan',
    icon: BookOpen,
  },
  {
    id: 'content',
    title: 'Materi Pembelajaran',
    description: 'Tambahkan modul atau materi pembelajaran',
    icon: FileText,
  },
  {
    id: 'vocabulary',
    title: 'Kosa-kata',
    description: 'Tambahkan set kosakata (opsional)',
    icon: MessageSquare,
  },
  {
    id: 'assessment',
    title: 'Paket Soal',
    description: 'tambahkan pake soal (opsional)',
    icon: ClipboardList,
  },
  {
    id: 'review',
    title: 'Tinjau & Publikasikan',
    description: 'Tinjau dan publikasikan kursus',
    icon: Rocket,
  },
];

export function KelasBuilderLayout({ children }: KelasBuilderLayoutProps) {
  const {
    currentStep,
    isDirty,
    isLoading,
    error,
    draftId,
    meta,
    materis,
    vocabSets,
    stepDirtyFlags,
    setCurrentStep,
    nextStep,
    prevStep,
    saveMeta,
    saveMateris,
    saveVocabularySet,
    saveAllAssessments,
    calculateOverallProgress,
    clearError,
    reset
  } = useKelasBuilderStore();

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = calculateOverallProgress();



  const getStepCompletionStatus = (stepId: string) => {
    // Check if this is a fresh/new session (no title and no existing materials)
    const isFirstTime = !meta.title.trim() && materis.length === 0 && !draftId;
    
    switch (stepId) {
      case 'meta':
        const hasTitle = meta.title.trim() !== '';
        const hasDescription = meta.description && meta.description.trim() !== '';
        const hasLevel = meta.level;
        const hasType = meta.type;
        
        if (hasTitle && hasDescription && hasLevel && hasType) {
          return { hasRequiredData: true, message: 'All required info provided' };
        } else if (hasTitle) {
          return { hasRequiredData: false, message: 'Missing description or settings' };
        } else if (isFirstTime) {
          return { hasRequiredData: true, message: 'Start by adding your course title and description' };
        } else {
          return { hasRequiredData: false, message: 'Title required' };
        }
        
      case 'content':
        if (materis.length > 0) {
          return { hasRequiredData: true, message: `${materis.length} lesson(s) added` };
        } else if (isFirstTime) {
          return { hasRequiredData: true, message: 'Add lessons and learning materials' };
        } else {
          return { hasRequiredData: false, message: 'At least 1 lesson required' };
        }
        
      case 'vocabulary':
        // Optional step
        return { hasRequiredData: true, message: 'Optional: Add vocabulary sets to enhance learning' };
        
      case 'assessment':
        // Optional step
        return { hasRequiredData: true, message: 'Optional: Link question sets for assessments' };
        
      case 'review':
        const metaComplete = meta.title.trim() !== '' && meta.description;
        const contentComplete = materis.length > 0;
        
        if (metaComplete && contentComplete) {
          return { hasRequiredData: true, message: 'Ready to review and publish' };
        } else if (isFirstTime) {
          return { hasRequiredData: true, message: 'Review and publish your course to make it available to students' };
        } else {
          return { hasRequiredData: false, message: 'Complete required steps first' };
        }
        
      default:
        return { hasRequiredData: true, message: '' };
    }
  };

  const saveAllUnsavedContent = async () => {
    // Save unsaved materis
    if (materis.some(m => m.tempId)) {
      await saveMateris();
    }
    if (stepDirtyFlags.vocabulary) {
      // Save all vocabulary sets
      console.log('Saving vocabulary sets...');
      // This would need to be implemented in the store to save all vocabulary sets
      // For now, we'll save individual sets when they're edited
    }
    // Save unsaved assessments
    if (stepDirtyFlags.assessment) {
      await saveAllAssessments();
    }
  };

  const saveAllVocabularySets = async () => {
    if (!vocabSets.length) return;
    
    console.log('💾 [AUTO-SAVE] Saving all vocabulary sets...');
    
    let hasChanges = false;
    for (let i = 0; i < vocabSets.length; i++) {
      if (vocabSets[i].tempId || stepDirtyFlags.vocabulary) {
        console.log(`📝 [AUTO-SAVE] Saving vocabulary set ${i}: ${vocabSets[i].title}`);
        await saveVocabularySet(i);
        hasChanges = true;
      }
    }
    
    // Clear dirty flag after successful save
    if (hasChanges) {
      console.log('✅ [AUTO-SAVE] All vocabulary sets saved successfully');
      // The dirty flags are cleared by the individual saveVocabularySet calls in the store
    }
  };

  const handleSave = async () => {
    try {
      switch (currentStep) {
        case 'meta':
          await saveMeta();
          break;
        case 'content':
          await saveMateris();
          break;
        case 'vocabulary':
          await saveAllVocabularySets();
          break;
        case 'assessment':
          await saveAllAssessments();
          break;
        case 'review':
          await saveAllUnsavedContent();
          break;
      }
    } catch {
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Navigation Row */}
          <div className="flex items-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset();
                window.location.href = '/dashboard/guru/classes';
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Classes
            </Button>
          </div>

          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Kelas Builder</h1>
              <p className="text-muted-foreground">
                Bikin kelas dan materi pembelajaran yang menarik untuk siswa
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Belum di simpan
                </Badge>
              )}
              {stepDirtyFlags[currentStep as keyof typeof stepDirtyFlags] && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearError()}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Buat Kelas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {steps.map((step) => {
                  const completion = getStepCompletionStatus(step.id);
                  const Icon = step.icon;
                  const stepIsDirty = stepDirtyFlags[step.id as keyof typeof stepDirtyFlags];
                  const isCurrent = step.id === currentStep;
                  
                  return (
                    <Tooltip key={step.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={async () => await setCurrentStep(step.id as any)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border-2 transition-all duration-200 group hover:shadow-md",
                            isCurrent
                              ? "border-primary bg-primary/10 dark:bg-primary/20"
                              : "border-muted bg-muted/30 hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Step Icon */}
                            <div className={cn(
                              "flex items-center justify-center w-10 h-10 rounded-full",
                              isCurrent
                                ? "bg-primary/20 text-primary dark:bg-primary/30"
                                : "bg-muted/50 text-muted-foreground"
                            )}>
                              <Icon className="h-5 w-5" />
                            </div>
                            
                            {/* Step Content */}
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "font-semibold text-sm",
                                isCurrent ? "text-primary" : "text-muted-foreground"
                              )}>
                                {step.title}
                                {!completion.hasRequiredData && (
                                  <span className="ml-1 text-orange-500">*</span>
                                )}
                              </div>
                              <div className={cn(
                                "text-xs mt-1 leading-tight",
                                isCurrent ? "text-primary/70 dark:text-primary/80" : "text-muted-foreground/70"
                              )}>
                                {step.description}
                              </div>
                            </div>
                            
                            {/* Status Indicator */}
                            {isCurrent && (
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full animate-pulse",
                                  stepIsDirty
                                    ? "bg-orange-500"
                                    : "bg-primary"
                                )}
                              />
                            )}
                            {stepIsDirty && !isCurrent && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      {completion.message && (
                        <TooltipContent
                          side="right"
                          className="max-w-xs border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                          arrowClassName="bg-gray-50 fill-gray-50 dark:bg-gray-950 dark:fill-gray-950"
                        >
                          <p className="text-sm">
                            {completion.message}
                            {stepIsDirty && (
                              <span className="block text-orange-600 text-xs mt-1">• Has unsaved changes</span>
                            )}
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 mb-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="flex items-center gap-2 hover:bg-muted/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex flex-row items-center gap-2 px-4 py-2 bg-white/80 dark:bg-muted/80 backdrop-blur-sm rounded-lg border border-primary/20 shadow-sm">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const currentStepData = steps.find(s => s.id === currentStep);
                      const Icon = currentStepData?.icon || BookOpen;
                      return (
                        <Icon className="h-6 w-6 text-primary" />
                      );
                    })()}
                  </div>
                  <div className="flex flex-col items-start gap-0">
                    <span className="text-base font-medium text-primary">
                      {steps.find(s => s.id === currentStep)?.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {steps.find(s => s.id === currentStep)?.description}
                    </span>
                  </div>
                </div>

                {/* Hide next button on review step since it's last step */}
                {currentStep !== 'review' ? (
                  <Button
                    size="sm"
                    onClick={async () => await nextStep()}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="w-[88px]" />
                )}
              </div>
            </div>

            <Card >
              <CardContent>
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
      </TooltipProvider>
  );
}

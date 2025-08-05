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
  Eye, 
  Rocket,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  MinusCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KelasBuilderLayoutProps {
  children: React.ReactNode;
}

const steps = [
  {
    id: 'meta',
    title: 'Basic Info',
    description: 'Course title, description, and settings',
    icon: BookOpen,
  },
  {
    id: 'content',
    title: 'Content',
    description: 'Add lessons and learning materials',
    icon: FileText,
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    description: 'Add vocabulary sets (optional)',
    icon: MessageSquare,
  },
  {
    id: 'assessment',
    title: 'Assessment',
    description: 'Link question sets (optional)',
    icon: ClipboardList,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and finalize your course',
    icon: Eye,
  },
  {
    id: 'publish',
    title: 'Publish',
    description: 'Publish your course to make it live',
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
    koleksiSoals,
    setCurrentStep,
    nextStep,
    prevStep,
    saveMeta,
    saveMateris,
    saveKoleksiSoal,
    saveAllAssessments,
    clearError,
    reset
  } = useKelasBuilderStore();

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canGoNext = () => {
    switch (currentStep) {
      case 'meta':
        return meta.title.trim() !== '' && meta.description;
      case 'content':
        return materis.length > 0;
      case 'vocabulary':
      case 'assessment':
        return true; // Optional steps
      case 'review':
        return true;
      case 'publish':
        return false; // Last step
      default:
        return true;
    }
  };

  const canGoPrev = () => {
    return currentStepIndex > 0;
  };

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

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
          return { status: 'complete', hasRequiredData: true, message: 'All required info provided' };
        } else if (hasTitle) {
          return { status: 'partial', hasRequiredData: false, message: 'Missing description or settings' };
        } else if (isFirstTime) {
          return { status: 'neutral', hasRequiredData: true, message: 'Start by adding your course title and description' };
        } else {
          return { status: 'empty', hasRequiredData: false, message: 'Title required' };
        }
        
      case 'content':
        if (materis.length > 0) {
          return { status: 'complete', hasRequiredData: true, message: `${materis.length} lesson(s) added` };
        } else if (isFirstTime) {
          return { status: 'neutral', hasRequiredData: true, message: 'Add lessons and learning materials' };
        } else {
          return { status: 'empty', hasRequiredData: false, message: 'At least 1 lesson required' };
        }
        
      case 'vocabulary':
        // Optional step
        return { status: 'optional', hasRequiredData: true, message: 'Optional: Add vocabulary sets to enhance learning' };
        
      case 'assessment':
        // Optional step
        return { status: 'optional', hasRequiredData: true, message: 'Optional: Link question sets for assessments' };
        
      case 'review':
        const metaComplete = meta.title.trim() !== '' && meta.description;
        const contentComplete = materis.length > 0;
        
        if (metaComplete && contentComplete) {
          return { status: 'complete', hasRequiredData: true, message: 'Ready for review' };
        } else if (isFirstTime) {
          return { status: 'neutral', hasRequiredData: true, message: 'Review and finalize your course before publishing' };
        } else {
          return { status: 'blocked', hasRequiredData: false, message: 'Complete previous steps first' };
        }
        
      case 'publish':
        const allRequired = meta.title.trim() !== '' && meta.description && materis.length > 0;
        
        if (allRequired) {
          return { status: 'complete', hasRequiredData: true, message: 'Ready to publish' };
        } else if (isFirstTime) {
          return { status: 'neutral', hasRequiredData: true, message: 'Publish your course to make it available to students' };
        } else {
          return { status: 'blocked', hasRequiredData: false, message: 'Complete required steps first' };
        }
        
      default:
        return { status: 'upcoming', hasRequiredData: true, message: '' };
    }
  };

  const saveAllUnsavedContent = async () => {
    console.log('🔄 [AUTO-SAVE TRIGGER] saveAllUnsavedContent called for critical step transition');
    
    let hasSaved = false;
    
    // Save unsaved materis
    if (materis.some(m => m.tempId)) {
      console.log('📝 [AUTO-SAVE] Saving unsaved materis before critical step...');
      await saveMateris();
      hasSaved = true;
    }
    // Save unsaved assessments
    if (koleksiSoals.some(k => k.tempId)) {
      console.log('📝 [AUTO-SAVE] Saving unsaved assessments before critical step...');
      await saveAllAssessments();
      hasSaved = true;
    }
    
    if (hasSaved) {
      console.log('✅ [AUTO-SAVE] All unsaved content saved before critical step');
    } else {
      console.log('ℹ️ [AUTO-SAVE] No unsaved content to save before critical step');
    }
  };

  const handleSave = async () => {
    console.log('💾 [MANUAL SAVE TRIGGER] handleSave called:', {
      step: currentStep,
      isDirty: isDirty,
      draftId: draftId,
      hasUnsavedMateris: materis.some(m => m.tempId),
      hasUnsavedAssessments: koleksiSoals.some(k => k.tempId)
    });
    
    try {
      switch (currentStep) {
        case 'meta':
          console.log('📝 [MANUAL SAVE] Saving meta data...');
          await saveMeta();
          console.log('✅ [MANUAL SAVE] Meta data saved successfully');
          break;
        case 'content':
          console.log('📝 [MANUAL SAVE] Saving content/materis...');
          await saveMateris();
          console.log('✅ [MANUAL SAVE] Content saved successfully');
          break;
        case 'assessment':
          console.log('📝 [MANUAL SAVE] Saving assessments...');
          await saveAllAssessments();
          console.log('✅ [MANUAL SAVE] Assessments saved successfully');
          break;
        case 'review':
        case 'publish':
          console.log('📝 [MANUAL SAVE] Saving all unsaved content for review/publish...');
          await saveAllUnsavedContent();
          console.log('✅ [MANUAL SAVE] All content saved successfully');
          break;
      }
    } catch (error) {
      console.error('❌ [MANUAL SAVE] Save error:', error);
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
              <h1 className="text-3xl font-bold tracking-tight">Course Builder</h1>
              <p className="text-muted-foreground">
                Create and manage your educational content
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Unsaved changes
                </Badge>
              )}
              {draftId && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Draft #{draftId}
                </Badge>
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
                  Course Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {steps.map((step) => {
                  const status = getStepStatus(step.id);
                  const completion = getStepCompletionStatus(step.id);
                  const Icon = step.icon;
                  
                  // Determine colors based on completion status
                  let borderColor, bgColor, textColor, iconColor, statusIcon;
                  
                  if (status === 'current') {
                    borderColor = "border-primary";
                    bgColor = "bg-primary/10 dark:bg-primary/20";
                    textColor = "text-primary";
                    iconColor = "bg-primary/20 text-primary dark:bg-primary/30";
                    
                    if (!completion.hasRequiredData) {
                      statusIcon = <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />;
                    } else {
                      statusIcon = <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />;
                    }
                  } else if (status === 'completed') {
                    if (completion.status === 'complete') {
                      borderColor = "border-green-500 dark:border-green-400";
                      bgColor = "bg-green-50 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-950/70";
                      textColor = "text-green-700 dark:text-green-300";
                      iconColor = "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400";
                      statusIcon = <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
                    } else if (completion.status === 'partial') {
                      borderColor = "border-yellow-500 dark:border-yellow-400";
                      bgColor = "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/50 dark:hover:bg-yellow-950/70";
                      textColor = "text-yellow-700 dark:text-yellow-300";
                      iconColor = "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400";
                      statusIcon = <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
                    } else if (completion.status === 'optional') {
                      borderColor = "border-blue-500 dark:border-blue-400";
                      bgColor = "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-950/70";
                      textColor = "text-blue-700 dark:text-blue-300";
                      iconColor = "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400";
                      statusIcon = <MinusCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
                    } else if (completion.status === 'neutral') {
                      borderColor = "border-muted";
                      bgColor = "bg-muted/30 hover:bg-muted/50";
                      textColor = "text-muted-foreground";
                      iconColor = "bg-muted/50 text-muted-foreground";
                      statusIcon = null;
                    } else {
                      borderColor = "border-gray-400 dark:border-gray-500";
                      bgColor = "bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-900/70";
                      textColor = "text-gray-700 dark:text-gray-300";
                      iconColor = "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400";
                      statusIcon = <XCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
                    }
                  } else {
                    // Upcoming
                    if (completion.status === 'blocked') {
                      borderColor = "border-red-300 dark:border-red-600";
                      bgColor = "bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-950/70";
                      textColor = "text-red-600 dark:text-red-400";
                      iconColor = "bg-red-100 text-red-500 dark:bg-red-900/50 dark:text-red-400";
                      statusIcon = <XCircle className="h-4 w-4 text-red-400 dark:text-red-500" />;
                    } else if (completion.status === 'optional') {
                      borderColor = "border-blue-300 dark:border-blue-600";
                      bgColor = "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-950/70";
                      textColor = "text-blue-600 dark:text-blue-400";
                      iconColor = "bg-blue-100 text-blue-500 dark:bg-blue-900/50 dark:text-blue-400";
                      statusIcon = <MinusCircle className="h-4 w-4 text-blue-400 dark:text-blue-500" />;
                    } else if (completion.status === 'neutral') {
                      borderColor = "border-muted";
                      bgColor = "bg-muted/30 hover:bg-muted/50";
                      textColor = "text-muted-foreground";
                      iconColor = "bg-muted/50 text-muted-foreground";
                      statusIcon = null;
                    } else {
                      borderColor = "border-muted";
                      bgColor = "bg-muted/30 hover:bg-muted/50";
                      textColor = "text-muted-foreground";
                      iconColor = "bg-muted/50 text-muted-foreground";
                      statusIcon = null;
                    }
                  }
                  
                  return (
                    <Tooltip key={step.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={async () => await setCurrentStep(step.id as any)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border-2 transition-all duration-200 group hover:shadow-md",
                            borderColor,
                            bgColor
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Step Icon */}
                            <div className={cn(
                              "flex items-center justify-center w-10 h-10 rounded-full",
                              iconColor
                            )}>
                              <Icon className="h-5 w-5" />
                            </div>
                            
                            {/* Step Content */}
                            <div className="flex-1 min-w-0">
                              <div className={cn("font-semibold text-sm", textColor)}>
                                {step.title}
                                {!completion.hasRequiredData && status !== 'upcoming' && (
                                  <span className="ml-1 text-orange-500">*</span>
                                )}
                              </div>
                              <div className={cn(
                                "text-xs mt-1 leading-tight",
                                status === 'current' && "text-primary/70 dark:text-primary/80",
                                status === 'completed' && completion.status === 'complete' && "text-green-600/70 dark:text-green-400/80",
                                status === 'completed' && completion.status === 'partial' && "text-yellow-600/70 dark:text-yellow-400/80",
                                status === 'completed' && completion.status === 'optional' && "text-blue-600/70 dark:text-blue-400/80",
                                status === 'upcoming' && completion.status === 'blocked' && "text-red-500/70 dark:text-red-400/80",
                                status === 'upcoming' && completion.status === 'optional' && "text-blue-500/70 dark:text-blue-400/80",
                                status === 'upcoming' && completion.status === 'upcoming' && "text-muted-foreground/70"
                              )}>
                                {step.description}
                              </div>
                            </div>
                            
                            {/* Status Indicator */}
                            {statusIcon && (
                              <div className="flex-shrink-0">
                                {statusIcon}
                              </div>
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      {completion.message && (
                        <TooltipContent 
                          side="right" 
                          className={cn(
                            "max-w-xs",
                            completion.status === 'complete' && "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
                            completion.status === 'partial' && "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
                            completion.status === 'optional' && "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
                            completion.status === 'blocked' && "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
                            completion.status === 'empty' && "border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                          )}
                          arrowClassName={cn(
                            completion.status === 'complete' && "bg-green-50 fill-green-50 dark:bg-green-950 dark:fill-green-950",
                            completion.status === 'partial' && "bg-yellow-50 fill-yellow-50 dark:bg-yellow-950 dark:fill-yellow-950",
                            completion.status === 'optional' && "bg-blue-50 fill-blue-50 dark:bg-blue-950 dark:fill-blue-950",
                            completion.status === 'blocked' && "bg-red-50 fill-red-50 dark:bg-red-950 dark:fill-red-950",
                            completion.status === 'empty' && "bg-gray-50 fill-gray-50 dark:bg-gray-950 dark:fill-gray-950"
                          )}
                        >
                          <p className="text-sm">{completion.message}</p>
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {(() => {
                        const currentStepData = steps.find(s => s.id === currentStep);
                        const Icon = currentStepData?.icon || BookOpen;
                        return (
                          <>
                            <Icon className="h-5 w-5" />
                            {currentStepData?.title}
                          </>
                        );
                      })()}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {steps.find(s => s.id === currentStep)?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDirty && (
                      <Button
                        variant="outline"
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
              </CardHeader>
              <CardContent>
                {children}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={!canGoPrev() || isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>

              {/* Hide next button on publish step since it's the last step */}
              {currentStep !== 'publish' && (
                <Button
                  onClick={async () => await nextStep()}
                  disabled={!canGoNext() || isLoading}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              
              {/* Add invisible spacer when next button is hidden to maintain layout */}
              {currentStep === 'publish' && (
                <div className="w-[88px]" /> 
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      </TooltipProvider>
  );
}

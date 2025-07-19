"use client";

import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  AlertCircle
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
    setCurrentStep,
    nextStep,
    prevStep,
    saveMeta,
    saveMateris,
    clearError
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

  const handleSave = async () => {
    try {
      switch (currentStep) {
        case 'meta':
          await saveMeta();
          break;
        case 'content':
          await saveMateris();
          break;
        // Add more save handlers as needed
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
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
                  const Icon = step.icon;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id as any)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border-2 transition-all duration-200 group hover:shadow-md",
                        status === 'current' && "border-primary bg-primary/10 shadow-sm",
                        status === 'completed' && "border-green-500 bg-green-50 hover:bg-green-100",
                        status === 'upcoming' && "border-muted bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Step Icon */}
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full",
                          status === 'current' && "bg-primary/20 text-primary",
                          status === 'completed' && "bg-green-100 text-green-600",
                          status === 'upcoming' && "bg-muted/50 text-muted-foreground"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-semibold text-sm",
                            status === 'current' && "text-primary",
                            status === 'completed' && "text-green-700",
                            status === 'upcoming' && "text-muted-foreground"
                          )}>
                            {step.title}
                          </div>
                          <div className={cn(
                            "text-xs mt-1 leading-tight",
                            status === 'current' && "text-primary/70",
                            status === 'completed' && "text-green-600/70",
                            status === 'upcoming' && "text-muted-foreground/70"
                          )}>
                            {step.description}
                          </div>
                        </div>
                        
                        {/* Status Indicator */}
                        {status === 'completed' && (
                          <div className="flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                        {status === 'current' && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    </button>
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

              <Button
                onClick={nextStep}
                disabled={!canGoNext() || isLoading}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

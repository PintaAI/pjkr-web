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
  Share2
} from "lucide-react";

export function StepPublish() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  const { 
    meta, 
    materis, 
    vocabSets, 
    soalSets, 
    draftId,
    publishDraft,
    reset
  } = useKelasBuilderStore();

  const hasTitle = meta.title && meta.title.trim() !== '';
  const hasDescription = meta.description && meta.description.trim() !== '';
  const hasContent = materis.length > 0;
  const hasValidPricing = !meta.isPaidClass || (meta.price && meta.price > 0);

  const isReadyToPublish = hasTitle && hasDescription && hasContent && hasValidPricing;

  const handlePublish = async () => {
    if (!isReadyToPublish || !draftId) return;

    setIsPublishing(true);
    try {
      await publishDraft();
      setIsPublished(true);
      
      // Navigate to dashboard after successful publish
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000); // Wait 2 seconds to show success message
    } catch (error) {
      console.error('Error publishing course:', error);
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
              Your course &quot;{meta.title}&quot; is now live and available to students.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
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
    <div className="space-y-6">
   


      {/* Publishing Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pre-publish Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {hasTitle ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={hasTitle ? 'text-green-600' : 'text-red-600'}>
                Course title is set
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {hasDescription ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={hasDescription ? 'text-green-600' : 'text-red-600'}>
                Course description is set
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {hasContent ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={hasContent ? 'text-green-600' : 'text-red-600'}>
                At least one lesson is added
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {hasValidPricing ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={hasValidPricing ? 'text-green-600' : 'text-red-600'}>
                Pricing is configured correctly
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Course Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Title</h4>
              <p className="text-sm text-muted-foreground">{meta.title}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Type & Level</h4>
              <div className="flex gap-2">
                <Badge variant="outline">{meta.type}</Badge>
                <Badge variant="secondary">{meta.level}</Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
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

      {/* Publish Actions */}
      {isReadyToPublish ? (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Rocket className="h-5 w-5" />
              Ready to Publish
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your course meets all requirements and is ready to be published. Once published, students will be able to enroll and access your content.
              </AlertDescription>
            </Alert>
            
            {/* Prominent Publish Button */}
            <div className="text-center space-y-4">
              <Button 
                onClick={handlePublish}
                disabled={isPublishing || !draftId}
                className="w-full max-w-md mx-auto h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    Publishing Your Course...
                  </>
                ) : (
                  <>
                    <Rocket className="h-6 w-6 mr-3" />
                    Publish Course Now
                    {!draftId && " (No Draft ID)"}
                  </>
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                This will make your course live and available to students
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
                Your course doesn&apos;t meet all the requirements for publishing. Please go back and complete the missing requirements.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

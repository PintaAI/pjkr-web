"use client";

import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  FileText, 
  CheckCircle,
  AlertCircle,
  DollarSign
} from "lucide-react";

export function StepReview() {
  const { 
    meta, 
    materis, 
    vocabSets, 
    soalSets 
  } = useKelasBuilderStore();

  const hasTitle = meta.title && meta.title.trim() !== '';
  const hasDescription = meta.description && meta.description.trim() !== '';
  const hasContent = materis.length > 0;
  const hasValidPricing = !meta.isPaidClass || (meta.price && meta.price > 0);

  const isReadyToPublish = hasTitle && hasDescription && hasContent && hasValidPricing;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Review Your Course</h2>
        <p className="text-muted-foreground">
          Review all the information and content before publishing your course.
        </p>
      </div>

      {/* Course Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Title</h4>
              <p className="text-sm text-muted-foreground">
                {meta.title || 'No title set'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Type & Level</h4>
              <div className="flex gap-2">
                <Badge variant="outline">{meta.type}</Badge>
                <Badge variant={
                  meta.level === 'BEGINNER' ? 'default' :
                  meta.level === 'INTERMEDIATE' ? 'secondary' :
                  'destructive'
                }>
                  {meta.level}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {meta.description || 'No description set'}
            </p>
          </div>

          {meta.isPaidClass && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </h4>
              <div className="flex gap-4 text-sm">
                <span>Price: ${meta.price || 0}</span>
                {meta.discount && <span>Discount: {meta.discount}%</span>}
                {meta.promoCode && <span>Promo: {meta.promoCode}</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Summary */}
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

      {/* Lessons List */}
      {materis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {materis.map((materi, index) => (
                <div key={materi.tempId || materi.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      {index + 1}.
                    </div>
                    <div>
                      <div className="font-medium">{materi.title}</div>
                      <div className="text-sm text-muted-foreground">{materi.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {materi.isDemo && <Badge variant="secondary">Demo</Badge>}
                    {materi.tempId && <Badge variant="outline">Unsaved</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Readiness Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Publishing Readiness
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

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isReadyToPublish ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Ready to publish</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-600">Not ready to publish</span>
                </>
              )}
            </div>
            
            {isReadyToPublish && (
              <Badge variant="default">All requirements met</Badge>
            )}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}

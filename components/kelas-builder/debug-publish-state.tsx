"use client";

import { useKelasBuilderStore } from "@/lib/stores/kelas-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Plus } from "lucide-react";

export function DebugPublishState() {
  const { 
    meta, 
    materis, 
    vocabSets, 
    soalSets, 
    draftId,
    currentStep,
    isLoading,
    error,
    createDraft
  } = useKelasBuilderStore();

  const hasTitle = meta.title && meta.title.trim() !== '';
  const hasDescription = meta.description && meta.description.trim() !== '';
  const hasContent = materis.length > 0;
  const hasValidPricing = !meta.isPaidClass || (meta.price && meta.price > 0);
  const isReadyToPublish = hasTitle && hasDescription && hasContent && hasValidPricing;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">🐛 Debug: Publish State</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Store State</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono">draftId:</span>
                <Badge variant={draftId ? "default" : "destructive"}>
                  {draftId || "null"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">currentStep:</span>
                <Badge variant="outline">{currentStep}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">isLoading:</span>
                <Badge variant={isLoading ? "secondary" : "outline"}>
                  {isLoading.toString()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">error:</span>
                <Badge variant={error ? "destructive" : "outline"}>
                  {error || "null"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Content Counts</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-mono">materis:</span>
                <Badge variant="outline">{materis.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">vocabSets:</span>
                <Badge variant="outline">{vocabSets.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">soalSets:</span>
                <Badge variant="outline">{soalSets.length}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Publish Requirements</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              {hasTitle ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Title: &quot;{meta.title}&quot;</span>
            </div>
            <div className="flex items-center gap-2">
              {hasDescription ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Description: {meta.description?.length || 0} chars</span>
            </div>
            <div className="flex items-center gap-2">
              {hasContent ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>Content: {materis.length} materis</span>
            </div>
            <div className="flex items-center gap-2">
              {hasValidPricing ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>
                Pricing: {meta.isPaidClass ? `Paid (${meta.price})` : "Free"}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Button State:</span>
              {isReadyToPublish && draftId ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  ✅ Should be clickable
                </Badge>
              ) : (
                <Badge variant="destructive">
                  ❌ Disabled - Missing: {[
                    !hasTitle && "title",
                    !hasDescription && "description", 
                    !hasContent && "content",
                    !hasValidPricing && "pricing",
                    !draftId && "draftId"
                  ].filter(Boolean).join(", ")}
                </Badge>
              )}
            </div>
            {!draftId && hasTitle && (
              <Button
                size="sm"
                onClick={() => createDraft(meta)}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Create Draft Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

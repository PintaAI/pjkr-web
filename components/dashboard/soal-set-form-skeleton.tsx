"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {  Plus, Sparkles } from "lucide-react";

export function SoalSetFormSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Form Header Section */}
        <div className="space-y-6">
          {/* Soal Set Name Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="nama" className="text-lg font-medium text-foreground flex items-center gap-2">
                Soal Set Name
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label htmlFor="isPrivate" className="text-sm text-muted-foreground">Private</Label>
                  <Switch id="isPrivate" disabled className="opacity-50" />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="isDraft" className="text-sm text-muted-foreground">Draft</Label>
                  <Switch id="isDraft" disabled className="opacity-50" />
                </div>
              </div>
            </div>
            <div className="relative">
              <Skeleton className="h-11 w-full rounded-xl absolute inset-0" />
              <Input
                className="h-11 border-0 bg-transparent rounded-xl opacity-0"
                disabled
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <Label htmlFor="deskripsi" className="text-lg font-medium text-foreground">Description</Label>
            <div className="relative">
              <Skeleton className="min-h-[100px] w-full rounded-xl absolute inset-0" />
              <Textarea
                className="min-h-[100px] border-0 bg-transparent rounded-xl opacity-0 resize-none"
                disabled
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Questions</h3>
              <div className="text-sm text-muted-foreground mt-1">
                <Skeleton className="h-4 w-36 inline-block" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                disabled
                variant="outline"
                className="border-border hover:bg-accent shadow-sm transition-all duration-200 opacity-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Question
              </Button>
              <Button
                type="button"
                disabled
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Quick Add Section */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Skeleton className="h-10 w-full rounded-md absolute inset-0" />
              <Input
                placeholder="Type your question here..."
                disabled
                className="border-border focus:border-primary focus:ring-primary/20 opacity-0"
              />
            </div>
            <Button
              disabled
              variant="outline"
              className="border-border hover:bg-accent opacity-50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Question Cards Skeleton */}
          <div className="space-y-3">
            {/* Question Card 1 */}
            <div className="group relative border rounded-xl p-5 bg-primary/10 border-primary/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center text-sm font-semibold shadow-sm border border-border flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-4/5" />
                    
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-xs font-medium bg-card/80 backdrop-blur-sm border-0 px-2 py-1 rounded-md">
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <Skeleton className="h-4 w-12" />
                  </span>
                </div>
              </div>
            </div>

            {/* Question Card 2 */}
            <div className="group relative border rounded-xl p-5 bg-primary/10 border-primary/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center text-sm font-semibold shadow-sm border border-border flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-full" />
                  
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-xs font-medium bg-card/80 backdrop-blur-sm border-0 px-2 py-1 rounded-md">
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <Skeleton className="h-4 w-12" />
                  </span>
                </div>
              </div>
            </div>

            {/* Question Card 3 */}
            <div className="group relative border rounded-xl p-5 bg-primary/10 border-primary/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center text-sm font-semibold shadow-sm border border-border flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-5/6" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-xs font-medium bg-card/80 backdrop-blur-sm border-0 px-2 py-1 rounded-md">
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <Skeleton className="h-4 w-12" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

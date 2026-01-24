"use client";

import { KelasBuilderLayout } from "@/components/kelas-builder/kelas-builder-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsContent, TabsList,} from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Target, 
  FileText, 
  CheckCircle,

} from "lucide-react";

export default function KelasBuilderLoading() {
  return (
    <KelasBuilderLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: BookOpen, label: "Meta" },
                  { icon: FileText, label: "Content" },
                  { icon: Target, label: "Vocabulary" },
                  { icon: Clock, label: "Assessment" },
                  { icon: CheckCircle, label: "Review" }
                ].map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 flex-1" />
                    {index === 0 && <Skeleton className="h-4 w-4 rounded-full" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step-specific content based on current step */}
                <div className="space-y-4">
                  {/* Meta Step Loading */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Textarea className="min-h-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </div>

                  {/* Content Step Loading */}
                  <div className="space-y-4">
                    <Tabs defaultValue="lessons" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-16" />
                      </TabsList>
                      <TabsContent value="lessons" className="space-y-4">
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg p-4 space-y-3">
                              <div className="flex gap-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-5 w-32" />
                              </div>
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Textarea className="min-h-[80px]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Vocabulary Step Loading */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                          <div className="flex gap-3">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-48" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assessment Step Loading */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                          <div className="flex gap-3">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <div className="space-y-2">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-8 w-32" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Step Loading */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-16" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </KelasBuilderLayout>
  );
}

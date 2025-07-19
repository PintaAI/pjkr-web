"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus } from "lucide-react";

export function StepAssessment() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Assessment & Quizzes</h2>
        <p className="text-muted-foreground">
          Link question sets and assessments to your course. This step is optional but helps evaluate student progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Question Sets
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              No question sets linked yet. This is an optional step.
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Link Question Set
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Badge variant="secondary">Optional Step</Badge>
      </div>
    </div>
  );
}

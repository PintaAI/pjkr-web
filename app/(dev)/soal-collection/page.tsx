"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepAssessment } from "@/components/kelas-builder/steps/step-assessment";

export default function SoalCollectionDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Soal Collection System Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This is a demo of the soal (question) collection system integrated into the kelas builder.
            You can create question collections, add questions with multiple choice options, and manage assessments.
          </p>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Features Implemented:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✅ Zustand store with soal collection state management</li>
              <li>✅ Zod validation schemas for questions and options</li>
              <li>✅ Question collection creation and management</li>
              <li>✅ Individual question creation with multiple choice options</li>
              <li>✅ Difficulty levels (Beginner, Intermediate, Advanced)</li>
              <li>✅ Private/Public collection settings</li>
              <li>✅ Draft/Published status</li>
              <li>✅ Real-time validation and preview</li>
              <li>✅ Integrated with existing kelas builder workflow</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-lg p-6">
        <StepAssessment />
      </div>
    </div>
  );
}

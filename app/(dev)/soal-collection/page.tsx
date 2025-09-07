"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SoalCollectionDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Soal Collection System Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This demo page is no longer available as the soal (question) collection system has been removed from the kelas builder.
          </p>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Status:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>❌ Soal collection components have been removed</li>
              <li>❌ Question management features disabled</li>
              <li>✅ Core kelas builder functionality preserved</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

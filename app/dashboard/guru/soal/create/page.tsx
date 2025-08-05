"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SoalCreatePage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Soal Set</CardTitle>
          <CardDescription>Placeholder page. We will iterate on the soal set builder UI and logic here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This is a placeholder for the Soal Set builder. From here, teachers will be able to:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Create a new soal set (title, description, type: latihan/tryout)</li>
            <li>Add questions (multiple choice, short answer, etc.)</li>
            <li>Organize into sections and assign difficulty</li>
            <li>Save as draft or publish for classes</li>
          </ul>

          <div className="pt-4">
            <Link href="/dashboard/guru">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
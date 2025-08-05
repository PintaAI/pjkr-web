"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VocabularyCreatePage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Vocabulary Set</CardTitle>
          <CardDescription>Placeholder page. We will iterate on builder UI and logic here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This is a placeholder for the Vocabulary Set builder. From here, teachers will be able to:
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Create a new vocabulary set with title, description, and tags</li>
            <li>Add vocabulary items (word, reading, meaning, examples)</li>
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
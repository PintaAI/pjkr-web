"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus } from "lucide-react";

export function StepVocabulary() {
  return (
    <div className="space-y-6">
     

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Vocabulary Management
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              No vocabulary sets added yet. This is an optional step.
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Vocabulary Set
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

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function KelasNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mb-6">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary mb-2">Class Not Found</h1>
            <p className="text-muted-foreground">
              The not exist or has been removed.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/kelas">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classes
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/home">
                Go to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

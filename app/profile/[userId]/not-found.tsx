import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserX className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              user tidak ditemukan. Mungkin sudah dihapus atau URL-nya salah.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href="/explore">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse Classes
                </Link>
              </Button>
              <Button asChild>
                <Link href="/profile">
                  My Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { getServerUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await getServerUser();

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view your profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to the dynamic profile route
  redirect(`/profile/${user.id}`);
}
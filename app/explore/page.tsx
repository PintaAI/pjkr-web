import ExplorePage from "@/components/explore/explore-page";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getExploreData } from "@/app/actions/explore";

// Force dynamic rendering since we use server session
export const dynamic = 'force-dynamic';

export default async function Explore() {
    const session = await getServerSession();

    // If user is not authenticated, redirect to landing page
    if (!session?.user) {
      redirect('/');
    }

    const result = await getExploreData();

    if (result.success) {
      return <ExplorePage initialData={result.data} />;
    } else {
      console.error('Error fetching explore data:', result.error);
      return <ExplorePage initialData={[]} />;
    }
}

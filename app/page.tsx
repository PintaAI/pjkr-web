import LandingPage from "@/components/landing-page";
import Homescreen from "@/components/homescreen";
import { getServerSession } from "@/lib/session";

// Force dynamic rendering since we use server session
export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession();
  
  // If user is authenticated, show homescreen
  if (session?.user) {
    return <Homescreen user={session.user} />;
  }
  
  // If not authenticated, show landing page
  return <LandingPage />;
}

import Homescreen from "@/components/homescreen";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

// Force dynamic rendering since we use server session
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession();
  
  // If user is not authenticated, redirect to landing page
  if (!session?.user) {
    redirect('/');
  }
  
  return <Homescreen user={session.user} />;
}

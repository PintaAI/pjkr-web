export const dynamic = 'force-dynamic';

import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing-page";
export default async function Home() {
  const session = await getServerSession();
  
  // If there's a session, redirect to /home
  if (session) {
    redirect("/home");
  }
  
  return <LandingPage />;
}

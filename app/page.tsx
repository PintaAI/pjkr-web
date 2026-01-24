export const dynamic = 'force-dynamic';

import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing-page/landing-page";
export default async function Home() {
  const session = await getServerSession();

  // If there's a session, check role and redirect
  if (session?.user) {
    if (session.user.role === 'GURU' || session.user.role === 'ADMIN') {
      redirect("/dashboard");
    }
    redirect("/home");
  }

  return <LandingPage />;
}

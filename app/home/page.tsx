import Homescreen from "@/components/home/homescreen";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

// Force dynamic rendering since we use server session
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession();
  
  // If user is not authenticated, redirect to landing page
  if (!session?.user) {
    redirect('/');
  }
  
  // Get user with stats from database
  const userWithStats = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      currentStreak: true,
      xp: true,
      level: true,
    }
  });
  
  if (!userWithStats) {
    redirect('/');
  }
  
  return <Homescreen user={userWithStats} />;
}

import LandingPage from "@/components/landing-page";

// Force dynamic rendering since we use server session
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <LandingPage />
  );
}

import { AuthCard } from "../../components/auth-card";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <AuthCard />
      </div>
    </div>
  );
}
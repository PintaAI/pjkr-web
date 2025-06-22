import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "../../components/dashboard/admin-dashboard";
import { GuruDashboard } from "../../components/dashboard/guru-dashboard";

type UserRoles = "GURU" | "MURID" | "ADMIN";


interface DashboardUser {
  id: string;
  email: string;
  name?: string;
  role: UserRoles;
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Session is guaranteed to exist due to middleware protection
  const user = session!.user as DashboardUser;

  // Only allow admin and guru roles access to this dashboard
  if (user.role === "ADMIN") {
    return <AdminDashboard user={user} />;
  } else if (user.role === "GURU") {
    return <GuruDashboard user={user} />;
  }

  // Redirect students to another page (they shouldn't access this dashboard)
  redirect("/");
}

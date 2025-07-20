import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDashboard } from "../../components/dashboard/admin-dashboard";
import { GuruDashboard } from "../../components/dashboard/guru-dashboard";
import { getGuruDashboardData } from "../actions/guru-dashboard";
import { getAdminDashboardData } from "../actions/admin-dashboard";

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
    // Fetch real admin dashboard data
    try {
      const adminData = await getAdminDashboardData();
      return <AdminDashboard user={user} dashboardData={adminData} />;
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error);
      // Fallback to component without data (will show loading or empty state)
      return <AdminDashboard user={user} />;
    }
  } else if (user.role === "GURU") {
    // Fetch real guru dashboard data
    const dashboardResult = await getGuruDashboardData();
    
    if (!dashboardResult.success) {
      // Fallback to empty data if fetch fails
      const emptyData = {
        stats: {
          totalClasses: 0,
          publishedClasses: 0,
          draftClasses: 0,
          totalStudents: 0,
          totalMateris: 0
        },
        recentClasses: [],
        user
      };
      return <GuruDashboard {...emptyData} />;
    }

    return <GuruDashboard 
      stats={dashboardResult.data!.stats}
      recentClasses={dashboardResult.data!.recentClasses}
      user={user}
    />;
  }

  // Redirect students to another page (they shouldn't access this dashboard)
  redirect("/");
}

import { UserManagementPage } from "@/components/admin/user-management/user-management-page";
import { getAllUsers, getUserStats } from "@/app/actions/admin-dashboard";
import { Suspense } from "react";
import Loading from "./loading";

export default async function Page() {
  // Fetch initial data in parallel
  const [initialData, databaseStats] = await Promise.all([
    getAllUsers({ page: 1, limit: 20 }),
    getUserStats(),
  ]);

  const combinedInitialData = {
    ...initialData,
    databaseStats,
  };

  return (
    <Suspense fallback={<Loading />}>
      <UserManagementPage initialData={combinedInitialData} />
    </Suspense>
  );
}

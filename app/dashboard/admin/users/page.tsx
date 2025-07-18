import { UserManagementPage } from "@/components/admin/user-management-page";
import { getAllUsers } from "@/app/actions/admin-actions";

export default async function AdminUsersPage() {
  const initialData = await getAllUsers({
    page: 1,
    limit: 50,
  });

  return <UserManagementPage initialData={initialData} />;
}

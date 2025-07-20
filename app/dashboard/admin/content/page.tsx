import { redirect } from "next/navigation";
import { assertAuthenticated } from "@/lib/auth-actions";
import { getAllClasses, getContentStats } from "@/app/actions/admin-dashboard";
import { ContentManagementPage } from "@/components/admin/content-management-page";

export const metadata = {
  title: "Content Management - Admin Dashboard",
  description: "Manage all classes created by teachers",
};

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; type?: string; level?: string }>;
}) {
  try {
    const session = await assertAuthenticated();
    
    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      redirect("/dashboard");
    }

    // Await searchParams before accessing its properties
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";
    const status = (params.status as "ALL" | "PUBLISHED" | "DRAFT") || "ALL";
    const type = (params.type as "ALL" | "REGULAR" | "EVENT" | "GROUP" | "PRIVATE" | "FUN") || "ALL";
    const level = (params.level as "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED") || "ALL";

    // Fetch classes and stats in parallel
    const [classesResult, stats] = await Promise.all([
      getAllClasses({
        search,
        status,
        type,
        level,
        page,
        limit: 12
      }),
      getContentStats()
    ]);

    return (
      <ContentManagementPage
        initialClasses={classesResult.classes}
        initialStats={stats}
        totalPages={classesResult.totalPages}
        currentPage={classesResult.currentPage}
      />
    );
  } catch (error) {
    console.error("Error loading admin content page:", error);
    redirect("/dashboard");
  }
}

import { getUserKelasList } from "@/app/actions/kelas";
import { GuruClassesPage } from "@/components/dashboard/guru-classes-page";
import { redirect } from "next/navigation";
import { assertAuthenticated } from "@/lib/auth-actions";

export default async function Page() {
  try {
    const session = await assertAuthenticated();
    
    if (session.user.role !== "GURU") {
      redirect("/dashboard");
    }

    const result = await getUserKelasList();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return <GuruClassesPage classes={result.data || []} user={session.user} />;
  } catch (error) {
    console.error("Guru classes page error:", error);
    redirect("/dashboard");
  }
}

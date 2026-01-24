import { getPublishedKelasList, getKelasStats, getJoinedKelasList, getUserKelasList } from "@/app/actions/kelas/public";
import KelasListPage from "@/components/kelas/kelas-list-page";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function KelasPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/");
  }

  let kelasResult;
  if (session.user.role === "MURID") {
    kelasResult = await getJoinedKelasList(session.user.id, { limit: 12, offset: 0 });
  } else if (session.user.role === "GURU") {
    kelasResult = await getUserKelasList(session.user.id, { limit: 12, offset: 0 });
  } else {
    kelasResult = await getPublishedKelasList({ limit: 12, offset: 0 });
  }

  const statsResult = await getKelasStats();

  return (
    <KelasListPage
      initialKelas={kelasResult.data}
      initialStats={statsResult.data}
      initialMeta={kelasResult.meta}
    />
  );
}

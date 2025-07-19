import { getPublishedKelasList, getKelasStats } from "@/app/actions/kelas-public";
import KelasListPage from "@/components/kelas/kelas-list-page";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function KelasPage() {
  // Fetch initial data using server actions
  const [kelasResult, statsResult] = await Promise.all([
    getPublishedKelasList({ limit: 12, offset: 0 }),
    getKelasStats(),
  ]);

  return (
    <KelasListPage
      initialKelas={kelasResult.data}
      initialStats={statsResult.data}
      initialMeta={kelasResult.meta}
    />
  );
}

import { getMateriDetail } from "@/app/actions/kelas/detail";
import MateriDetailPage from "@/components/kelas/materi-detail-page";
import { notFound } from "next/navigation";


// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MateriDetailProps {
  params: Promise<{ id: string; materiId: string }>;
}

export default async function MateriDetail({ params }: MateriDetailProps) {
  const { id, materiId } = await params;
  const result = await getMateriDetail(materiId, id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <MateriDetailPage materi={result.data} />;
}

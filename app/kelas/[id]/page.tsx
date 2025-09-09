import { getKelasDetail } from "@/app/actions/kelas-detail";
import KelasDetailWrapper from "@/components/kelas/kelas-detail-wrapper";
import { notFound } from "next/navigation";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface KelasDetailProps {
  params: Promise<{ id: string }>;
}

export default async function KelasDetail({ params }: KelasDetailProps) {
  const { id } = await params;
  const result = await getKelasDetail(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <KelasDetailWrapper kelas={result.data} />;
}

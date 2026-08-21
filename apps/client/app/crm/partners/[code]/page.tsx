import { CrmPartnerDetail } from "@/components/crm/crm-partner-detail";

interface PartnerPageProps {
  params: Promise<{ code: string }>;
}

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { code } = await params;
  return <CrmPartnerDetail code={code} />;
}

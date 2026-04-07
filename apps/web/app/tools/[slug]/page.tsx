import { notFound } from "next/navigation";
import ToolDetailPage from "@/src/app/pages/ToolDetailPage";
import { fetchDirectory, fetchToolDetail } from "@/src/app/lib/catalog-api";
import { slugifyLabel } from "@/src/app/lib/catalog-utils";

interface ToolDetailRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: ToolDetailRouteProps) {
  const { slug } = await params;
  const tool = await fetchToolDetail(slug);

  if (!tool) {
    notFound();
  }

  const relatedDirectory = await fetchDirectory(`category=${slugifyLabel(tool.category)}&page=1&page_size=4`).catch(() => null);
  const relatedTools = relatedDirectory ? relatedDirectory.items.filter((item) => item.slug !== slug).slice(0, 3) : [];

  return <ToolDetailPage tool={tool} relatedTools={relatedTools} />;
}

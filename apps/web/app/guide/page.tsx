import { redirect } from "next/navigation";
import { withPublicPath } from "@/src/app/lib/public-path";

interface GuideRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : "";
}

export default async function Page({ searchParams }: GuideRouteProps) {
  const params = await searchParams;
  const task = readValue(params.task).trim();
  redirect(
    withPublicPath(
      task
        ? `/tools?mode=ai&q=${encodeURIComponent(task)}&page=1&page_size=24`
        : "/tools?mode=ai&page=1&page_size=24",
    ),
  );
}

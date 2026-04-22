import { permanentRedirect } from "next/navigation";

interface ToolsRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

export default async function Page({ searchParams }: ToolsRouteProps) {
  const params = await searchParams;
  const redirectParams = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(params)) {
    const value = readValue(rawValue);
    if (!value) continue;
    redirectParams.set(key, value);
  }

  permanentRedirect(redirectParams.toString() ? `/?${redirectParams.toString()}` : "/");
}

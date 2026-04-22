"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCatalogReturnLabel, getRememberedCatalogRoute, markCatalogScrollRestore } from "../lib/catalog-navigation";

export default function BackToResultsLink({
  fallbackHref = "/",
  className = "",
}: {
  fallbackHref?: string;
  className?: string;
}) {
  const [href, setHref] = useState(fallbackHref);

  useEffect(() => {
    setHref(getRememberedCatalogRoute(fallbackHref));
  }, [fallbackHref]);

  const label = getCatalogReturnLabel(href);

  return (
    <Link
      href={href}
      onClick={() => markCatalogScrollRestore()}
      className={className}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}

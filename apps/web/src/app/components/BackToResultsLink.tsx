"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getCatalogReturnLabel, getRememberedCatalogRoute, markCatalogScrollRestore } from "../lib/catalog-navigation";
import { withPublicPath } from "../lib/public-path";

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
    <a
      href={withPublicPath(href)}
      onClick={() => markCatalogScrollRestore()}
      className={className}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </a>
  );
}

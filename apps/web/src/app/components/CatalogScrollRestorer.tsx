"use client";

import { useEffect } from "react";
import { restoreCatalogScroll } from "../lib/catalog-navigation";

export default function CatalogScrollRestorer() {
  useEffect(() => {
    restoreCatalogScroll();
  }, []);

  return null;
}

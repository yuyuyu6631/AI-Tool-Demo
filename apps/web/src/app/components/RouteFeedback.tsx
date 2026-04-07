"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const previousPath = useRef(routeKey);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (previousPath.current !== routeKey) {
      previousPath.current = routeKey;
      setIsTransitioning(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      const timer = window.setTimeout(() => {
        setIsTransitioning(false);
      }, 260);

      return () => window.clearTimeout(timer);
    }
  }, [mounted, routeKey]);

  if (!mounted) {
    return null;
  }

  return <div aria-hidden="true" className={`route-feedback ${isTransitioning ? "is-active" : ""}`} />;
}

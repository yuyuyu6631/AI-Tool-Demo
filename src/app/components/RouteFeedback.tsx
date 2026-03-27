import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigation } from "react-router";

export default function RouteFeedback() {
  const location = useLocation();
  const navigation = useNavigation();
  const previousPath = useRef(location.pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      setIsTransitioning(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      const timer = window.setTimeout(() => {
        setIsTransitioning(false);
      }, 260);

      return () => window.clearTimeout(timer);
    }
  }, [location.pathname]);

  const isBusy = navigation.state !== "idle" || isTransitioning;

  return (
    <div
      aria-hidden="true"
      className={`route-feedback ${isBusy ? "is-active" : ""}`}
    />
  );
}

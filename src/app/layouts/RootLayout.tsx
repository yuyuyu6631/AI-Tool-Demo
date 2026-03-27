import { Outlet } from "react-router";
import RouteFeedback from "../components/RouteFeedback";

export default function RootLayout() {
  return (
    <>
      <svg
        aria-hidden="true"
        width="0"
        height="0"
        className="absolute pointer-events-none opacity-0"
      >
        <defs>
          <filter id="glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <RouteFeedback />
      <Outlet />
    </>
  );
}

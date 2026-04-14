import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        lazy: () => import("./pages/HomePage").then((m) => ({ Component: m.default })),
      },
      {
        path: "/rankings",
        lazy: () => import("./pages/RankingsPage").then((m) => ({ Component: m.default })),
      },
      {
        path: "/tools/:slug",
        lazy: () => import("./pages/ToolDetailPage").then((m) => ({ Component: m.default })),
      },
      {
        path: "/scenarios",
        lazy: () => import("./pages/ScenariosPage").then((m) => ({ Component: m.default })),
      },
      {
        path: "/scenarios/:slug",
        lazy: () => import("./pages/ScenarioDetailPage").then((m) => ({ Component: m.default })),
      },
    ],
  },
]);

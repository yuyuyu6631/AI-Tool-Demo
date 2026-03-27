import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";
import RankingsPage from "./pages/RankingsPage";
import ToolDetailPage from "./pages/ToolDetailPage";
import ScenariosPage from "./pages/ScenariosPage";
import ScenarioDetailPage from "./pages/ScenarioDetailPage";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: HomePage,
      },
      {
        path: "/rankings",
        Component: RankingsPage,
      },
      {
        path: "/tools/:slug",
        Component: ToolDetailPage,
      },
      {
        path: "/scenarios",
        Component: ScenariosPage,
      },
      {
        path: "/scenarios/:slug",
        Component: ScenarioDetailPage,
      },
    ],
  },
]);

import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        lazy: async () => {
          const { default: Component } = await import("./pages/HomePage");
          return { Component };
        },
      },
      {
        path: "/rankings",
        lazy: async () => {
          const { default: Component } = await import("./pages/RankingsPage");
          return { Component };
        },
      },
      {
        path: "/tools/:slug",
        lazy: async () => {
          const { default: Component } = await import("./pages/ToolDetailPage");
          return { Component };
        },
      },
      {
        path: "/scenarios",
        lazy: async () => {
          const { default: Component } = await import("./pages/ScenariosPage");
          return { Component };
        },
      },
      {
        path: "/scenarios/:slug",
        lazy: async () => {
          const { default: Component } = await import("./pages/ScenarioDetailPage");
          return { Component };
        },
      },
    ],
  },
]);

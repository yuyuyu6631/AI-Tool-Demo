import { RouterProvider } from "react-router";
import { router } from "./routes";
import "./utils/mockApi";

function App() {
  return <RouterProvider router={router} />;
}

export default App;

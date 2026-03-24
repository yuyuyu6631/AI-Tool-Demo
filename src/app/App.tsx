import { RouterProvider } from "react-router";
import { router } from "./routes";
import "./utils/mockApi"; // 初始化 mock API

function App() {
  return <RouterProvider router={router} />;
}

export default App;
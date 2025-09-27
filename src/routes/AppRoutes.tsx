import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  // (future) { path: "/login", element: <Login /> },
  // (future) { path: "/stories/:id", element: <StoryDetail /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
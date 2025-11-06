import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Me from "../pages/Me";
import StoriesFeed from "../pages/StoriesFeed";
import StoryCreate from "../pages/StoryCreate";
import { ProtectedRoute } from "./ProtectedRoute";
import Layout from "./Layout";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/me", element: <ProtectedRoute><Me /></ProtectedRoute> },
      { path: "/stories", element: <StoriesFeed /> },
      { path: "/stories/new", element: <ProtectedRoute><StoryCreate /></ProtectedRoute> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
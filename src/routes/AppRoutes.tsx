import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Me from "../pages/Me";
import { ProtectedRoute } from "./ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/me", element: <ProtectedRoute><Me /></ProtectedRoute> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
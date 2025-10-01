import AppRoutes from "./routes/AppRoutes";
import './App.css'
import { AuthProvider } from "./state/auth/auth-context";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

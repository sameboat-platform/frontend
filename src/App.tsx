import AppRoutes from "./routes/AppRoutes";
import './App.css'
import { AuthProvider } from "./state/auth/auth-context";
import RuntimeDebugPanel from "./components/RuntimeDebugPanel";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <RuntimeDebugPanel />
    </AuthProvider>
  );
}

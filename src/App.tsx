import AppRoutes from './routes/AppRoutes';
import './App.css';
import { AuthProvider } from './state/auth/auth-context';
import RuntimeDebugPanel from './components/RuntimeDebugPanel';
import { isDev } from './lib/env';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme';

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AuthProvider>
        <AppRoutes />
  {isDev() && <RuntimeDebugPanel />}
      </AuthProvider>
    </ChakraProvider>
  );
}

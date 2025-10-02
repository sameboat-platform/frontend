import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import AppShell from '../components/AppShell';

export default function Layout() {
  return (
    <AppShell>
      <Outlet />
      <Footer />
    </AppShell>
  );
}

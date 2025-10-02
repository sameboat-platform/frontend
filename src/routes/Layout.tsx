import Footer from '../components/Footer';
import AppShell from '../components/AppShell';
import GlobalRouteTransition from '../components/GlobalRouteTransition';

export default function Layout() {
  return (
    <AppShell>
      <GlobalRouteTransition />
      <Footer />
    </AppShell>
  );
}

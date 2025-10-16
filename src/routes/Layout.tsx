import AppShell from '../components/AppShell';
import { GlobalRouteTransition } from '../components/GlobalRouteTransition';

/* Layout component to wrap routes with AppShell and GlobalRouteTransition */
export default function Layout() {
  return (
    <AppShell>
      <GlobalRouteTransition />
    </AppShell>
  );
}

import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

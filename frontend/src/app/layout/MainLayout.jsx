import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';
import DevLoginWidget from '../../shared/components/DevLoginWidget';

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-white">
        <Outlet />
      </main>
      <Footer />
      <DevLoginWidget />
    </div>
  );
};

export default MainLayout;

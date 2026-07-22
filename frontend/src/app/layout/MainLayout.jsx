import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';


const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 bg-white">
        <Outlet />
      </main>
      <Footer />

    </div>
  );
};

export default MainLayout;

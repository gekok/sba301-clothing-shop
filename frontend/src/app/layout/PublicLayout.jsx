import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from '../../shared/components/AppNavbar';

// Layout dùng chung: navbar full-width ở trên + vùng nội dung (Container py-4) cho các trang con.
const PublicLayout = () => {
  return (
    <>
      <AppNavbar />
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
};

export default PublicLayout;

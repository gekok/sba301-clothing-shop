import { Outlet } from 'react-router-dom';
import RoleNav from '../../shared/components/RoleNav';

// Layout khu vực bán hàng (POS) — không dùng Header/Footer storefront vì đây là công cụ vận
// hành nội bộ. Không tự bọc <Container>: POS.jsx đã tự bọc container riêng.
const StaffLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <RoleNav role="STAFF" />
      <main className="flex-grow-1 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;

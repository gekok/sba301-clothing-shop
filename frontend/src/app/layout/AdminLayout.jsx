import { Outlet } from 'react-router-dom';
import RoleNav from '../../shared/components/RoleNav';

// Layout khu vực quản trị (Dashboard, Sản phẩm, Đơn hàng, Nhật ký) — không dùng Header/Footer
// storefront vì đây là công cụ vận hành nội bộ. Không tự bọc <Container>: các trang con đã tự
// bọc container riêng (Dashboard hiện chưa bọc gì, giữ nguyên như hành vi hôm nay).
const AdminLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <RoleNav role="ADMIN" />
      <main className="flex-grow-1 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

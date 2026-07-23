import { Link, NavLink, useNavigate } from 'react-router-dom';
import {useAuth} from '../../app/provider/AuthProvider';
import { getRoleNav, getRoleNavMeta } from '../constants/roleNav';
import '../styles/roleNav.css';

// Thanh nav dùng chung cho khu vực Admin/Staff — tách khỏi Header storefront vì đây là công cụ
// vận hành nội bộ. AdminLayout.jsx/StaffLayout.jsx vẫn là 2 file layout riêng (giữ đúng quyết
// định "4 layout riêng theo role"), chỉ phần khung nav bên trong dùng chung vì mọi khác biệt
// giữa nav Admin/Staff chỉ là hàm của role (nhãn khu vực + danh sách link, cả hai đều lấy từ
// roleNav.js) — không có logic nào rẽ nhánh khác đi.
//
// `role` prop = role của layout đang render (AdminLayout truyền "ADMIN", StaffLayout truyền
// "STAFF") — dùng để hiển thị đúng nhãn khu vực dù chưa có user. Danh sách link vẫn lấy
// theo role THẬT từ useAuth() (không phải prop) để không hiện nhầm menu nếu component này
// sau này được dùng lại ở nơi role thật khác với layout đang đứng.
const RoleNav = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = getRoleNav(user.role);
  const { sectionLabel, ariaLabel } = getRoleNavMeta(role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="role-nav">
      <div className="role-nav__inner">
        <div className="role-nav__brand">
          <span className="role-nav__label">{sectionLabel}</span>
          <Link to="/" className="role-nav__back">
            ← Về cửa hàng
          </Link>
        </div>

        <nav className="role-nav__links" aria-label={ariaLabel}>
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                ['role-nav__link', isActive ? 'is-active' : ''].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="role-nav__account">
          <span className="role-nav__badge">{user?.role}</span>
          <span className="role-nav__email">{user?.email || 'Tài khoản'}</span>
          <button type="button" className="role-nav__logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default RoleNav;

import { Navigate } from 'react-router-dom';
import { getAuthState } from '../utils/auth';

// Chốt chặn tuyến (route guard) theo role — đứng ở cấp route-group, không phải từng trang.
// LƯU Ý: đây chỉ là UX-gate (ẩn/chuyển hướng cho gọn giao diện), KHÔNG PHẢI security boundary
// thật — backend hiện vẫn permitAll toàn bộ API (SecurityConfig.java), ai gọi thẳng API vẫn
// qua được bất kể FE có chặn hay không. Chặn thật sẽ do bạn A thêm hasRole/hasAnyRole ở backend.
//
// Check isAuthenticated TRƯỚC, role SAU: 2 lỗi khác nhau cần redirect khác nhau — chưa đăng
// nhập thì về /login, đăng nhập rồi nhưng sai role thì về / (về /login sẽ gây vòng lặp confuse
// vì user đã có phiên đăng nhập hợp lệ).
const RequireRole = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = getAuthState();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireRole;

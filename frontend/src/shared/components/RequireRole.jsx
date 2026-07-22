import { Navigate } from "react-router-dom";
import { getAuthState } from "../utils/auth.js";

// Chặn FE render trang admin/staff nếu chưa đăng nhập hoặc sai role.
// BE vẫn là lớp chặn thật (SecurityConfig hasAnyRole) — guard này chỉ tránh
// việc render UI admin cho người chưa đủ quyền, không thay thế check ở BE.
export default function RequireRole({ roles, children }) {
  const { isAuthenticated, role } = getAuthState();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

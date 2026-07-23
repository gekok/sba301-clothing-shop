// Nguồn dữ liệu nav-theo-role duy nhất — dùng cho RoleNav.jsx (và RequireRole nếu cần đối
// chiếu). Đợt này STAFF chỉ có POS (chưa có Quản lý đơn hàng — xem plan Staff-scoped-orders,
// hoãn tới khi authen/author hoàn thiện).
const ROLE_NAV = {
  ADMIN: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Quản lý sản phẩm', to: '/admin/products' },
    { label: 'Quản lý đơn hàng', to: '/admin/orders' },
    { label: 'Nhật ký hệ thống', to: '/admin/audit-logs' },
  ],
  STAFF: [
    { label: 'Bán hàng POS', to: '/staff/pos' },
  ],
};

// Nhãn khu vực + aria-label riêng cho từng role — PHẢI đồng bộ key với ROLE_NAV bên trên.
const ROLE_NAV_META = {
  ADMIN: { sectionLabel: 'Quản trị', ariaLabel: 'Điều hướng khu vực quản trị' },
  STAFF: { sectionLabel: 'Bán hàng', ariaLabel: 'Điều hướng khu vực bán hàng' },
};

const KNOWN_ROLES = Object.keys(ROLE_NAV);

// role đọc từ localStorage — người dùng có thể tự set giá trị bất kỳ qua devtools. Check
// KNOWN_ROLES.includes(role) TRƯỚC khi bracket-access ROLE_NAV[role], tránh role='__proto__'/
// 'constructor' lookup trúng Object.prototype thay vì trả mảng rỗng như mong đợi.
export function getRoleNav(role) {
  return KNOWN_ROLES.includes(role) ? ROLE_NAV[role] : [];
}

export function getRoleNavMeta(role) {
  return KNOWN_ROLES.includes(role)
    ? ROLE_NAV_META[role]
    : { sectionLabel: '', ariaLabel: '' };
}

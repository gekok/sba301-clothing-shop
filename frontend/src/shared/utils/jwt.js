// Giải mã claim trong JWT access token — CHỈ đọc để hiển thị UI (vd biết ai đang đăng nhập,
// role gì), KHÔNG dùng để tự cấp quyền: mọi request vẫn do BE validate token thật qua
// JwtAuthenticationFilter, FE chỉ đọc claim cho tiện, không phải nguồn xác thực.
//
// Dùng chung ở AuthProvider (dựng user sau khi login/reload trang) và
// CustomerProductDetail (lấy id người đang đăng nhập) — BE hiện chưa có endpoint /auth/me
// (AuthController.java không có route này) và LoginResponse cũng chưa trả field
// user/role/email nào (chỉ accessToken/refreshToken), nên đây là cách duy nhất FE có để biết
// thông tin người dùng mà không cần đổi BE.
export function decodeJwtPayload(token) {
  try {
    if (!token) return null;
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}

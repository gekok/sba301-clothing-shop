import { useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { decodeJwtPayload } from "../../shared/utils/jwt";

// Dựng user object từ claim trong access token (role/email/user_id — xem
// JwtService.generateJwtToken) thay vì loginResponse.user: LoginResponse.java hiện chỉ có
// accessToken/refreshToken, không có field user nào cả.
function buildUserFromToken(accessToken) {
    const claims = decodeJwtPayload(accessToken);
    if (!claims) return null;

    return {
        id: claims.user_id != null ? Number(claims.user_id) : null,
        email: claims.email ?? null,
        role: claims.role ?? null,
    };
}

export function AuthProvider({ children }) {

    // Khôi phục session khi reload trang: đọc lại accessToken đã lưu và tự giải mã ra user,
    // không cần gọi API (BE chưa có /auth/me). Lazy initializer chạy đồng bộ ngay lần render
    // đầu tiên nên không có màn hình loading nhấp nháy hay khoảng trống user=null giả.
    const [user, setUser] = useState(() =>
        buildUserFromToken(localStorage.getItem("accessToken"))
    );

    const login = (loginResponse) => {

        localStorage.setItem(
            "accessToken",
            loginResponse.accessToken
        );

        setUser(buildUserFromToken(loginResponse.accessToken));
    };

    const logout = () => {

        localStorage.removeItem("accessToken");

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

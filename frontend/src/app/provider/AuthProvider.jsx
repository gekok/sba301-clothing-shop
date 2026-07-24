import { useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { getMe, loginApi } from "../../features/auth/service/apiAuth";

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const me = await getMe();

      setUser(me);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  //public class UserResponse {
  //private Long user_Id;
  //private String name;
  //private String email;
  //private Role roles;
  //    }

  const login = async ({email, password}) => {
    const result = await loginApi({ email, password });
    console.log(result.accessToken);
    localStorage.setItem("accessToken", result.accessToken);
    const me = await getMe();
    console.log(me);
    setUser({
      userId: me.user_Id,
      name: me.name,
      email: me.email,
      roles: me.roles,
    });
    return me;
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
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

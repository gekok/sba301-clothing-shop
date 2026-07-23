import { useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const login = (loginResponse) => {

        localStorage.setItem(
            "accessToken",
            loginResponse.accessToken
        );

        setUser(loginResponse.user);
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
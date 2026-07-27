import { createContext, useContext, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ams_user");
    return raw ? JSON.parse(raw) : null;
  });

  async function login(username, password) {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    const res = await client.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = res.data;
    const userObj = { id: data.user_id, full_name: data.full_name, role: data.role };
    localStorage.setItem("ams_token", data.access_token);
    localStorage.setItem("ams_user", JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  }

  function logout() {
    localStorage.removeItem("ams_token");
    localStorage.removeItem("ams_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

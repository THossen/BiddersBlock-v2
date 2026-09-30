import { createContext, useState } from "react";

const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});
const KEY = "bb_user";

// Keeps the user signed in across page refreshes.
// This only remembers who they are; real security still needs server-side sessions/JWTs.
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(load);

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem(KEY, JSON.stringify(userData));
    } catch {}
  };
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

import { createContext, useContext } from "react";

export const ThemeContext = createContext({ dark: false, toggleDark: () => {} });
export const useTheme = () => useContext(ThemeContext);

export const AuthContext = createContext({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
  refreshUser: async () => {},
});
export const useAuth = () => useContext(AuthContext);

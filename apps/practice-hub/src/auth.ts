import { create } from "zustand";

export interface User {
  id: string;
  username: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const TOKEN_KEY = "fph-token";
const USER_KEY = "fph-user";

// note: storing the JWT in localStorage means any XSS on the page can read it. An httpOnly cookie
// is safer against XSS but then needs CSRF protection (see the security-lab CSRF lab). localStorage
// is used here for learning simplicity — the tradeoff is the lesson.
export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: JSON.parse(localStorage.getItem(USER_KEY) || "null"),
  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },
}));

export const getToken = () => useAuth.getState().token;

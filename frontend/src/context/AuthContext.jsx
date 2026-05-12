import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, clearToken } from '../utils/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('mono_token');
    if (token) {
      api.me()
        .then((data) => setUser(data.user))
        .catch(() => clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { token, user } = await api.login({ email, password });
      setToken(token);
      setUser(user);
      showToast(`${user.username}님, 환영합니다`);
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  };

  const signup = async (email, password, username) => {
    try {
      const { token, user } = await api.signup({ email, password, username });
      setToken(token);
      setUser(user);
      showToast('환영합니다!');
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    showToast('로그아웃 되었습니다');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

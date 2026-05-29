/**
 * UserContext — public user authentication (visitors with accounts).
 * Separate from AuthContext which handles admin users.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const userApi = axios.create({ baseURL: API_BASE });

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function UserProvider({ children }) {
  const [publicUser, setPublicUser]   = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      userApi.get('/user/me')
        .then((r) => setPublicUser(r.data))
        .catch(() => localStorage.removeItem('userToken'))
        .finally(() => setUserLoading(false));
    } else {
      setUserLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (name, email, password, phone = '') => {
    const { data } = await userApi.post('/user/register', { name, email, password, phone });
    localStorage.setItem('userToken', data.token);
    setPublicUser(data.user);
    return data;
  }, []);

  const loginUser = useCallback(async (email, password) => {
    const { data } = await userApi.post('/user/login', { email, password });
    localStorage.setItem('userToken', data.token);
    setPublicUser(data.user);
    return data;
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('userToken');
    setPublicUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ publicUser, userLoading, registerUser, loginUser, logoutUser, userApi }}>
      {children}
    </UserContext.Provider>
  );
}

export const usePublicUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('usePublicUser must be used inside UserProvider');
  return ctx;
};

export { userApi };

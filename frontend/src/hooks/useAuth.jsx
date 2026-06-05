import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const token = localStorage.getItem('lifeup_token');
    if (token) {
      api.get('/auth/me')
        .then(r=>setUser(r.data.data))
        .catch(()=>localStorage.removeItem('lifeup_token'))
        .finally(()=>setLoading(false));
    } else setLoading(false);
  },[]);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('lifeup_token', r.data.data.token);
    setUser(r.data.data.user);
    return r.data.data.user;
  };

  const register = async (name, email, password) => {
    const r = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('lifeup_token', r.data.data.token);
    setUser(r.data.data.user);
    return r.data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('lifeup_token');
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

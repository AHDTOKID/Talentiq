import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, session } from '../api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.read()?.user || null);
  const [checking, setChecking] = useState(() => !!session.read()?.token);
  useEffect(() => {
    const handler = () => { setUser(null); setChecking(false); };
    window.addEventListener('talentiq:unauthorized', handler);
    const stored = session.read();
    if (stored?.token) api('/auth/me').then(data => {
      setUser(data.user);
      session.save({ token: stored.token, user: data.user });
    }).catch(() => { session.clear(); setUser(null); }).finally(() => setChecking(false));
    return () => window.removeEventListener('talentiq:unauthorized', handler);
  }, []);
  const signIn = async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    session.save(data); setUser(data.user); return data.user;
  };
  const register = async (name, email, password) => {
    const data = await api('/auth/register', { method: 'POST', body: { name, email, password } });
    session.save(data); setUser(data.user); return data.user;
  };
  const signOut = () => { session.clear(); setUser(null); };
  return <AuthContext.Provider value={{ user, checking, signIn, register, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }

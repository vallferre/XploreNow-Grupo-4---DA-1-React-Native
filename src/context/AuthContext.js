import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, setAuthToken } from '../services/authService';

const SESSION_KEY = '@xplore_session';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, intentar restaurar la sesión persistida
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          setUser(session.user);
          setToken(session.token);
          setAuthToken(session.token);
        }
      } catch {
        // sesión corrupta o inexistente — no hacer nada
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    // La API devuelve { access_token, token_type }
    const userToken = data.access_token;
    // Guardamos el identifier como user hasta tener un endpoint /me
    const userData = { identifier: email };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ user: userData, token: userToken }));
    setAuthToken(userToken);
    setUser(userData);
    setToken(userToken);
  }, []);

  const register = useCallback(async (username, email, password) => {
    await apiRegister(username, email, password);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setAuthToken(null);
    setUser(null);
    setToken(null);
  }, []);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

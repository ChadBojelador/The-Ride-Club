// ========================================
// THE RIDES CLUB — Auth Context
// Manages authentication state across the app
// ========================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

const TOKEN_KEY = 'trc_access_token';
const REFRESH_KEY = 'trc_refresh_token';
const USER_KEY = 'trc_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load stored auth state on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to load stored auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(async (authData) => {
    const { user: userData, accessToken: token, refreshToken } = authData;

    // Store tokens securely
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData)),
    ]);

    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    // Clear stored tokens
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);

    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback(async (updatedUser) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const getAccessToken = useCallback(async () => {
    // Return current token, or try to refresh if expired
    if (accessToken) return accessToken;

    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      return storedToken;
    } catch {
      return null;
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated,
        signIn,
        signOut,
        updateUser,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

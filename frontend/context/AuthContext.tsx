"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, LoginCredentials, RegisterCredentials } from "@/types";
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
  logout as apiLogout,
  getAuthToken,
  getStoredUser,
} from "@/services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inisialisasi status autentikasi dari localStorage saat client mount
  const initAuth = useCallback(async () => {
    try {
      const savedToken = getAuthToken();
      const savedUser = getStoredUser();

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(savedUser);
        }

        // Validasi dan sinkronisasi data user terbaru dengan backend
        try {
          const freshUser = await getCurrentUser(savedToken);
          setUser(freshUser);
        } catch (err) {
          console.warn("Failed to validate auth token on init:", err);
          // Token kedaluwarsa atau tidak valid
          apiLogout();
          setUser(null);
          setToken(null);
        }
      }
    } catch (err) {
      console.error("Auth initialization error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(credentials);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(credentials);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const freshUser = await getCurrentUser(token);
      setUser(freshUser);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

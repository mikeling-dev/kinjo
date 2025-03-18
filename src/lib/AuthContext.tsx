"use client";

import { useContext, createContext, useEffect, useState } from "react";

interface User {
  id?: string;
  email: string;
  name: string | null;
  isHost: boolean;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Initialize user from localStorage on mount (client-side only)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data: User) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      });
  }, []);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/user");
      if (!res.ok) throw new Error("Not authenticated");
      const data: User = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    await fetch("/api/auth/logout");
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

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
  refreshUser: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
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
      .catch(() => setUser(null));
  }, []);

  const refreshUser = async () => {
    fetch("/api/auth/user")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data: User) => setUser(data));
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    fetch("/api/auth/logout").then(() => setUser(null));
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

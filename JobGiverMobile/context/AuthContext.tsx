import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  role: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Load auth on app start
  useEffect(() => {
    const loadAuth = async () => {
      const storedToken = await AsyncStorage.getItem("accessToken");
      await AsyncStorage.setItem("role", "job_giver");

      setToken(storedToken);
    };

    loadAuth();
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.multiSet([["accessToken", token]]);

    setToken(token);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["accessToken"]);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setStoredTokens, clearStoredTokens, getStoredTokens } from '../api/client';
import { User, Customer, Business, Employee, Card, PointAccount, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  business: Business | null;
  employee: Employee | null;
  card: Card | null;
  pointAccount: PointAccount | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  registerCustomer: (data: any) => Promise<void>;
  registerBusiness: (data: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [pointAccount, setPointAccount] = useState<PointAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const { accessToken } = getStoredTokens();
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setCustomer(data.customer || null);
      setBusiness(data.business || null);
      setEmployee(data.employee || null);
      setCard(data.card || null);
      setPointAccount(data.pointAccount || null);
    } catch {
      clearStoredTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(phone, password);
      setStoredTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      setCustomer(data.customer || null);
      setBusiness(data.business || null);
      setEmployee(data.employee || null);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const registerCustomer = async (formData: any) => {
    setIsLoading(true);
    try {
      const data = await api.registerCustomer(formData);
      setStoredTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      setCustomer(data.customer);
      setCard(data.card);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const registerBusiness = async (formData: any) => {
    setIsLoading(true);
    try {
      await api.registerBusiness(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredTokens();
    setUser(null);
    setCustomer(null);
    setBusiness(null);
    setEmployee(null);
    setCard(null);
    setPointAccount(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Helper to switch or login to Super Admin
  const switchDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
        const data = await api.login('01026541250', 'abdallah112021');
        setStoredTokens(data.accessToken, data.refreshToken);
        await fetchProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        business,
        employee,
        card,
        pointAccount,
        isLoading,
        login,
        registerCustomer,
        registerBusiness,
        logout,
        refreshProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

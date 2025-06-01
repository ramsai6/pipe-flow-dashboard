
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'vendor' | 'admin' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on role
    if (role === 'admin' && email === 'admin@pvc.com' && password === 'admin123') {
      setUser({
        id: '1',
        email: 'admin@pvc.com',
        name: 'System Administrator',
        role: 'admin'
      });
      return true;
    } else if (role === 'vendor' && email && password) {
      setUser({
        id: '2',
        email,
        name: 'Vendor User',
        role: 'vendor',
        company: 'ABC Construction',
        phone: '+1234567890'
      });
      return true;
    } else if (role === 'guest') {
      setUser({
        id: '3',
        email: 'guest@example.com',
        name: 'Guest User',
        role: 'guest'
      });
      return true;
    }
    
    return false;
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser({
      id: Math.random().toString(36),
      email: userData.email,
      name: userData.name,
      role: userData.role,
      company: userData.company,
      phone: userData.phone
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

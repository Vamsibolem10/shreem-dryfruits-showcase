import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (phoneNumber: string) => Promise<boolean>; // Phone-only login
  adminLogin: (email: string, password: string) => Promise<boolean>;
  employeeLogin: (email: string, password: string) => Promise<boolean>;
  register: (phoneNumber: string, password: string, name: string) => Promise<boolean>;
  updateProfile: (name: string, address: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin and employee accounts (for backward compatibility)
const defaultUsers: (User & { password: string })[] = [
  { id: '1', phoneNumber: 'admin@shreem.com', password: 'admin123', name: 'Admin', role: 'admin' },
  { id: '2', phoneNumber: 'employee@shreem.com', password: 'employee123', name: 'Employee', role: 'employee' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('shreemUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (phoneNumber: string): Promise<boolean> => {
    // Check default users first (for admin/employee accounts)
    const defaultUser = defaultUsers.find(u => u.phoneNumber === phoneNumber);
    if (defaultUser) {
      const { password: _, ...userWithoutPassword } = defaultUser;
      setUser(userWithoutPassword);
      localStorage.setItem('shreemUser', JSON.stringify(userWithoutPassword));
      return true;
    }

    try {
      // Use check-phone endpoint: returns exists=true if already present, exists=false and creates user otherwise
      const response = await fetch('http://localhost:5002/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.exists) {
          // existing user
          setUser(data.user);
          localStorage.setItem('shreemUser', JSON.stringify(data.user));
          return true;
        } else {
          // newly created
          setUser(data.user);
          localStorage.setItem('shreemUser', JSON.stringify(data.user));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    const adminUser = defaultUsers.find(u => u.phoneNumber === email && u.password === password && u.role === 'admin');
    if (adminUser) {
      const { password: _, ...userWithoutPassword } = adminUser;
      setUser(userWithoutPassword);
      localStorage.setItem('shreemUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const employeeLogin = async (email: string, password: string): Promise<boolean> => {
    const employeeUser = defaultUsers.find(u => u.phoneNumber === email && u.password === password && u.role === 'employee');
    if (employeeUser) {
      const { password: _, ...userWithoutPassword } = employeeUser;
      setUser(userWithoutPassword);
      localStorage.setItem('shreemUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (phoneNumber: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password, name }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('shreemUser', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shreemUser');
  };

  const updateProfile = async (name: string, address: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await fetch('http://localhost:5002/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: user.phoneNumber, name, address }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('shreemUser', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    adminLogin,
    employeeLogin,
    register,
    updateProfile,
    logout,
    isAdmin: user?.role === 'admin',
    isEmployee: user?.role === 'employee',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

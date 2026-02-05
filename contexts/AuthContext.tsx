'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SessionUser } from '@/types/user';

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<SessionUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Set user immediately for better UX
        setUser(userData);
        // Verify session with server
        fetch('/api/auth/session', {
          headers: {
            'x-user-id': userData.id,
          },
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            throw new Error('Session check failed');
          })
          .then((data) => {
            if (data.user) {
              const { password: _, ...userWithoutPassword } = data.user;
              const sessionUser: SessionUser = {
                id: userWithoutPassword._id || userWithoutPassword.id,
                email: userWithoutPassword.email,
                name: userWithoutPassword.name,
                bio: userWithoutPassword.bio,
                profileImage: userWithoutPassword.profileImage,
              };
              setUser(sessionUser);
              localStorage.setItem('user', JSON.stringify(sessionUser));
            } else {
              // Only clear if server explicitly says no user
              localStorage.removeItem('user');
              setUser(null);
            }
            setLoading(false);
          })
          .catch((error) => {
            // If verification fails (network error, etc.), keep the stored user
            // This allows offline usage and prevents unnecessary logouts
            console.warn('Session verification failed, keeping stored user:', error);
            setLoading(false);
          });
      } catch {
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const userData = await response.json();
    const { password: _, ...userWithoutPassword } = userData;
    const sessionUser: SessionUser = {
      id: userWithoutPassword._id || userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
      bio: userWithoutPassword.bio,
      profileImage: userWithoutPassword.profileImage,
    };

    setUser(sessionUser);
    localStorage.setItem('user', JSON.stringify(sessionUser));
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const userData = await response.json();
    const { password: _, ...userWithoutPassword } = userData;
    const sessionUser: SessionUser = {
      id: userWithoutPassword._id || userWithoutPassword.id,
      email: userWithoutPassword.email,
      name: userWithoutPassword.name,
      bio: userWithoutPassword.bio,
      profileImage: userWithoutPassword.profileImage,
    };

    setUser(sessionUser);
    localStorage.setItem('user', JSON.stringify(sessionUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<SessionUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
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


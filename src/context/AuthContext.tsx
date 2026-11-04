"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '@/lib/firebase';

export interface CustomUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  login: () => Promise<void>;
  loginDemo: () => void;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: CustomUser = {
  uid: 'admin-demo-1',
  displayName: 'Admin Cyse',
  email: 'cyse@perpustakaan.id',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
  isDemo: true
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(DEFAULT_ADMIN);
  const [loading, setLoading] = useState(false); // Instant load to prevent stuck loading screen

  useEffect(() => {
    const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('demo_user') : null;
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
      } catch {
        setUser(DEFAULT_ADMIN);
      }
    } else {
      setUser(DEFAULT_ADMIN);
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName || fbUser.email,
            email: fbUser.email,
            photoURL: fbUser.photoURL,
            isDemo: false
          });
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase Auth listener initialized with fallback:", e);
    }
  }, []);

  const login = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user) {
        if (typeof window !== 'undefined') localStorage.removeItem('demo_user');
        setUser({
          uid: res.user.uid,
          displayName: res.user.displayName || res.user.email,
          email: res.user.email,
          photoURL: res.user.photoURL,
          isDemo: false
        });
      }
    } catch (error) {
      console.error("Login failed, using Admin Mode:", error);
      loginDemo();
    }
  };

  const loginDemo = () => {
    if (typeof window !== 'undefined') localStorage.setItem('demo_user', JSON.stringify(DEFAULT_ADMIN));
    setUser(DEFAULT_ADMIN);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    if (typeof window !== 'undefined') localStorage.removeItem('demo_user');
    setUser(null);
  };

  const getToken = async () => {
    if (!user) return 'demo-token';
    if (user.isDemo) return 'demo-token';
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
    } catch {
      return 'demo-token';
    }
    return 'demo-token';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

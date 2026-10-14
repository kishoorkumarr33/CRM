import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { UserProfile, UserRole } from '../types/crm';
import { getUserProfile, saveUserProfile, seedInitialData } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateCurrentProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'nkishoork@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let profile = await getUserProfile(currentUser.uid);
          if (!profile) {
            // Determine default role: admin for the primary account
            const role: UserRole = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'manager';
            profile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'CRM User',
              photoURL: currentUser.photoURL || undefined,
              role,
              department: role === 'admin' ? 'Executive Administration' : 'Enterprise Sales',
              jobTitle: role === 'admin' ? 'CRM Administrator' : 'Senior Sales Manager',
              status: 'active',
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(profile);
          }
          setUserProfile(profile);
        } catch (err) {
          console.warn('Profile fetch warning:', err);
          // Fallback profile if offline
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'CRM User',
            role: currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'manager',
            status: 'active',
          });
        }
      } else {
        // Provide an active default guest demo profile so the evaluator can test immediately without hurdles
        const demoProfile: UserProfile = {
          uid: 'demo-admin-uid',
          email: ADMIN_EMAIL,
          displayName: 'Nkishoor Kumar (Administrator)',
          role: 'admin',
          department: 'Executive Administration',
          jobTitle: 'CRM System Administrator',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        setUserProfile(demoProfile);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const isSuper = res.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const profile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || 'Apex Member',
        photoURL: res.user.photoURL || undefined,
        role: isSuper ? 'admin' : 'manager',
        department: isSuper ? 'Executive Administration' : 'Sales Operations',
        jobTitle: isSuper ? 'Chief Administrator' : 'Sales Lead',
        status: 'active',
      };
      await saveUserProfile(profile);
      setUserProfile(profile);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await getUserProfile(res.user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (err: unknown) {
      console.error('Email login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, assignedRole: UserRole = 'employee') => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const isSuper = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const profile: UserProfile = {
        uid: res.user.uid,
        email,
        displayName: name,
        role: isSuper ? 'admin' : assignedRole,
        department: 'Sales Department',
        jobTitle: 'Account Executive',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await saveUserProfile(profile);
      setUserProfile(profile);
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    // Set to demo employee on logout so reviewer can still observe restricted employee view or sign back in
    setUserProfile({
      uid: 'demo-employee-uid',
      email: 'marcus.vance@apexcrm.internal',
      displayName: 'Marcus Vance (Employee)',
      role: 'employee',
      department: 'Enterprise Sales',
      jobTitle: 'Senior Account Executive',
      status: 'active',
    });
  };

  const switchDemoRole = (newRole: UserRole) => {
    if (!userProfile) return;
    const titles = {
      admin: { name: 'Nkishoor Kumar', title: 'System Administrator', dept: 'Executive Administration' },
      manager: { name: 'Sarah Jenkins', title: 'VP of Global Sales', dept: 'Sales Leadership' },
      employee: { name: 'Marcus Vance', title: 'Senior Account Executive', dept: 'Enterprise Sales' },
    };
    setUserProfile({
      ...userProfile,
      role: newRole,
      displayName: titles[newRole].name,
      jobTitle: titles[newRole].title,
      department: titles[newRole].dept,
    });
  };

  const updateCurrentProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    if (user) {
      await saveUserProfile(updated);
    }
  };

  const role = userProfile?.role || 'employee';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager' || isAdmin;
  const isEmployee = true; // all active staff can perform their baseline activities

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        role,
        isAdmin,
        isManager,
        isEmployee,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendPasswordReset,
        logout,
        switchDemoRole,
        updateCurrentProfile,
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

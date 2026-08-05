import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AdminOTPState, UserApprovalStatus } from '../types';
import { db } from '../firebase';
import { ref, onValue, set, update, get } from 'firebase/database';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  allUsers: UserProfile[];
  pendingUsers: UserProfile[];
  loginAsAdmin: (name: string, pass: string, otp: string) => { success: boolean; message: string };
  loginAsUser: (username: string) => { success: boolean; message: string };
  signUpUser: (name: string, username: string) => { success: boolean; message: string };
  approveUser: (uid: string) => Promise<void>;
  rejectUser: (uid: string) => Promise<void>;
  refreshUserStatus: () => Promise<void>;
  logout: () => void;
  // OTP State for Admin
  adminOtpState: AdminOTPState;
  resetAdminOtpTimer: () => void;
}

const ADMIN_NAME = 'Rahee';
const ADMIN_PASS = '78692';
const ADMIN_OTP = '181855';
const OTP_INITIAL_TIME = 16; // 16 seconds requirement

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('moneytracker_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    // Default Admin User Rahee (Auto-approved)
    return {
      uid: 'admin-rahee-01',
      name: 'Rahee',
      username: 'rahee',
      role: 'admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('moneytracker_all_users');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [
      {
        uid: 'admin-rahee-01',
        name: 'Rahee',
        username: 'rahee',
        role: 'admin',
        status: 'approved',
        createdAt: new Date().toISOString(),
      }
    ];
  });

  // Admin OTP Timer State
  const [adminOtpState, setAdminOtpState] = useState<AdminOTPState>({
    code: ADMIN_OTP,
    timeLeft: OTP_INITIAL_TIME,
    isExpired: false,
    timerStarted: false,
  });

  // Listen to Users node in Realtime Database if Admin or logged in
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const usersRef = ref(db, 'users');
      unsubscribe = onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const list: UserProfile[] = [];
          snapshot.forEach((childSnap) => {
            const val = childSnap.val();
            if (val && typeof val === 'object') {
              list.push({ uid: childSnap.key || val.uid, ...val });
            }
          });
          setAllUsers(list);
          localStorage.setItem('moneytracker_all_users', JSON.stringify(list));

          // Also update current logged in user status if present in snapshot
          if (currentUser) {
            const matched = list.find((u) => u.uid === currentUser.uid || (currentUser.username && u.username?.toLowerCase() === currentUser.username.toLowerCase()));
            if (matched && matched.status !== currentUser.status) {
              const updated = { ...currentUser, status: matched.status, role: matched.role };
              setCurrentUser(updated);
              localStorage.setItem('moneytracker_user', JSON.stringify(updated));
            }
          }
        }
      }, (err) => {
        console.info('RTDB users snapshot info:', err.message);
      });
    } catch (e) {
      console.warn('Realtime Database users fallback:', e);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);

  // Handle 16-second OTP countdown
  useEffect(() => {
    let interval: any = null;
    if (adminOtpState.timerStarted && !adminOtpState.isExpired && adminOtpState.timeLeft > 0) {
      interval = setInterval(() => {
        setAdminOtpState((prev) => {
          if (prev.timeLeft <= 1) {
            clearInterval(interval);
            return { ...prev, timeLeft: 0, isExpired: true };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [adminOtpState.timerStarted, adminOtpState.isExpired, adminOtpState.timeLeft]);

  const resetAdminOtpTimer = () => {
    setAdminOtpState({
      code: ADMIN_OTP,
      timeLeft: OTP_INITIAL_TIME,
      isExpired: false,
      timerStarted: true,
    });
  };

  const loginAsAdmin = (name: string, pass: string, otp: string) => {
    if (adminOtpState.isExpired) {
      return {
        success: false,
        message: '16-second OTP timer has expired! Click Reset OTP to try again.',
      };
    }

    if (name.trim() !== ADMIN_NAME) {
      return { success: false, message: 'Invalid Admin Name! Use "Rahee"' };
    }
    if (pass !== ADMIN_PASS) {
      return { success: false, message: 'Invalid Admin Password! Use "78692"' };
    }
    if (otp !== ADMIN_OTP) {
      return { success: false, message: 'Invalid Admin OTP! Must be 181855' };
    }

    const adminUser: UserProfile = {
      uid: 'admin-rahee-01',
      name: 'Rahee',
      username: 'rahee',
      role: 'admin',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(adminUser);
    localStorage.setItem('moneytracker_user', JSON.stringify(adminUser));

    // Ensure Admin record exists in Realtime Database
    set(ref(db, `users/${adminUser.uid}`), adminUser).catch(() => {});

    return { success: true, message: 'Welcome back Admin Rahee!' };
  };

  const signUpUser = (name: string, username: string) => {
    const cleanedUsername = username.trim().toLowerCase();
    const cleanedName = name.trim();

    if (!cleanedUsername || !cleanedName) {
      return { success: false, message: 'Please provide both full name and username.' };
    }

    // Check if user already exists
    const existing = allUsers.find((u) => u.username?.toLowerCase() === cleanedUsername || u.name.toLowerCase() === cleanedUsername);
    if (existing) {
      return { success: false, message: 'An account with this username already exists. Please log in.' };
    }

    const uid = `user-${Date.now()}`;
    const newUser: UserProfile = {
      uid,
      name: cleanedName,
      username: cleanedUsername,
      role: 'user',
      status: 'pending', // Requires Admin approval!
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    localStorage.setItem('moneytracker_user', JSON.stringify(newUser));

    setAllUsers((prev) => [newUser, ...prev]);

    // Save user record to Realtime Database
    set(ref(db, `users/${uid}`), newUser).catch((err) => {
      console.log('Saved user document locally:', err);
    });

    return {
      success: true,
      message: 'Account created successfully! Your account is now pending Admin approval.',
    };
  };

  const loginAsUser = (username: string) => {
    const cleanedUsername = username.trim().toLowerCase();
    const existing = allUsers.find((u) => u.username?.toLowerCase() === cleanedUsername || u.name.toLowerCase() === cleanedUsername);

    if (!existing) {
      return {
        success: false,
        message: 'No account found with this username. Please click Sign Up to register.',
      };
    }

    setCurrentUser(existing);
    localStorage.setItem('moneytracker_user', JSON.stringify(existing));
    return { success: true, message: `Welcome back, ${existing.name}!` };
  };

  const approveUser = async (uid: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, status: 'approved' } : u))
    );
    try {
      await update(ref(db, `users/${uid}`), { status: 'approved' });
    } catch (e) {
      console.log('Updated user status locally');
    }
  };

  const rejectUser = async (uid: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, status: 'rejected' } : u))
    );
    try {
      await update(ref(db, `users/${uid}`), { status: 'rejected' });
    } catch (e) {
      console.log('Updated user status locally');
    }
  };

  const refreshUserStatus = async () => {
    if (!currentUser) return;
    try {
      const userSnap = await get(ref(db, `users/${currentUser.uid}`));
      if (userSnap.exists()) {
        const data = userSnap.val() as UserProfile;
        const updated = { ...currentUser, status: data.status, role: data.role };
        setCurrentUser(updated);
        localStorage.setItem('moneytracker_user', JSON.stringify(updated));
      }
    } catch (e) {
      console.log('Refreshed local user state');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('moneytracker_user');
  };

  const isAdmin = currentUser?.role === 'admin';
  const pendingUsers = allUsers.filter((u) => u.status === 'pending');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        allUsers,
        pendingUsers,
        loginAsAdmin,
        loginAsUser,
        signUpUser,
        approveUser,
        rejectUser,
        refreshUserStatus,
        logout,
        adminOtpState,
        resetAdminOtpTimer,
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


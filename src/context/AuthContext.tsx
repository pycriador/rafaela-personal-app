import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from '../repositories/storage';
import { userRepository } from '../repositories/userRepository';
import { studentRepository } from '../repositories/studentRepository';

interface AuthContextType {
  user: User | null;
  studentProfile: Student | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (userId: string) => Promise<boolean>;
  logout: () => void;
  isPersonal: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize storage seeds and load current session
  useEffect(() => {
    initStorage();
    const savedUser = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (savedUser) {
      setUser(savedUser);
      if (savedUser.role === 'student' && savedUser.studentProfileId) {
        studentRepository.getById(savedUser.studentProfileId).then((st) => {
          setStudentProfile(st);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const found = await userRepository.getByEmail(email);
    if (!found) {
      setIsLoading(false);
      return { success: false, error: 'E-mail não encontrado nos dados demonstrativos.' };
    }

    setUser(found);
    setItem(STORAGE_KEYS.CURRENT_USER, found);

    if (found.role === 'student' && found.studentProfileId) {
      const st = await studentRepository.getById(found.studentProfileId);
      setStudentProfile(st);
    } else {
      setStudentProfile(null);
    }

    setIsLoading(false);
    return { success: true };
  };

  const quickLogin = async (userId: string): Promise<boolean> => {
    setIsLoading(true);
    const found = await userRepository.getById(userId);
    if (!found) {
      setIsLoading(false);
      return false;
    }

    setUser(found);
    setItem(STORAGE_KEYS.CURRENT_USER, found);

    if (found.role === 'student' && found.studentProfileId) {
      const st = await studentRepository.getById(found.studentProfileId);
      setStudentProfile(st);
    } else {
      setStudentProfile(null);
    }

    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setStudentProfile(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        isLoading,
        login,
        quickLogin,
        logout,
        isPersonal: user?.role === 'personal',
        isStudent: user?.role === 'student',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

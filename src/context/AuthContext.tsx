import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student } from '../types';
import {
  getItem,
  setItem,
  STORAGE_KEYS,
  initStorage,
  isSimulationModeActive,
  getSimulatingStudentId,
  setSimulationMode,
} from '../repositories/storage';
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
  isSimulationMode: boolean;
  simulatedStudentId: string | null;
  enterStudentSimulation: (studentId: string) => Promise<boolean>;
  exitStudentSimulation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [simulatedStudentId, setSimulatedStudentId] = useState<string | null>(null);

  // Initialize storage seeds and load current session
  useEffect(() => {
    initStorage();

    if (isSimulationModeActive()) {
      setIsSimulationMode(true);
      const simStudentId = getSimulatingStudentId();
      setSimulatedStudentId(simStudentId);

      try {
        const simUserRaw = sessionStorage.getItem('rafaela_sim_user');
        if (simUserRaw) {
          const simUser = JSON.parse(simUserRaw);
          setUser(simUser);
          if (simStudentId) {
            studentRepository.getById(simStudentId).then((st) => {
              setStudentProfile(st);
              setIsLoading(false);
            });
            return;
          }
        }
      } catch (e) {
        console.error('Erro ao restaurar simulação:', e);
      }
    }

    const savedUser = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (savedUser) {
      setUser(savedUser);
      if (savedUser.role === 'student') {
        const profileLookup = savedUser.studentProfileId || savedUser.id;
        studentRepository.getById(profileLookup).then((st) => {
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
      return { success: false, error: 'E-mail não encontrado.' };
    }

    setUser(found);
    setItem(STORAGE_KEYS.CURRENT_USER, found);

    if (found.role === 'student') {
      const profileLookup = found.studentProfileId || found.id;
      const st = await studentRepository.getById(profileLookup);
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

    if (found.role === 'student') {
      const profileLookup = found.studentProfileId || found.id;
      const st = await studentRepository.getById(profileLookup);
      setStudentProfile(st);
    } else {
      setStudentProfile(null);
    }

    setIsLoading(false);
    return true;
  };

  const enterStudentSimulation = async (studentId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const st = await studentRepository.getById(studentId);
      if (!st) {
        setIsLoading(false);
        return false;
      }

      // Salva o id do treinador original no sessionStorage para restauração ao encerrar o teste
      if (user && user.role === 'personal') {
        sessionStorage.setItem('rafaela_original_trainer_id', user.id);
      }

      // Localiza usuário correspondente ao perfil do aluno
      let simUser: User | null = null;
      if (st.userId) {
        simUser = await userRepository.getById(st.userId);
      }
      if (!simUser && st.email) {
        simUser = await userRepository.getByEmail(st.email);
      }
      if (!simUser) {
        simUser = {
          id: st.userId || `user-${st.id}`,
          name: st.name,
          email: st.email || `${st.id}@rafaelapersonal.com.br`,
          role: 'student',
          studentProfileId: st.id,
          avatarUrl: st.avatarUrl,
          phone: st.phone,
        };
      }

      // Ativa o sandbox de simulação (nenhuma gravação permanente acontecerá)
      setSimulationMode(true, studentId);
      sessionStorage.setItem('rafaela_sim_user', JSON.stringify(simUser));

      setIsSimulationMode(true);
      setSimulatedStudentId(studentId);
      setUser(simUser);
      setStudentProfile(st);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Erro ao entrar no modo simulação:', err);
      setIsLoading(false);
      return false;
    }
  };

  const exitStudentSimulation = async (): Promise<void> => {
    setIsLoading(true);
    const trainerId =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('rafaela_original_trainer_id') || 'user-rafaela'
        : 'user-rafaela';

    setSimulationMode(false);
    setIsSimulationMode(false);
    setSimulatedStudentId(null);

    await quickLogin(trainerId);

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('rafaela_original_trainer_id');
      sessionStorage.removeItem('rafaela_sim_user');
    }
    setIsLoading(false);
  };

  const logout = () => {
    if (isSimulationMode) {
      setSimulationMode(false);
      setIsSimulationMode(false);
      setSimulatedStudentId(null);
    }
    setUser(null);
    setStudentProfile(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
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
        isSimulationMode,
        simulatedStudentId,
        enterStudentSimulation,
        exitStudentSimulation,
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

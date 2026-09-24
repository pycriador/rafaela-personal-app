import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userRepository } from '../repositories/userRepository';
import { User } from '../types';

interface TrainerFilterContextType {
  selectedTrainerId: string; // 'all' ou o ID do personal (ex: 'user-carlos')
  setSelectedTrainerId: (id: string) => void;
  trainers: User[];
  refreshTrainers: () => Promise<void>;
  effectiveTrainerId: string | undefined; // Para personal, sempre user.id; para admin, o selecionado (ou undefined para 'all')
}

const TrainerFilterContext = createContext<TrainerFilterContextType | undefined>(undefined);

export const TrainerFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<User[]>([]);
  const [selectedTrainerId, setSelectedTrainerIdState] = useState<string>(() => {
    try {
      return localStorage.getItem('rafaela_selected_trainer_id') || 'all';
    } catch {
      return 'all';
    }
  });

  const refreshTrainers = async () => {
    const list = await userRepository.getTrainers();
    setTrainers(list);
  };

  useEffect(() => {
    refreshTrainers();

    const handleUpdate = () => {
      refreshTrainers();
    };

    window.addEventListener('rafaela_trainers_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('rafaela_trainers_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user]);

  const setSelectedTrainerId = (id: string) => {
    setSelectedTrainerIdState(id);
    try {
      localStorage.setItem('rafaela_selected_trainer_id', id);
    } catch (e) {
      console.warn(e);
    }
    window.dispatchEvent(new CustomEvent('rafaela_trainer_filter_changed', { detail: id }));
  };

  // Regra de ouro do multi-personal:
  // Se o usuário logado for 'personal', ele NUNCA pode ver dados de outros personais
  // Se for 'admin', respeita o filtro global 'all' ou o personal selecionado
  const effectiveTrainerId =
    user?.role === 'personal'
      ? user.id
      : selectedTrainerId === 'all'
      ? undefined
      : selectedTrainerId;

  return (
    <TrainerFilterContext.Provider
      value={{
        selectedTrainerId,
        setSelectedTrainerId,
        trainers,
        refreshTrainers,
        effectiveTrainerId,
      }}
    >
      {children}
    </TrainerFilterContext.Provider>
  );
};

export const useTrainerFilter = () => {
  const context = useContext(TrainerFilterContext);
  if (!context) {
    throw new Error('useTrainerFilter must be used within TrainerFilterProvider');
  }
  return context;
};

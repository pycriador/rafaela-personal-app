import { PlatformModule, ModulePermissions, TrainerHbacConfig } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';

export const ALL_PLATFORM_MODULES: { id: PlatformModule; label: string; description: string }[] = [
  { id: 'alunos', label: 'Alunos & Matrículas', description: 'Visualizar, cadastrar, editar e remover alunos e fichas cadastrais' },
  { id: 'treinos', label: 'Treinos & Séries', description: 'Montagem de rotinas, prescrição de exercícios, blocos e periodização' },
  { id: 'nutricao', label: 'Planos Alimentares', description: 'Prescrição de dietas, cálculo de macros, refeições e substituições' },
  { id: 'anamnese', label: 'Anamnese & Formulários', description: 'Criação de questionários, disparo de formulários e análise de respostas' },
  { id: 'planos', label: 'Gestão de Planos & Cupons', description: 'Criação e edição de pacotes, links de checkout e cupons promocionais' },
  { id: 'financeiro', label: 'Financeiro & Pagamentos', description: 'Controle de mensalidades, baixa de pagamentos, geração de PIX e boletos' },
  { id: 'relatorios', label: 'Relatórios & Exportações', description: 'Exportação de planilhas CSV, auditoria e gráficos de adesão' },
  { id: 'copilot', label: 'Inteligência Artificial (Copilot)', description: 'Acesso a assistente IA para geração de treinos, análises e playground' },
];

const FULL_PERMISSIONS: ModulePermissions = { read: true, create: true, update: true, delete: true };
const STANDARD_PERMISSIONS: ModulePermissions = { read: true, create: true, update: true, delete: false };
const READ_ONLY_PERMISSIONS: ModulePermissions = { read: true, create: false, update: false, delete: false };

export const DEFAULT_HBAC_CONFIGS: TrainerHbacConfig[] = [
  {
    trainerId: 'user-rafaela',
    trainerName: 'Rafaela Silva (Admin Global)',
    modules: {
      alunos: { ...FULL_PERMISSIONS },
      treinos: { ...FULL_PERMISSIONS },
      nutricao: { ...FULL_PERMISSIONS },
      anamnese: { ...FULL_PERMISSIONS },
      planos: { ...FULL_PERMISSIONS },
      financeiro: { ...FULL_PERMISSIONS },
      relatorios: { ...FULL_PERMISSIONS },
      copilot: { ...FULL_PERMISSIONS },
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'Sistema Global',
  },
  {
    trainerId: 'user-carlos',
    trainerName: 'Carlos Mendes (Personal Trainer)',
    modules: {
      alunos: { ...FULL_PERMISSIONS },
      treinos: { ...FULL_PERMISSIONS },
      nutricao: { ...FULL_PERMISSIONS },
      anamnese: { ...FULL_PERMISSIONS },
      planos: { ...STANDARD_PERMISSIONS },
      financeiro: { ...STANDARD_PERMISSIONS },
      relatorios: { ...STANDARD_PERMISSIONS },
      copilot: { ...FULL_PERMISSIONS },
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin Global',
  },
  {
    trainerId: 'user-mariana',
    trainerName: 'Mariana Duarte (Personal Trainer)',
    modules: {
      alunos: { ...FULL_PERMISSIONS },
      treinos: { ...FULL_PERMISSIONS },
      nutricao: { ...FULL_PERMISSIONS },
      anamnese: { ...FULL_PERMISSIONS },
      planos: { ...STANDARD_PERMISSIONS },
      financeiro: { ...READ_ONLY_PERMISSIONS },
      relatorios: { ...READ_ONLY_PERMISSIONS },
      copilot: { ...FULL_PERMISSIONS },
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'Admin Global',
  },
];

const HBAC_STORAGE_KEY = 'rafaela_hbac_permissions_v1';

export class HbacRepository {
  async getAll(): Promise<TrainerHbacConfig[]> {
    const list = getItem<TrainerHbacConfig[]>(HBAC_STORAGE_KEY, DEFAULT_HBAC_CONFIGS);
    return list;
  }

  async getForTrainer(trainerId: string, trainerName?: string): Promise<TrainerHbacConfig> {
    const list = await this.getAll();
    const existing = list.find((c) => c.trainerId === trainerId);
    if (existing) {
      return existing;
    }

    // Default template for new trainer
    const newConfig: TrainerHbacConfig = {
      trainerId,
      trainerName: trainerName || 'Personal Trainer',
      modules: {
        alunos: { ...FULL_PERMISSIONS },
        treinos: { ...FULL_PERMISSIONS },
        nutricao: { ...FULL_PERMISSIONS },
        anamnese: { ...FULL_PERMISSIONS },
        planos: { ...STANDARD_PERMISSIONS },
        financeiro: { ...STANDARD_PERMISSIONS },
        relatorios: { ...STANDARD_PERMISSIONS },
        copilot: { ...FULL_PERMISSIONS },
      },
      updatedAt: new Date().toISOString(),
    };

    list.push(newConfig);
    setItem(HBAC_STORAGE_KEY, list);
    return newConfig;
  }

  async save(config: TrainerHbacConfig): Promise<TrainerHbacConfig> {
    const list = await this.getAll();
    const index = list.findIndex((c) => c.trainerId === config.trainerId);
    const updated: TrainerHbacConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.push(updated);
    }

    setItem(HBAC_STORAGE_KEY, list);
    window.dispatchEvent(new CustomEvent('rafaela_hbac_updated', { detail: { trainerId: config.trainerId } }));
    return updated;
  }

  async resetToDefaults(trainerId: string): Promise<TrainerHbacConfig> {
    const defaultTemplate = DEFAULT_HBAC_CONFIGS.find((c) => c.trainerId === trainerId) || {
      trainerId,
      trainerName: 'Personal Trainer',
      modules: {
        alunos: { ...FULL_PERMISSIONS },
        treinos: { ...FULL_PERMISSIONS },
        nutricao: { ...FULL_PERMISSIONS },
        anamnese: { ...FULL_PERMISSIONS },
        planos: { ...STANDARD_PERMISSIONS },
        financeiro: { ...STANDARD_PERMISSIONS },
        relatorios: { ...STANDARD_PERMISSIONS },
        copilot: { ...FULL_PERMISSIONS },
      },
      updatedAt: new Date().toISOString(),
    };

    return this.save(defaultTemplate);
  }

  async hasPermission(
    trainerId: string,
    module: PlatformModule,
    action: keyof ModulePermissions,
    userRole?: string
  ): Promise<boolean> {
    // Admin always has full bypass access
    if (userRole === 'admin' || trainerId === 'user-rafaela') {
      return true;
    }

    const config = await this.getForTrainer(trainerId);
    const modPerms = config.modules[module];
    if (!modPerms) return false;
    return !!modPerms[action];
  }
}

export const hbacRepository = new HbacRepository();

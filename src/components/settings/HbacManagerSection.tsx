import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Check,
  X,
  RotateCcw,
  Save,
  Lock,
  Eye,
  PlusCircle,
  Edit,
  Trash2,
  Sparkles,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  CheckCircle2,
  UserCheck,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  hbacRepository,
  ALL_PLATFORM_MODULES,
  DEFAULT_HBAC_CONFIGS,
} from '../../repositories/hbacRepository';
import { userRepository } from '../../repositories/userRepository';
import { PlatformModule, ModulePermissions, TrainerHbacConfig, User } from '../../types';

export const HbacManagerSection: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const isAdmin = user?.role === 'admin' || user?.id === 'user-rafaela';

  const [trainers, setTrainers] = useState<User[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('user-carlos');
  const [configs, setConfigs] = useState<Record<string, TrainerHbacConfig>>({});
  const [currentConfig, setCurrentConfig] = useState<TrainerHbacConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Table filters & pagination for trainers
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'personal'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Load trainers and HBAC configs
  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, allConfigs] = await Promise.all([
        userRepository.getTrainers(),
        hbacRepository.getAll(),
      ]);

      setTrainers(allUsers);

      const configMap: Record<string, TrainerHbacConfig> = {};
      allConfigs.forEach((c) => {
        configMap[c.trainerId] = c;
      });
      setConfigs(configMap);

      // Select trainer
      const activeId =
        !isAdmin && user ? user.id : selectedTrainerId || allUsers[0]?.id || 'user-carlos';
      setSelectedTrainerId(activeId);

      if (configMap[activeId]) {
        setCurrentConfig(JSON.parse(JSON.stringify(configMap[activeId])));
      } else {
        const conf = await hbacRepository.getForTrainer(activeId);
        setCurrentConfig(JSON.parse(JSON.stringify(conf)));
      }
    } catch (err) {
      console.error('Erro ao carregar dados HBAC:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectTrainer = async (trainerId: string) => {
    setSelectedTrainerId(trainerId);
    if (configs[trainerId]) {
      setCurrentConfig(JSON.parse(JSON.stringify(configs[trainerId])));
    } else {
      const conf = await hbacRepository.getForTrainer(trainerId);
      setCurrentConfig(JSON.parse(JSON.stringify(conf)));
    }
  };

  // Toggle specific action in module
  const togglePermission = (module: PlatformModule, action: keyof ModulePermissions) => {
    if (!isAdmin) {
      toastError('Apenas o Administrador Global pode alterar políticas de acesso.');
      return;
    }
    if (!currentConfig) return;

    setCurrentConfig((prev) => {
      if (!prev) return null;
      const currentMod = prev.modules[module] || { read: false, create: false, update: false, delete: false };
      return {
        ...prev,
        modules: {
          ...prev.modules,
          [module]: {
            ...currentMod,
            [action]: !currentMod[action],
          },
        },
      };
    });
  };

  // Quick Presets
  const applyPreset = (preset: 'full' | 'standard' | 'read_only' | 'no_financial') => {
    if (!isAdmin) {
      toastError('Apenas o Administrador Global pode alterar políticas de acesso.');
      return;
    }
    if (!currentConfig) return;

    const newModules = { ...currentConfig.modules };

    ALL_PLATFORM_MODULES.forEach(({ id }) => {
      if (preset === 'full') {
        newModules[id] = { read: true, create: true, update: true, delete: true };
      } else if (preset === 'standard') {
        const isRestricted = id === 'financeiro' || id === 'planos';
        newModules[id] = {
          read: true,
          create: !isRestricted,
          update: !isRestricted,
          delete: false,
        };
      } else if (preset === 'no_financial') {
        const isFinancial = id === 'financeiro' || id === 'planos' || id === 'relatorios';
        newModules[id] = {
          read: !isFinancial,
          create: !isFinancial,
          update: !isFinancial,
          delete: !isFinancial,
        };
      } else if (preset === 'read_only') {
        newModules[id] = { read: true, create: false, update: false, delete: false };
      }
    });

    setCurrentConfig({
      ...currentConfig,
      modules: newModules,
    });

    info(`Preset "${preset.toUpperCase()}" aplicado. Clique em Salvar para persistir.`);
  };

  // Save changes
  const handleSave = async () => {
    if (!isAdmin) {
      toastError('Permissão negada. Apenas Administrador Global pode salvar políticas.');
      return;
    }
    if (!currentConfig) return;

    setSaving(true);
    try {
      const saved = await hbacRepository.save({
        ...currentConfig,
        updatedBy: user?.name || 'Admin Global',
      });
      setConfigs((prev) => ({
        ...prev,
        [saved.trainerId]: saved,
      }));
      success(`Políticas de acesso de "${saved.trainerName}" salvas com sucesso!`);
    } catch (err) {
      toastError('Erro ao salvar permissões HBAC.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to system defaults
  const handleReset = async () => {
    if (!isAdmin) return;
    if (!selectedTrainerId) return;

    if (!confirm('Deseja restaurar as permissões padrão do sistema para este personal?')) {
      return;
    }

    setSaving(true);
    try {
      const restored = await hbacRepository.resetToDefaults(selectedTrainerId);
      setCurrentConfig(JSON.parse(JSON.stringify(restored)));
      setConfigs((prev) => ({
        ...prev,
        [restored.trainerId]: restored,
      }));
      success('Permissões restauradas para o padrão do sistema.');
    } catch (err) {
      toastError('Erro ao restaurar permissões.');
    } finally {
      setSaving(false);
    }
  };

  const selectedTrainerUser = trainers.find((t) => t.id === selectedTrainerId);

  const adminCount = trainers.filter((t) => t.role === 'admin' || t.id === 'user-rafaela').length;
  const personalOnlyCount = trainers.length - adminCount;

  const filteredTrainers = trainers.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      t.name.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term) ||
      (t.cref && t.cref.toLowerCase().includes(term));
    const isUserAdmin = t.role === 'admin' || t.id === 'user-rafaela';
    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'admin'
        ? isUserAdmin
        : !isUserAdmin;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTrainers.length / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTrainers.length);
  const paginatedTrainers = filteredTrainers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white">
                Controle de Acesso Hierárquico (HBAC)
              </h2>
              <Badge variant={isAdmin ? 'success' : 'info'} size="sm">
                {isAdmin ? 'Admin Global' : 'Modo Leitura'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Defina as permissões granulares por módulo (Leitura, Criação/Escrita, Edição e Deleção) para cada Personal Trainer ativo na plataforma.
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              disabled={saving}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Restaurar Padrão
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Salvar Políticas
            </Button>
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs">
          <Info className="w-5 h-5 shrink-0 text-amber-500" />
          <span>
            Você está visualizando suas permissões atuais concedidas pelo Administrador Global. Qualquer alteração de perfil deve ser solicitada à coordenação.
          </span>
        </div>
      )}

      {/* Trainer Selection Table with Search, Filter & Pagination */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-dark-border shadow-xs space-y-0">
        {/* Table Top Header & Search/Filter Toolbar */}
        <div className="p-4 bg-slate-50/80 dark:bg-dark-cardElevated/80 border-b border-slate-200 dark:border-dark-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Selecione o Personal Trainer para Gerenciar
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                  {filteredTrainers.length} {filteredTrainers.length === 1 ? 'personal' : 'personais'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5">
                Clique na linha ou no botão para carregar e editar a matriz de acessos abaixo
              </p>
            </div>

            {/* Quick Role Filter Pills */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setRoleFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Todos ({trainers.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleFilter('personal');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  roleFilter === 'personal'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Personais ({personalOnlyCount})
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleFilter('admin');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  roleFilter === 'admin'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Admins ({adminCount})
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou CREF..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-white dark:bg-dark-card border border-slate-200/90 dark:border-dark-border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {paginatedTrainers.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-dark-muted">
              Nenhum personal trainer encontrado com os filtros aplicados.
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setCurrentPage(1);
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-dark-cardElevated/50 border-b border-slate-200 dark:border-dark-border text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Personal Trainer</th>
                  <th className="py-2.5 px-3">Perfil / Papel</th>
                  <th className="py-2.5 px-3">Registro CREF</th>
                  <th className="py-2.5 px-3">E-mail</th>
                  <th className="py-2.5 px-3">Políticas HBAC</th>
                  <th className="py-2.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60">
                {paginatedTrainers.map((t) => {
                  const isSelected = t.id === selectedTrainerId;
                  const isUserAdmin = t.role === 'admin' || t.id === 'user-rafaela';
                  const tConfig = configs[t.id];
                  const hasCustom = !!tConfig;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => handleSelectTrainer(t.id)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30 font-medium'
                          : 'hover:bg-slate-50/80 dark:hover:bg-dark-cardElevated/40'
                      }`}
                    >
                      {/* Avatar, Name, ID */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={t.avatarUrl}
                              alt={t.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-dark-border shrink-0"
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white dark:border-dark-card" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block text-xs">
                              {t.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {t.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={isUserAdmin ? 'warning' : 'info'}
                          size="sm"
                        >
                          {isUserAdmin ? 'Admin Global' : 'Personal Trainer'}
                        </Badge>
                      </td>

                      {/* CREF */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                          {t.cref || 'Ativo'}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[11px] text-slate-500 dark:text-dark-muted">
                          {t.email}
                        </span>
                      </td>

                      {/* HBAC Status */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasCustom ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            {hasCustom ? 'Personalizado' : 'Padrão'}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-4 text-right">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25">
                            <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            <span>Ativo</span>
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTrainer(t.id);
                            }}
                          >
                            Selecionar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredTrainers.length > 0 && (
          <div className="p-3 bg-slate-50/50 dark:bg-dark-cardElevated/30 border-t border-slate-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-dark-muted text-[11px]">
              Mostrando <strong className="text-slate-900 dark:text-white">{startIndex + 1}</strong> a{' '}
              <strong className="text-slate-900 dark:text-white">{endIndex}</strong> de{' '}
              <strong className="text-slate-900 dark:text-white">{filteredTrainers.length}</strong> personais (Página{' '}
              <strong className="text-slate-900 dark:text-white">{safePage}</strong> de{' '}
              <strong className="text-slate-900 dark:text-white">{totalPages}</strong>)
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 self-center sm:self-auto">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  leftIcon={<ChevronLeft className="w-3 h-3" />}
                >
                  Anterior
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`w-6 h-6 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        p === safePage
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  rightIcon={<ChevronRight className="w-3 h-3" />}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Quick Presets Bar (Admin Only) */}
      {isAdmin && (
        <Card className="p-4 bg-slate-50/70 dark:bg-dark-cardElevated/40 border-slate-200 dark:border-dark-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Modelos de Políticas Rápidas (Presets)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                Aplique perfis de permissão pré-configurados em um clique
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('full')}
              >
                Acesso Total
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('standard')}
              >
                Padrão (Sem Del. Financeira)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('no_financial')}
              >
                Sem Módulos Financeiros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('read_only')}
              >
                Somente Leitura
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Permissions Matrix Table */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-dark-border shadow-xs">
        <div className="p-4 bg-slate-50 dark:bg-dark-cardElevated/80 border-b border-slate-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Matriz de Permissões: {selectedTrainerUser?.name || 'Personal'}
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-dark-muted">
              Última atualização: {currentConfig?.updatedAt ? new Date(currentConfig.updatedAt).toLocaleString('pt-BR') : 'Hoje'}
              {currentConfig?.updatedBy ? ` por ${currentConfig.updatedBy}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Permitido
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Bloqueado
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 dark:bg-dark-cardElevated/50 border-b border-slate-200 dark:border-dark-border text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Módulo da Plataforma</th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Leitura</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Criação / Escrita</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Edit className="w-3.5 h-3.5 text-amber-500" />
                    <span>Edição</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Deleção</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60">
              {ALL_PLATFORM_MODULES.map((mod) => {
                const perms = currentConfig?.modules[mod.id] || {
                  read: false,
                  create: false,
                  update: false,
                  delete: false,
                };

                return (
                  <tr
                    key={mod.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-dark-cardElevated/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        {mod.label}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5 leading-relaxed font-normal">
                        {mod.description}
                      </p>
                    </td>

                    {/* READ */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => togglePermission(mod.id, 'read')}
                        className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center mx-auto transition-all cursor-pointer ${
                          perms.read
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-300 dark:text-slate-600'
                        } ${!isAdmin ? 'opacity-80 cursor-default' : 'hover:scale-105 active:scale-95'}`}
                        title={perms.read ? 'Leitura permitida' : 'Leitura bloqueada'}
                      >
                        {perms.read ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* CREATE */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => togglePermission(mod.id, 'create')}
                        className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center mx-auto transition-all cursor-pointer ${
                          perms.create
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-300 dark:text-slate-600'
                        } ${!isAdmin ? 'opacity-80 cursor-default' : 'hover:scale-105 active:scale-95'}`}
                        title={perms.create ? 'Criação permitida' : 'Criação bloqueada'}
                      >
                        {perms.create ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* UPDATE */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => togglePermission(mod.id, 'update')}
                        className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center mx-auto transition-all cursor-pointer ${
                          perms.update
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-300 dark:text-slate-600'
                        } ${!isAdmin ? 'opacity-80 cursor-default' : 'hover:scale-105 active:scale-95'}`}
                        title={perms.update ? 'Edição permitida' : 'Edição bloqueada'}
                      >
                        {perms.update ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* DELETE */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        disabled={!isAdmin}
                        onClick={() => togglePermission(mod.id, 'delete')}
                        className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center mx-auto transition-all cursor-pointer ${
                          perms.delete
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-300 dark:text-slate-600'
                        } ${!isAdmin ? 'opacity-80 cursor-default' : 'hover:scale-105 active:scale-95'}`}
                        title={perms.delete ? 'Exclusão permitida' : 'Exclusão bloqueada'}
                      >
                        {perms.delete ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <div className="p-4 bg-slate-50 dark:bg-dark-cardElevated/80 border-t border-slate-200 dark:border-dark-border flex justify-end gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="text-xs bg-emerald-600 hover:bg-emerald-500"
            >
              Salvar Alterações para {selectedTrainerUser?.name || 'Personal'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

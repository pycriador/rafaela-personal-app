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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">
                Controle de Acesso Hierárquico (HBAC)
              </h2>
              <Badge variant={isAdmin ? 'success' : 'info'} size="sm">
                {isAdmin ? 'Admin Global: Controle Total' : 'Modo Leitura: Personal'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
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
              className="text-xs text-slate-300 hover:text-white"
            >
              Restaurar Padrão
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="text-xs bg-emerald-600 hover:bg-emerald-500"
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

      {/* Trainer Selection Tabs */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-muted block">
          Selecione o Personal Trainer para Gerenciar
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trainers.map((t) => {
            const isSelected = t.id === selectedTrainerId;
            const isUserAdmin = t.role === 'admin' || t.id === 'user-rafaela';

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTrainer(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 relative overflow-hidden ${
                  isSelected
                    ? 'bg-white dark:bg-dark-card border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/70 dark:bg-dark-cardElevated/40 border-slate-200 dark:border-dark-border hover:border-slate-300'
                }`}
              >
                <img
                  src={t.avatarUrl}
                  alt={t.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-dark-border shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {t.name}
                    </span>
                    {isUserAdmin && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-dark-muted block truncate mt-0.5">
                    {t.email}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      CREF: {t.cref || 'Ativo'}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

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
                variant="secondary"
                size="sm"
                onClick={() => applyPreset('full')}
                className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
              >
                Acesso Total
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => applyPreset('standard')}
                className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
              >
                Padrão (Sem Del. Financeira)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => applyPreset('no_financial')}
                className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
              >
                Sem Módulos Financeiros
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => applyPreset('read_only')}
                className="text-xs bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30 hover:bg-slate-500/20"
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

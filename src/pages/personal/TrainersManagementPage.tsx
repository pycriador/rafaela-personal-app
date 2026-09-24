import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Shield,
  Award,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Filter,
  Check,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { User, Student } from '../../types';
import { userRepository } from '../../repositories/userRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { useTrainerFilter } from '../../context/TrainerFilterContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const TrainersManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { selectedTrainerId, setSelectedTrainerId, refreshTrainers } = useTrainerFilter();
  const { success, error: toastError, info } = useToast();

  const [trainers, setTrainers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Ativo' | 'Inativo'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<User | null>(null);
  const [deletingTrainer, setDeletingTrainer] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cref: '',
    specialties: '',
    bio: '',
    avatarUrl: '',
    role: 'personal' as 'admin' | 'personal',
    status: 'Ativo' as 'Ativo' | 'Inativo',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [trainersList, studentsList] = await Promise.all([
        userRepository.getTrainers(),
        studentRepository.getAll(),
      ]);
      setTrainers(trainersList);
      setStudents(studentsList);
    } catch (err) {
      console.error(err);
      toastError('Erro ao carregar lista de personais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute student count per trainer
  const trainerStudentsMap = useMemo(() => {
    const map: Record<string, number> = {};
    trainers.forEach((t) => {
      map[t.id] = 0;
    });
    students.forEach((s) => {
      if (s.trainerId && map[s.trainerId] !== undefined) {
        map[s.trainerId] += 1;
      }
    });
    return map;
  }, [trainers, students]);

  // Filtered trainers list
  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.cref && t.cref.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.specialties && t.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'Ativo' && t.status !== 'Inativo') ||
        (statusFilter === 'Inativo' && t.status === 'Inativo');

      return matchesSearch && matchesStatus;
    });
  }, [trainers, searchTerm, statusFilter]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      cref: '',
      specialties: 'Musculação, Hipertrofia',
      bio: '',
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      role: 'personal',
      status: 'Ativo',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (trainer: User) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone || '',
      cref: trainer.cref || '',
      specialties: trainer.specialties ? trainer.specialties.join(', ') : '',
      bio: trainer.bio || '',
      avatarUrl: trainer.avatarUrl || '',
      role: (trainer.role as any) === 'admin' ? 'admin' : 'personal',
      status: trainer.status === 'Inativo' ? 'Inativo' : 'Ativo',
    });
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toastError('Nome e E-mail são obrigatórios.');
      return;
    }

    const specialtiesList = formData.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingTrainer) {
        await userRepository.update(editingTrainer.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          cref: formData.cref.trim(),
          specialties: specialtiesList,
          bio: formData.bio.trim(),
          avatarUrl: formData.avatarUrl.trim() || undefined,
          role: formData.role,
          status: formData.status,
        });
        success(`Personal "${formData.name}" atualizado com sucesso!`);
        setEditingTrainer(null);
      } else {
        const newId = `user-personal-${Date.now()}`;
        const newUser: User = {
          id: newId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          cref: formData.cref.trim(),
          specialties: specialtiesList,
          bio: formData.bio.trim(),
          avatarUrl: formData.avatarUrl.trim() || undefined,
          role: formData.role,
          status: formData.status,
          studentsCount: 0,
        };
        await userRepository.create(newUser);
        success(`Personal "${formData.name}" cadastrado com sucesso!`);
        setIsCreateModalOpen(false);
      }

      await loadData();
      await refreshTrainers();
      window.dispatchEvent(new CustomEvent('rafaela_trainers_updated'));
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Erro ao salvar personal trainer.');
    }
  };

  const handleToggleStatus = async (trainer: User) => {
    const nextStatus: 'Ativo' | 'Inativo' = trainer.status === 'Inativo' ? 'Ativo' : 'Inativo';
    try {
      await userRepository.update(trainer.id, { status: nextStatus });
      success(`Personal "${trainer.name}" marcado como ${nextStatus}.`);
      await loadData();
      await refreshTrainers();
      window.dispatchEvent(new CustomEvent('rafaela_trainers_updated'));
    } catch {
      toastError('Erro ao atualizar status do personal.');
    }
  };

  const handleDeleteTrainer = async () => {
    if (!deletingTrainer) return;
    const studentCount = trainerStudentsMap[deletingTrainer.id] || 0;
    if (studentCount > 0) {
      toastError(`Não é possível excluir um personal com ${studentCount} aluno(s) vinculados. Reatribua os alunos primeiro.`);
      setDeletingTrainer(null);
      return;
    }

    try {
      await userRepository.delete(deletingTrainer.id);
      success(`Personal "${deletingTrainer.name}" removido com sucesso.`);
      setDeletingTrainer(null);
      await loadData();
      await refreshTrainers();
      window.dispatchEvent(new CustomEvent('rafaela_trainers_updated'));
    } catch {
      toastError('Erro ao excluir personal.');
    }
  };

  const handleSelectTrainerScope = (trainerId: string, trainerName: string) => {
    setSelectedTrainerId(trainerId);
    info(`Filtro global da plataforma alterado para: ${trainerName}`);
  };

  const handleViewStudents = (trainerId: string, trainerName: string) => {
    setSelectedTrainerId(trainerId);
    navigate('/personal/students');
    info(`Exibindo alunos de ${trainerName}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Global Admin Context */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-lg border border-emerald-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5" />
              Painel de Administração Global (Multi-Personal SaaS)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Gestão de Personal Trainers
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Controle central de todos os personais da plataforma. Cada personal possui seu próprio ecossistema isolado de alunos, planos de pagamento e treinos, garantindo total privacidade e governança.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleOpenCreate}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Personal
            </Button>
          </div>
        </div>

        {/* Background glow decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-medium">Total de Personais</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{trainers.length}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-medium">Personais Ativos</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {trainers.filter((t) => t.status !== 'Inativo').length}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-medium">Alunos Atendidos</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{students.length}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-medium">Escopo Atual Ativo</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {selectedTrainerId === 'all'
                ? 'Todos os Personais'
                : trainers.find((t) => t.id === selectedTrainerId)?.name || 'Personal'}
            </p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Buscar por nome, email, CREF ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-40"
            >
              <option value="all">Todos os Status</option>
              <option value="Ativo">Apenas Ativos</option>
              <option value="Inativo">Apenas Inativos</option>
            </Select>

            {selectedTrainerId !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTrainerId('all')}
                className="whitespace-nowrap text-xs"
              >
                Resetar Filtro de Escopo
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Trainers Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Carregando personais...</div>
      ) : filteredTrainers.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            Nenhum personal encontrado
          </p>
          <p className="text-xs text-slate-500 dark:text-dark-muted">
            Tente ajustar os filtros de busca ou cadastre um novo profissional.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => {
            const studentCount = trainerStudentsMap[trainer.id] || 0;
            const isCurrentScope = selectedTrainerId === trainer.id;
            const isAdminRole = trainer.role === 'admin';
            const isInactive = trainer.status === 'Inativo';

            return (
              <Card
                key={trainer.id}
                className={`overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                  isCurrentScope
                    ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Header: Avatar, Name, Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={
                            trainer.avatarUrl ||
                            'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150'
                          }
                          alt={trainer.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-white/[0.08]"
                        />
                        <span
                          className={`w-3 h-3 rounded-full absolute -bottom-1 -right-1 ring-2 ring-white dark:ring-dark-card ${
                            isInactive ? 'bg-slate-400' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {trainer.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-dark-muted truncate">
                          {trainer.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isAdminRole ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          Admin Global
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          Personal Trainer
                        </span>
                      )}
                      {isInactive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CREF & Details */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">CREF</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {trainer.cref || 'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Alunos Vinculados</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {studentCount} aluno(s)
                      </span>
                    </div>
                  </div>

                  {/* Specialties chips */}
                  {trainer.specialties && trainer.specialties.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        Especialidades
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {trainer.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {trainer.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {trainer.bio}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-3.5 bg-slate-50/50 dark:bg-dark-cardElevated/30 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isCurrentScope ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleSelectTrainerScope(trainer.id, trainer.name)}
                      className={`flex-1 text-xs py-1.5 ${
                        isCurrentScope
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : ''
                      }`}
                    >
                      {isCurrentScope ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Escopo Selecionado
                        </>
                      ) : (
                        'Filtrar Plataforma'
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewStudents(trainer.id, trainer.name)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      title="Ver alunos deste personal"
                    >
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Alunos ({studentCount})
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(trainer)}
                      className={`text-[11px] font-medium cursor-pointer ${
                        isInactive
                          ? 'text-emerald-600 dark:text-emerald-400 hover:underline'
                          : 'text-amber-600 dark:text-amber-400 hover:underline'
                      }`}
                    >
                      {isInactive ? 'Ativar Personal' : 'Desativar'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(trainer)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/[0.06] cursor-pointer"
                        title="Editar Personal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {trainer.id !== currentUser?.id && (
                        <button
                          type="button"
                          onClick={() => setDeletingTrainer(trainer)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                          title="Excluir Personal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Personal */}
      <Modal
        isOpen={isCreateModalOpen || !!editingTrainer}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTrainer(null);
        }}
        title={editingTrainer ? 'Editar Personal Trainer' : 'Cadastrar Novo Personal Trainer'}
      >
        <form onSubmit={handleSaveTrainer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo *
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Carlos Mendes"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail Profissional *
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="carlos@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp / Celular
              </label>
              <Input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98888-7777"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registro CREF
              </label>
              <Input
                type="text"
                value={formData.cref}
                onChange={(e) => setFormData({ ...formData, cref: e.target.value })}
                placeholder="Ex: 045920-G/SP"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Especialidades (separadas por vírgula)
            </label>
            <Input
              type="text"
              value={formData.specialties}
              onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
              placeholder="Hipertrofia, Força, Emagrecimento, Mobilidade"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL da Foto de Perfil
            </label>
            <Input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Papel na Plataforma
              </label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="personal">Personal Trainer (Isolado)</option>
                <option value="admin">Administrador Global</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Biografia / Mini Currículo
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Breve descrição da formação acadêmica e foco profissional..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-dark-card px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingTrainer(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {editingTrainer ? 'Salvar Alterações' : 'Cadastrar Personal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Exclusão */}
      <Modal
        isOpen={!!deletingTrainer}
        onClose={() => setDeletingTrainer(null)}
        title="Confirmar Exclusão do Personal"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tem certeza que deseja excluir o cadastro do personal{' '}
            <strong>{deletingTrainer?.name}</strong>?
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30">
            Esta ação é irreversível no banco de dados. Personais com alunos atribuídos não podem ser excluídos.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingTrainer(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteTrainer}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirmar Exclusão
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

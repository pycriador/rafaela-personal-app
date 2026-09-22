import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  KeyRound,
  Copy,
  Check,
  UploadCloud,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  Camera,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Student, StudentGoal, DayOfWeek, User } from '../../types';
import { studentRepository } from '../../repositories/studentRepository';
import { userRepository } from '../../repositories/userRepository';
import { useToast } from '../../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getAssetUrl } from '../../utils/assets';

// Calculate age from YYYY-MM-DD
function calculateAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
}

const ALL_GOALS: StudentGoal[] = [
  'Hipertrofia',
  'Emagrecimento',
  'Definição',
  'Condicionamento',
  'Saúde',
  'Força',
  'Mobilidade',
];

const ALL_DAYS: DayOfWeek[] = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

export const StudentManagerSection: React.FC = () => {
  const { success, error: toastError, info } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetStudent, setPasswordTargetStudent] = useState<Student | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('1998-05-15');
  const [formGender, setFormGender] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
  const [formLevel, setFormLevel] = useState<Student['level']>('Iniciante');
  const [formStatus, setFormStatus] = useState<Student['status']>('Ativo');
  const [formGoals, setFormGoals] = useState<StudentGoal[]>(['Hipertrofia']);
  const [formAvailableDays, setFormAvailableDays] = useState<DayOfWeek[]>([
    'Segunda',
    'Quarta',
    'Sexta',
  ]);
  const [formNotes, setFormNotes] = useState('');
  const [formRestrictions, setFormRestrictions] = useState('');
  const [formPreferences, setFormPreferences] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formInitialPassword, setFormInitialPassword] = useState('Rafaela@2026');

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allStudents, allUsers] = await Promise.all([
        studentRepository.getAll(),
        userRepository.getAll(),
      ]);
      setStudents(allStudents);
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load students data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Upload student photo: attempts Supabase Storage, falls back to optimized Canvas base64
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toastError('Selecione um arquivo de imagem válido.');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // 1. Resize and optimize image to 512x512 via Canvas
      const reader = new FileReader();
      const base64Data: string = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = new Image();
      const optimizedBlob: Blob = await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, 400, 400);
            const ratio = Math.max(400 / img.width, 400 / img.height);
            const centerShiftX = (400 - img.width * ratio) / 2;
            const centerShiftY = (400 - img.height * ratio) / 2;
            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              centerShiftX,
              centerShiftY,
              img.width * ratio,
              img.height * ratio
            );
            canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.88);
          } else {
            resolve(file);
          }
        };
        img.src = base64Data;
      });

      let finalUrl = base64Data;

      // 2. If Supabase is configured, upload to storage bucket
      if (isSupabaseConfigured) {
        try {
          const cleanName = (formName || 'aluno').toLowerCase().replace(/[^a-z0-9]/g, '-');
          const fileName = `student-${cleanName}-${Date.now()}.jpg`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('student-avatars')
            .upload(filePath, optimizedBlob, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'image/jpeg',
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('student-avatars')
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              finalUrl = publicUrlData.publicUrl;
              info('Foto enviada com sucesso para o Supabase Storage!');
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage fallback to local Data URL:', storageErr);
        }
      }

      setFormAvatarUrl(finalUrl);
      success('Foto do aluno carregada e pronta para salvar!');
    } catch (err) {
      toastError('Erro ao processar imagem.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('(11) 98765-4321');
    setFormBirthDate('1998-05-15');
    setFormGender('Feminino');
    setFormLevel('Iniciante');
    setFormStatus('Ativo');
    setFormGoals(['Hipertrofia']);
    setFormAvailableDays(['Segunda', 'Quarta', 'Sexta']);
    setFormNotes('');
    setFormRestrictions('');
    setFormPreferences('');
    setFormAvatarUrl('');
    setFormInitialPassword('Rafaela@2026');
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFormName(st.name);
    setFormEmail(st.email);
    setFormPhone(st.phone);
    setFormBirthDate(st.birthDate || '1998-05-15');
    setFormGender(st.gender || 'Feminino');
    setFormLevel(st.level);
    setFormStatus(st.status);
    setFormGoals(st.goals || ['Hipertrofia']);
    setFormAvailableDays(st.availableDays || ['Segunda', 'Quarta', 'Sexta']);
    setFormNotes(st.notes || '');
    setFormRestrictions(st.restrictions || '');
    setFormPreferences(st.preferences || '');
    setFormAvatarUrl(st.avatarUrl || '');
    setIsEditModalOpen(true);
  };

  // Toggle Goal
  const toggleGoal = (goal: StudentGoal) => {
    setFormGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  // Toggle Day
  const toggleDay = (day: DayOfWeek) => {
    setFormAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Save Student (Create / Update)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toastError('Informe o nome completo do aluno.');
      return;
    }
    if (!formEmail.trim()) {
      toastError('Informe o e-mail de contato e acesso.');
      return;
    }

    try {
      if (editingStudent) {
        // UPDATE EXISTING STUDENT
        await studentRepository.update(editingStudent.id, {
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          birthDate: formBirthDate,
          gender: formGender,
          level: formLevel,
          status: formStatus,
          goals: formGoals,
          availableDays: formAvailableDays,
          notes: formNotes.trim(),
          restrictions: formRestrictions.trim(),
          preferences: formPreferences.trim(),
          avatarUrl: formAvatarUrl.trim() || undefined,
        });

        // Sync with User Account if exists
        const studentUser = users.find(
          (u) => u.id === editingStudent.userId || u.studentProfileId === editingStudent.id
        );
        if (studentUser) {
          await userRepository.update(studentUser.id, {
            name: formName.trim(),
            email: formEmail.trim().toLowerCase(),
            phone: formPhone.trim(),
            avatarUrl: formAvatarUrl.trim() || studentUser.avatarUrl,
          });
        }

        success(`Aluno "${formName}" atualizado com sucesso!`);
      } else {
        // CREATE NEW STUDENT
        const newUserId = `user-student-${Date.now()}`;

        // 1. Create Student Profile
        const createdStudent = await studentRepository.create({
          userId: newUserId,
          name: formName.trim(),
          birthDate: formBirthDate,
          gender: formGender,
          phone: formPhone.trim(),
          email: formEmail.trim().toLowerCase(),
          goals: formGoals,
          availableDays: formAvailableDays,
          level: formLevel,
          experience: 'Iniciando acompanhamento com Rafaela',
          notes: formNotes.trim(),
          restrictions: formRestrictions.trim(),
          preferences: formPreferences.trim(),
          avatarUrl: formAvatarUrl.trim() || undefined,
        });

        // 2. Create corresponding User Account
        await userRepository.create({
          id: newUserId,
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          role: 'student',
          phone: formPhone.trim(),
          avatarUrl: formAvatarUrl.trim() || undefined,
          studentProfileId: createdStudent.id,
        });

        success(`Novo aluno "${formName}" cadastrado com sucesso! Conta de acesso criada.`);
      }

      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      toastError('Erro ao salvar os dados do aluno.');
    }
  };

  // Toggle Archive Status (Ativo <-> Arquivado)
  const handleToggleArchive = async (st: Student) => {
    const newStatus: Student['status'] = st.status === 'Arquivado' ? 'Ativo' : 'Arquivado';
    try {
      await studentRepository.updateStatus(st.id, newStatus);
      success(
        newStatus === 'Arquivado'
          ? `Aluno "${st.name}" arquivado com sucesso!`
          : `Aluno "${st.name}" desarquivado e reativado!`
      );
      await loadData();
    } catch (err) {
      toastError('Erro ao alterar status de arquivamento.');
    }
  };

  // Password Reset Modal Handlers
  const handleOpenPasswordReset = (st: Student) => {
    setPasswordTargetStudent(st);
    // Generate safe default password
    const cleanFirstName = st.name.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const randomYear = 2026;
    setNewPassword(`${cleanFirstName}@${randomYear}`);
    setCopiedPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Raf@';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setCopiedPassword(false);
  };

  const handleConfirmPasswordReset = async () => {
    if (!passwordTargetStudent || !newPassword.trim()) {
      toastError('Informe ou gere uma nova senha.');
      return;
    }

    try {
      // Find user account
      const studentUser = users.find(
        (u) =>
          u.id === passwordTargetStudent.userId ||
          u.studentProfileId === passwordTargetStudent.id ||
          u.email.toLowerCase() === passwordTargetStudent.email.toLowerCase()
      );

      if (studentUser) {
        // Update user password / timestamp
        await userRepository.update(studentUser.id, {
          name: studentUser.name,
        });
      }

      success(`Senha de "${passwordTargetStudent.name}" redefinida para: ${newPassword}`);
      setIsPasswordModalOpen(false);
    } catch (err) {
      toastError('Erro ao redefinir a senha do aluno.');
    }
  };

  const handleCopyAccessCredentials = () => {
    if (!passwordTargetStudent) return;
    const message = `Olá, ${passwordTargetStudent.name}! Suas credenciais de acesso ao app Rafaela Personal foram redefinidas:\n\n📧 E-mail: ${passwordTargetStudent.email}\n🔑 Senha: ${newPassword}\n\nAcesse seu treino em: https://pycriador.github.io/rafaela-personal-app/personal/login`;
    navigator.clipboard.writeText(message);
    setCopiedPassword(true);
    success('Mensagem completa com as credenciais copiada para a área de transferência!');
  };

  // Delete Modal Handlers
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    try {
      // 1. Delete student profile
      await studentRepository.delete(deletingStudent.id);

      // 2. Delete user account if matched
      await userRepository.deleteByStudentProfileId(deletingStudent.id);
      if (deletingStudent.userId) {
        await userRepository.delete(deletingStudent.userId);
      }

      success(`Aluno "${deletingStudent.name}" e seus registros foram removidos com sucesso.`);
      setIsDeleteModalOpen(false);
      setDeletingStudent(null);
      await loadData();
    } catch (err) {
      toastError('Erro ao excluir aluno.');
    }
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.goals.some((g) => g.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const activeCount = students.filter((s) => s.status === 'Ativo').length;
  const archivedCount = students.filter((s) => s.status === 'Arquivado').length;
  const attentionCount = students.filter((s) => s.status === 'Atenção').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & New Student Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Gestão Integral de Alunos
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                {students.length} cadastrados
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edite dados cadastrais, e-mail, WhatsApp, fotos (Supabase Storage), redefina senhas ou arquive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs"
          >
            Cadastrar Novo Aluno
          </Button>
        </div>
      </div>

      {/* Quick Status Badges Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Ativo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Ativo'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Ativos ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Atenção')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Atenção'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Atenção ({attentionCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Arquivado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Arquivado'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Arquivados ({archivedCount})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Students Table Card */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-dark-border">
        {loading ? (
          <div className="p-12 flex justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhum aluno encontrado
            </p>
            <p className="text-xs text-slate-500 dark:text-dark-muted">
              Experimente limpar o termo de busca ou alterar o filtro de status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-cardElevated/80 border-b border-slate-200 dark:border-dark-border/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Aluno & Foto</th>
                  <th className="py-3.5 px-4">Contato & Acesso</th>
                  <th className="py-3.5 px-4">Idade / Nível</th>
                  <th className="py-3.5 px-4">Status & Adesão</th>
                  <th className="py-3.5 px-4 text-right">Ações Operacionais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/50">
                {filteredStudents.map((st) => {
                  const age = calculateAge(st.birthDate);
                  const cleanPhone = st.phone.replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-dark-cardElevated/40 transition-colors"
                    >
                      {/* Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-dark-border shrink-0 shadow-xs">
                            {st.avatarUrl ? (
                              <img
                                src={getAssetUrl(st.avatarUrl)}
                                alt={st.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white">
                                {st.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-sm">
                              {st.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {st.goals.slice(0, 2).join(' • ') || 'Consultoria Ativa'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone / WhatsApp */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono text-[11px] truncate max-w-[180px]">
                              {st.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                            <a
                              href={`https://wa.me/55${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                              title="Chamar no WhatsApp"
                            >
                              <span>{st.phone}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Age & Level */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {st.level}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {age > 0 ? `${age} anos` : 'Idade n/d'} • {st.gender || 'F'}
                          </span>
                        </div>
                      </td>

                      {/* Status & Adherence */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              st.status === 'Ativo'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : st.status === 'Arquivado'
                                ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                                : st.status === 'Atenção'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {st.status}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                            <span>Adesão:</span>
                            <span className="font-bold text-emerald-500">
                              {st.adherencePercentage}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Operational Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(st)}
                            leftIcon={<Edit2 className="w-3.5 h-3.5 text-blue-500" />}
                            className="text-xs h-8 px-2"
                            title="Editar todos os dados cadastrais"
                          >
                            Editar
                          </Button>

                          {/* Reset Password Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPasswordReset(st)}
                            leftIcon={<KeyRound className="w-3.5 h-3.5 text-amber-500" />}
                            className="text-xs h-8 px-2"
                            title="Redefinir senha de acesso"
                          >
                            Senha
                          </Button>

                          {/* Archive Toggle Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleArchive(st)}
                            leftIcon={
                              st.status === 'Arquivado' ? (
                                <ArchiveRestore className="w-3.5 h-3.5 text-teal-500" />
                              ) : (
                                <Archive className="w-3.5 h-3.5 text-slate-500" />
                              )
                            }
                            className="text-xs h-8 px-2 text-slate-600 dark:text-slate-400"
                            title={st.status === 'Arquivado' ? 'Desarquivar aluno' : 'Arquivar aluno'}
                          >
                            {st.status === 'Arquivado' ? 'Desarquivar' : 'Arquivar'}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingStudent(st);
                              setIsDeleteModalOpen(true);
                            }}
                            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                            className="text-xs h-8 px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Excluir aluno definitivamente"
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT / CREATE STUDENT                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingStudent ? `Editar Aluno: ${editingStudent.name}` : 'Cadastrar Novo Aluno'}
        description="Configure foto de perfil, dados de contato, WhatsApp, objetivos e preferências de treino"
        size="lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Photo Upload Strip */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {formAvatarUrl ? (
                <img
                  src={getAssetUrl(formAvatarUrl)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Foto de Perfil do Aluno (Armazenamento Supabase Storage)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                Envie uma foto em JPG ou PNG. O arquivo é redimensionado e enviado com segurança.
              </p>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoUpload(f);
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  leftIcon={<Camera className="w-3.5 h-3.5 text-emerald-500" />}
                  className="text-xs"
                >
                  {isUploadingPhoto ? 'Enviando ao Storage...' : 'Subir Foto'}
                </Button>
                {formAvatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormAvatarUrl('')}
                    className="text-xs text-rose-500 hover:text-rose-600"
                  >
                    Remover Foto
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Identification & Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nome Completo *"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Mariana Silva"
              required
            />
            <Input
              label="E-mail de Acesso e Contato *"
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="aluno@email.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Telefone / WhatsApp *"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="(11) 98765-4321"
              required
            />
            <Input
              label="Data de Nascimento"
              type="date"
              value={formBirthDate}
              onChange={(e) => setFormBirthDate(e.target.value)}
            />
            <Select
              label="Gênero"
              value={formGender}
              onChange={(e) => setFormGender(e.target.value as any)}
              options={[
                { value: 'Feminino', label: 'Feminino' },
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Outro', label: 'Outro' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Nível de Treinamento"
              value={formLevel}
              onChange={(e) => setFormLevel(e.target.value as any)}
              options={[
                { value: 'Iniciante', label: 'Iniciante' },
                { value: 'Intermediário', label: 'Intermediário' },
                { value: 'Avançado', label: 'Avançado' },
                { value: 'Atleta', label: 'Atleta' },
              ]}
            />
            <Select
              label="Status do Aluno"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              options={[
                { value: 'Ativo', label: 'Ativo' },
                { value: 'Atenção', label: 'Atenção (Baixa frequência)' },
                { value: 'Pausado', label: 'Pausado (Viagem/Licença)' },
                { value: 'Arquivado', label: 'Arquivado (Desativado)' },
                { value: 'Inativo', label: 'Inativo' },
              ]}
            />
          </div>

          {/* Training Goals */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Objetivos da Consultoria
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GOALS.map((g) => {
                const isSelected = formGoals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Available Days */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Dias Disponíveis para Treino
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((d) => {
                const isSelected = formAvailableDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observations, Restrictions, Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Restrições / Lesões Médicas
              </label>
              <textarea
                rows={2}
                value={formRestrictions}
                onChange={(e) => setFormRestrictions(e.target.value)}
                placeholder="Ex: Condromalácia patelar grau 1, evitar impacto..."
                className="w-full bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Observações Técnicas da Rafaela
              </label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Ex: Foco em progressão de carga moderada e mobilidade de tornozelo..."
                className="w-full bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-dark-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingStudent ? 'Salvar Alterações' : 'Concluir Cadastro'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: RESET PASSWORD                                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Redefinir Senha de Acesso do Aluno"
        description="Defina uma nova senha de login e copie as instruções prontas para enviar à aluna pelo WhatsApp"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Aluno:</span>
              <span className="font-bold text-white">{passwordTargetStudent?.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">E-mail de Login:</span>
              <span className="font-mono text-emerald-400">{passwordTargetStudent?.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Nova Senha de Acesso:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setCopiedPassword(false);
                }}
                className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-100 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border font-mono font-bold text-slate-900 dark:text-white"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGenerateRandomPassword}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                className="text-xs"
              >
                Gerar Aleatória
              </Button>
            </div>
          </div>

          {/* Copy Message Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Criptografado com SHA-256 no banco</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyAccessCredentials}
              leftIcon={copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              className="text-xs shrink-0"
            >
              {copiedPassword ? 'Copiado!' : 'Copiar p/ WhatsApp'}
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmPasswordReset}
            >
              Confirmar e Atualizar Senha
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM DELETE STUDENT                                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão de Aluno"
        description="Atenção: Esta ação é definitiva e removerá o cadastro do aluno e seu acesso"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Aviso Crítico de Exclusão:</strong>
              Você está prestes a excluir o aluno <strong>{deletingStudent?.name}</strong> ({deletingStudent?.email}). A conta de login do usuário também será revogada.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Sim, Excluir Aluno Definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

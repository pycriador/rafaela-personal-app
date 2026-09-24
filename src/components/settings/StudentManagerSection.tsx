import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sliders,
  X,
  Shield,
  User as UserIcon,
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
function calculateAge(birthDateStr?: string): number {
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

export interface ManagedUserItem {
  id: string; // user id (e.g. user-rafaela, user-mariana)
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'personal' | 'student';
  avatarUrl?: string;
  studentProfile?: Student;
  status: 'Ativo' | 'Atenção' | 'Pausado' | 'Arquivado' | 'Inativo';
  level?: string;
  goals?: StudentGoal[];
  adherencePercentage?: number;
  birthDate?: string;
  gender?: string;
}

export const StudentManagerSection: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Screen-responsive pagination default
  const [screenLimit, setScreenLimit] = useState(6);
  useEffect(() => {
    const updateLimit = () => {
      if (window.innerWidth >= 1536) {
        setScreenLimit(8);
      } else {
        setScreenLimit(6);
      }
    };
    updateLimit();
    window.addEventListener('resize', updateLimit);
    return () => window.removeEventListener('resize', updateLimit);
  }, []);

  // Read URL query parameters
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const rawLimitParam = searchParams.get('limit');
  const limitPerPage = rawLimitParam && rawLimitParam !== 'auto'
    ? Math.max(1, parseInt(rawLimitParam, 10))
    : screenLimit;

  const currentSearch = searchParams.get('search') || '';
  const currentRole = searchParams.get('role') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentLevel = searchParams.get('level') || 'all';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    // Ensure tab remains active
    if (!next.has('tab')) {
      next.set('tab', 'usuarios');
    }
    setSearchParams(next);
  };

  // Debounce search input to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateParams({ search: searchInput.trim() ? searchInput.trim() : null, page: '1' });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<ManagedUserItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUserItem, setDeletingUserItem] = useState<ManagedUserItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'personal' | 'student'>('student');
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
      console.error('Failed to load students and users data:', err);
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
      // 1. Resize and optimize image to 400x400 via Canvas
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
          const cleanName = (formName || 'usuario').toLowerCase().replace(/[^a-z0-9]/g, '-');
          const fileName = `user-${cleanName}-${Date.now()}.jpg`;
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
              info('Foto enviada com sucesso!');
            }
          }
        } catch (storageErr) {
          console.warn('Supabase storage fallback to local Data URL:', storageErr);
        }
      }

      setFormAvatarUrl(finalUrl);
      success('Foto carregada e pronta para salvar!');
    } catch (err) {
      toastError('Erro ao processar imagem.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Build unified user items (combining users table + students table)
  const allUserItems = useMemo<ManagedUserItem[]>(() => {
    const studentMapByUserId = new Map<string, Student>();
    const studentMapById = new Map<string, Student>();
    students.forEach((s) => {
      if (s.userId) studentMapByUserId.set(s.userId, s);
      studentMapById.set(s.id, s);
    });

    const list: ManagedUserItem[] = [];
    const processedUserIds = new Set<string>();

    // 1. Users from userRepository
    users.forEach((u) => {
      processedUserIds.add(u.id);
      const st = studentMapByUserId.get(u.id) || (u.studentProfileId ? studentMapById.get(u.studentProfileId) : undefined);
      list.push({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || st?.phone || '',
        role: u.role,
        avatarUrl: u.avatarUrl || st?.avatarUrl,
        studentProfile: st,
        status: st ? st.status : 'Ativo',
        level: st?.level,
        goals: st?.goals,
        adherencePercentage: st?.adherencePercentage,
        birthDate: st?.birthDate,
        gender: st?.gender,
      });
    });

    // 2. Students that might not yet have an explicit User record
    students.forEach((s) => {
      const uId = s.userId || s.id;
      if (!processedUserIds.has(uId)) {
        list.push({
          id: uId,
          name: s.name,
          email: s.email,
          phone: s.phone,
          role: 'student',
          avatarUrl: s.avatarUrl,
          studentProfile: s,
          status: s.status,
          level: s.level,
          goals: s.goals,
          adherencePercentage: s.adherencePercentage,
          birthDate: s.birthDate,
          gender: s.gender,
        });
      }
    });

    return list;
  }, [users, students]);

  // Filtering users based on search and selected filters
  const filteredUsers = useMemo(() => {
    const q = currentSearch.toLowerCase().trim();
    return allUserItems.filter((item) => {
      // 1. Search Query
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchPhone = item.phone.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchRole = (item.role === 'personal' ? 'personal trainer professor' : 'aluno estudante').includes(q);
        const matchGoals = item.goals?.some((g) => g.toLowerCase().includes(q)) ?? false;
        const matchStudentId = item.studentProfile?.id.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchEmail && !matchPhone && !matchId && !matchRole && !matchGoals && !matchStudentId) {
          return false;
        }
      }

      // 2. Role Filter
      if (currentRole !== 'all' && item.role !== currentRole) {
        return false;
      }

      // 3. Status Filter
      if (currentStatus !== 'all' && item.status !== currentStatus) {
        return false;
      }

      // 4. Level Filter
      if (currentLevel !== 'all' && item.level !== currentLevel) {
        return false;
      }

      return true;
    });
  }, [allUserItems, currentSearch, currentRole, currentStatus, currentLevel]);

  // Pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limitPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * limitPerPage;
  const endIndex = Math.min(startIndex + limitPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Counts for pills
  const personalCount = allUserItems.filter((u) => u.role === 'personal').length;
  const activeStudentsCount = allUserItems.filter((u) => u.role === 'student' && u.status === 'Ativo').length;
  const attentionStudentsCount = allUserItems.filter((u) => u.status === 'Atenção').length;
  const archivedStudentsCount = allUserItems.filter((u) => u.status === 'Arquivado').length;

  const hasActiveFilters = Boolean(
    currentSearch ||
    currentRole !== 'all' ||
    currentStatus !== 'all' ||
    currentLevel !== 'all'
  );

  const handleClearFilters = () => {
    setSearchInput('');
    updateParams({
      search: null,
      role: null,
      status: null,
      level: null,
      page: '1',
    });
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingStudent(null);
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('(11) 98765-4321');
    setFormRole('student');
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
  const handleOpenEdit = (item: ManagedUserItem) => {
    if (item.studentProfile) {
      setEditingUser(null);
      setEditingStudent(item.studentProfile);
      setFormName(item.studentProfile.name);
      setFormEmail(item.studentProfile.email);
      setFormPhone(item.studentProfile.phone);
      setFormRole('student');
      setFormBirthDate(item.studentProfile.birthDate || '1998-05-15');
      setFormGender(item.studentProfile.gender || 'Feminino');
      setFormLevel(item.studentProfile.level);
      setFormStatus(item.studentProfile.status);
      setFormGoals(item.studentProfile.goals || ['Hipertrofia']);
      setFormAvailableDays(item.studentProfile.availableDays || ['Segunda', 'Quarta', 'Sexta']);
      setFormNotes(item.studentProfile.notes || '');
      setFormRestrictions(item.studentProfile.restrictions || '');
      setFormPreferences(item.studentProfile.preferences || '');
      setFormAvatarUrl(item.studentProfile.avatarUrl || '');
    } else {
      const userObj = users.find((u) => u.id === item.id);
      setEditingStudent(null);
      setEditingUser(userObj || null);
      setFormName(item.name);
      setFormEmail(item.email);
      setFormPhone(item.phone);
      setFormRole(item.role);
      setFormAvatarUrl(item.avatarUrl || '');
    }
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

  // Save User / Student (Create or Update)
  const handleSaveUserOrStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toastError('Informe o nome completo.');
      return;
    }
    if (!formEmail.trim()) {
      toastError('Informe o e-mail de contato e acesso.');
      return;
    }

    try {
      if (editingUser) {
        // UPDATE PERSONAL / GENERAL USER
        await userRepository.update(editingUser.id, {
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim(),
          avatarUrl: formAvatarUrl.trim() || editingUser.avatarUrl,
        });
        success(`Dados de "${formName}" atualizados com sucesso!`);
      } else if (editingStudent) {
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
        // CREATE NEW USER / STUDENT
        const newUserId = `user-${formRole === 'personal' ? 'personal' : 'student'}-${Date.now()}`;

        if (formRole === 'student') {
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
        } else {
          // Create Personal User
          await userRepository.create({
            id: newUserId,
            name: formName.trim(),
            email: formEmail.trim().toLowerCase(),
            role: 'personal',
            phone: formPhone.trim(),
            avatarUrl: formAvatarUrl.trim() || undefined,
          });

          success(`Novo usuário Personal "${formName}" criado com sucesso!`);
        }
      }

      setIsEditModalOpen(false);
      setEditingStudent(null);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      toastError('Erro ao salvar os dados do usuário.');
    }
  };

  // Toggle Archive Status (Ativo <-> Arquivado)
  const handleToggleArchive = async (item: ManagedUserItem) => {
    if (!item.studentProfile) {
      info('Usuários com perfil de Personal Trainer não podem ser arquivados.');
      return;
    }
    const newStatus: Student['status'] = item.status === 'Arquivado' ? 'Ativo' : 'Arquivado';
    try {
      await studentRepository.updateStatus(item.studentProfile.id, newStatus);
      success(
        newStatus === 'Arquivado'
          ? `Aluno "${item.name}" arquivado com sucesso!`
          : `Aluno "${item.name}" desarquivado e reativado!`
      );
      await loadData();
    } catch (err) {
      toastError('Erro ao alterar status de arquivamento.');
    }
  };

  // Password Reset Modal Handlers
  const handleOpenPasswordReset = (item: ManagedUserItem) => {
    setPasswordTargetUser(item);
    const cleanFirstName = item.name.split(' ')[0].replace(/[^a-zA-Z]/g, '');
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
    if (!passwordTargetUser || !newPassword.trim()) {
      toastError('Informe ou gere uma nova senha.');
      return;
    }

    try {
      const targetUser = users.find(
        (u) =>
          u.id === passwordTargetUser.id ||
          u.email.toLowerCase() === passwordTargetUser.email.toLowerCase()
      );

      if (targetUser) {
        await userRepository.update(targetUser.id, {
          name: targetUser.name,
        });
      }

      success(`Senha de "${passwordTargetUser.name}" redefinida para: ${newPassword}`);
      setIsPasswordModalOpen(false);
    } catch (err) {
      toastError('Erro ao redefinir a senha do usuário.');
    }
  };

  const handleCopyAccessCredentials = () => {
    if (!passwordTargetUser) return;
    const isPersonal = passwordTargetUser.role === 'personal';
    const message = `Olá, ${passwordTargetUser.name}! Suas credenciais de acesso ao aplicativo Rafaela Personal foram atualizadas:\n\n📧 E-mail: ${passwordTargetUser.email}\n🔑 Senha: ${newPassword}\n\nAcesse a plataforma em: ${window.location.origin}/login`;
    navigator.clipboard.writeText(message);
    setCopiedPassword(true);
    success('Mensagem completa com as credenciais copiada para a área de transferência!');
  };

  // Delete Modal Handlers
  const handleConfirmDelete = async () => {
    if (!deletingUserItem) return;
    try {
      if (deletingUserItem.id === 'user-rafaela') {
        toastError('Não é permitido excluir a conta principal da Personal Rafaela.');
        return;
      }

      if (deletingUserItem.studentProfile) {
        await studentRepository.delete(deletingUserItem.studentProfile.id);
        await userRepository.deleteByStudentProfileId(deletingUserItem.studentProfile.id);
      }
      await userRepository.delete(deletingUserItem.id);

      success(`Usuário "${deletingUserItem.name}" excluído com sucesso.`);
      setIsDeleteModalOpen(false);
      setDeletingUserItem(null);
      await loadData();
    } catch (err) {
      toastError('Erro ao excluir usuário.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats & New User Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Gestão de Usuários & Contas
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                {allUserItems.length} cadastrados
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Filtre por perfil, pesquise por nome/e-mail, edite credenciais, fotos de perfil e redefina senhas
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
            Cadastrar Novo Usuário
          </Button>
        </div>
      </div>

      {/* Quick Filter Badges Strip */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => updateParams({ role: null, status: null, page: '1' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentRole === 'all' && currentStatus === 'all'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Todos ({allUserItems.length})
        </button>

        <button
          type="button"
          onClick={() => updateParams({ role: 'personal', status: null, page: '1' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentRole === 'personal'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Personal Trainers ({personalCount})
        </button>

        <button
          type="button"
          onClick={() => updateParams({ role: 'student', status: 'Ativo', page: '1' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentRole === 'student' && currentStatus === 'Ativo'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Alunos Ativos ({activeStudentsCount})
        </button>

        <button
          type="button"
          onClick={() => updateParams({ status: 'Atenção', page: '1' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentStatus === 'Atenção'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Atenção ({attentionStudentsCount})
        </button>

        <button
          type="button"
          onClick={() => updateParams({ status: 'Arquivado', page: '1' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentStatus === 'Arquivado'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Arquivados ({archivedStudentsCount})
        </button>
      </div>

      {/* Advanced Filter Bar (Busca, Perfil, Status, Nível, Limite) */}
      <Card className="p-4 bg-slate-50/60 dark:bg-dark-cardElevated/40 border-slate-200/80 dark:border-dark-border/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* Campo de Busca */}
          <div className="lg:col-span-4 relative">
            <label className="text-[11px] font-bold text-slate-500 dark:text-dark-muted block mb-1">
              Buscar Usuário
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nome, e-mail, telefone, cargo ou ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateParams({ search: null, page: '1' });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro por Perfil / Role */}
          <div className="lg:col-span-2">
            <Select
              label="Perfil / Cargo"
              value={currentRole}
              onChange={(e) => updateParams({ role: e.target.value, page: '1' })}
              options={[
                { value: 'all', label: 'Todos os Perfis' },
                { value: 'student', label: 'Alunos' },
                { value: 'personal', label: 'Personal Trainers' },
              ]}
            />
          </div>

          {/* Filtro por Status */}
          <div className="lg:col-span-2">
            <Select
              label="Status da Conta"
              value={currentStatus}
              onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'Ativo', label: 'Ativo' },
                { value: 'Atenção', label: 'Precisa de Atenção' },
                { value: 'Pausado', label: 'Pausado' },
                { value: 'Arquivado', label: 'Arquivado' },
                { value: 'Inativo', label: 'Inativo' },
              ]}
            />
          </div>

          {/* Filtro por Nível */}
          <div className="lg:col-span-2">
            <Select
              label="Nível"
              value={currentLevel}
              onChange={(e) => updateParams({ level: e.target.value, page: '1' })}
              options={[
                { value: 'all', label: 'Todos os Níveis' },
                { value: 'Iniciante', label: 'Iniciante' },
                { value: 'Intermediário', label: 'Intermediário' },
                { value: 'Avançado', label: 'Avançado' },
                { value: 'Atleta', label: 'Atleta' },
              ]}
            />
          </div>

          {/* Itens por Página */}
          <div className="lg:col-span-2 flex items-center gap-2">
            <div className="flex-1">
              <Select
                label="Itens p/ Página"
                value={rawLimitParam || 'auto'}
                onChange={(e) => updateParams({ limit: e.target.value === 'auto' ? null : e.target.value, page: '1' })}
                options={[
                  { value: 'auto', label: 'Padrão (Auto)' },
                  { value: '6', label: '6 por página' },
                  { value: '10', label: '10 por página' },
                  { value: '20', label: '20 por página' },
                  { value: '50', label: '50 por página' },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 h-9 px-2 shrink-0 self-end mb-0.5"
                title="Limpar todos os filtros"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted pt-2 border-t border-slate-100 dark:border-dark-border/40 mt-3">
          <span>
            Exibindo <strong className="text-slate-900 dark:text-white">{totalItems}</strong> usuários encontrados
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Filtros ativos aplicados na URL
            </span>
          )}
        </div>
      </Card>

      {/* Users Table Card */}
      <Card className="p-0 overflow-hidden border-slate-200 dark:border-dark-border">
        {loading ? (
          <div className="p-12 flex justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhum usuário encontrado
            </p>
            <p className="text-xs text-slate-500 dark:text-dark-muted max-w-sm mx-auto">
              Experimente limpar o termo de busca ou alterar os filtros de perfil e status.
            </p>
            {hasActiveFilters && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Limpar Todos os Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-cardElevated/80 border-b border-slate-200 dark:border-dark-border/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Usuário / Identificação</th>
                  <th className="py-3.5 px-4">Perfil / Cargo</th>
                  <th className="py-3.5 px-4">Contato & WhatsApp</th>
                  <th className="py-3.5 px-4">Status & Detalhes</th>
                  <th className="py-3.5 px-4 text-right">Ações Operacionais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border/50">
                {paginatedUsers.map((item) => {
                  const age = calculateAge(item.birthDate);
                  const cleanPhone = item.phone.replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-dark-cardElevated/40 transition-colors"
                    >
                      {/* Avatar & Name & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-dark-border shrink-0 shadow-xs">
                            {item.avatarUrl ? (
                              <img
                                src={getAssetUrl(item.avatarUrl)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-white">
                                {item.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-sm">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-dark-cardElevated px-1.5 py-0.2 rounded-md">
                                {item.id}
                              </span>
                              {item.studentProfile && (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/personal/students/${item.studentProfile!.id}`)}
                                  className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                  title="Ver ficha completa do aluno"
                                >
                                  <span>Ficha</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Level */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <Badge
                            variant={item.role === 'personal' ? 'success' : 'info'}
                            size="sm"
                          >
                            {item.role === 'personal' ? 'Personal Trainer' : 'Aluno'}
                          </Badge>
                          {item.level && (
                            <span className="text-[11px] text-slate-500 dark:text-dark-muted block">
                              Nível: {item.level} {age > 0 ? `• ${age} anos` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email & Phone / WhatsApp */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-mono text-[11px] truncate max-w-[180px]">
                              {item.email}
                            </span>
                          </div>
                          {item.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              <a
                                href={`https://wa.me/55${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                title="Chamar no WhatsApp"
                              >
                                <span>{item.phone}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status & Details */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.status === 'Ativo'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : item.status === 'Arquivado'
                                ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                                : item.status === 'Atenção'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {item.status}
                          </span>

                          {item.role === 'personal' ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                              Acesso Administrativo
                            </span>
                          ) : item.adherencePercentage !== undefined ? (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                              <span>Adesão:</span>
                              <span className="font-bold text-emerald-500">
                                {item.adherencePercentage}%
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Operational Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            leftIcon={<Edit2 className="w-3.5 h-3.5 text-blue-500" />}
                            className="text-xs h-8 px-2"
                            title="Editar dados cadastrais"
                          >
                            Editar
                          </Button>

                          {/* Reset Password Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPasswordReset(item)}
                            leftIcon={<KeyRound className="w-3.5 h-3.5 text-amber-500" />}
                            className="text-xs h-8 px-2"
                            title="Redefinir senha de acesso"
                          >
                            Senha
                          </Button>

                          {/* Archive Toggle Button (if student) */}
                          {item.studentProfile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleArchive(item)}
                              leftIcon={
                                item.status === 'Arquivado' ? (
                                  <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Archive className="w-3.5 h-3.5 text-slate-500" />
                                )
                              }
                              className="text-xs h-8 px-2 text-slate-600 dark:text-slate-400"
                              title={item.status === 'Arquivado' ? 'Desarquivar aluno' : 'Arquivar aluno'}
                            >
                              {item.status === 'Arquivado' ? 'Desarquivar' : 'Arquivar'}
                            </Button>
                          )}

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingUserItem(item);
                              setIsDeleteModalOpen(true);
                            }}
                            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                            className="text-xs h-8 px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Excluir usuário"
                            disabled={item.id === 'user-rafaela'}
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

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-dark-muted">
              Mostrando <strong className="text-slate-900 dark:text-white">{startIndex + 1}</strong> a{' '}
              <strong className="text-slate-900 dark:text-white">{endIndex}</strong> de{' '}
              <strong className="text-slate-900 dark:text-white">{totalItems}</strong> usuários (Página{' '}
              <strong className="text-slate-900 dark:text-white">{safePage}</strong> de{' '}
              <strong className="text-slate-900 dark:text-white">{totalPages}</strong>)
            </span>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              {/* First Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: '1' })}
                disabled={safePage <= 1}
                className="px-2"
                title="Primeira Página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: String(safePage - 1) })}
                disabled={safePage <= 1}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Anterior
              </Button>

              {/* Direct Page Numbers */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages > 7) {
                    if (p !== 1 && p !== totalPages && Math.abs(p - safePage) > 1) {
                      if (p === 2 || p === totalPages - 1) {
                        return (
                          <span key={p} className="text-xs text-slate-400 px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateParams({ page: String(p) })}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        safePage === p
                          ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs font-semibold'
                          : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: String(safePage + 1) })}
                disabled={safePage >= totalPages}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Próxima
              </Button>

              {/* Last Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateParams({ page: String(totalPages) })}
                disabled={safePage >= totalPages}
                className="px-2"
                title="Última Página"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT / CREATE USER & STUDENT                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={
          editingStudent
            ? `Editar Aluno: ${editingStudent.name}`
            : editingUser
            ? `Editar Usuário: ${editingUser.name}`
            : 'Cadastrar Novo Usuário'
        }
        description="Configure foto de perfil, dados de acesso, WhatsApp e preferências"
        size="lg"
      >
        <form onSubmit={handleSaveUserOrStudent} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
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
                Foto de Perfil
              </span>
              <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                Envie uma foto em JPG ou PNG. O arquivo é redimensionado e processado com segurança.
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

          {/* Role selection if creating new */}
          {!editingStudent && !editingUser && (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border">
              <label className="text-xs font-bold text-slate-800 dark:text-white block mb-1.5">
                Tipo de Conta / Perfil:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormRole('student')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    formRole === 'student'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-dark-cardElevated border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Aluno / Aluna</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormRole('personal')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    formRole === 'personal'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-dark-cardElevated border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Personal Trainer</span>
                </button>
              </div>
            </div>
          )}

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
              placeholder="usuario@email.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="WhatsApp *"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="(11) 98765-4321"
              required
            />
            {formRole === 'student' ? (
              <>
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
              </>
            ) : (
              <div className="sm:col-span-2">
                <Select
                  label="Status da Conta"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  options={[
                    { value: 'Ativo', label: 'Ativo' },
                    { value: 'Inativo', label: 'Inativo' },
                  ]}
                />
              </div>
            )}
          </div>

          {/* Student Specific Fields */}
          {formRole === 'student' && (
            <>
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
                    Observações Técnicas da Personal
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Ex: Foco em progressão de carga moderada e mobilidade..."
                    className="w-full bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

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
              {editingStudent || editingUser ? 'Salvar Alterações' : 'Concluir Cadastro'}
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
        title="Redefinir Senha de Acesso do Usuário"
        description="Defina uma nova senha de login e copie as instruções prontas para envio pelo WhatsApp"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Usuário:</span>
              <span className="font-bold text-white">{passwordTargetUser?.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">E-mail de Login:</span>
              <span className="font-mono text-emerald-400">{passwordTargetUser?.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Perfil:</span>
              <span className="font-bold text-white capitalize">{passwordTargetUser?.role === 'personal' ? 'Personal Trainer' : 'Aluno'}</span>
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
              type="submit"
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
      {/* MODAL 3: CONFIRM DELETE USER                                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão de Usuário"
        description="Atenção: Esta ação é definitiva e removerá a conta do usuário e seus registros"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Aviso Crítico de Exclusão:</strong>
              Você está prestes a excluir o usuário <strong>{deletingUserItem?.name}</strong> ({deletingUserItem?.email}) com perfil de <strong>{deletingUserItem?.role === 'personal' ? 'Personal Trainer' : 'Aluno'}</strong>. Esta ação não poderá ser desfeita.
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
              Sim, Excluir Usuário Definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

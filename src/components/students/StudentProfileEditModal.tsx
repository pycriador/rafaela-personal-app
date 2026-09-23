import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  Check,
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  Lock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Student, StudentGoal, DayOfWeek, User } from '../../types';
import { studentRepository } from '../../repositories/studentRepository';
import { userRepository } from '../../repositories/userRepository';
import { useToast } from '../../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const ALL_GOALS: StudentGoal[] = [
  'Hipertrofia',
  'Emagrecimento',
  'Definição',
  'Condicionamento',
  'Saúde',
  'Força',
  'Mobilidade',
  'Performance',
  'Manutenção',
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

interface StudentProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onStudentUpdated: (updatedStudent: Student) => void;
}

export const StudentProfileEditModal: React.FC<StudentProfileEditModalProps> = ({
  isOpen,
  onClose,
  student,
  onStudentUpdated,
}) => {
  const { success, error: toastError, info } = useToast();

  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone);
  const [birthDate, setBirthDate] = useState(student.birthDate || '1998-05-15');
  const [gender, setGender] = useState<'Feminino' | 'Masculino' | 'Outro'>(student.gender || 'Feminino');
  const [level, setLevel] = useState<Student['level']>(student.level || 'Iniciante');
  const [status, setStatus] = useState<Student['status']>(student.status || 'Ativo');
  const [goals, setGoals] = useState<StudentGoal[]>(student.goals || ['Hipertrofia']);
  const [availableDays, setAvailableDays] = useState<DayOfWeek[]>(
    student.availableDays || ['Segunda', 'Quarta', 'Sexta']
  );
  const [experience, setExperience] = useState(student.experience || '');
  const [notes, setNotes] = useState(student.notes || '');
  const [restrictions, setRestrictions] = useState(student.restrictions || '');
  const [preferences, setPreferences] = useState(student.preferences || '');
  const [avatarUrl, setAvatarUrl] = useState(student.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setBirthDate(student.birthDate || '1998-05-15');
    setGender(student.gender || 'Feminino');
    setLevel(student.level || 'Iniciante');
    setStatus(student.status || 'Ativo');
    setGoals(student.goals || ['Hipertrofia']);
    setAvailableDays(student.availableDays || ['Segunda', 'Quarta', 'Sexta']);
    setExperience(student.experience || '');
    setNotes(student.notes || '');
    setRestrictions(student.restrictions || '');
    setPreferences(student.preferences || '');
    setAvatarUrl(student.avatarUrl || '');
    setNewPassword('');
  }, [student, isOpen]);

  const toggleGoal = (goal: StudentGoal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleDay = (day: DayOfWeek) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toastError('Selecione um arquivo de imagem válido.');
      return;
    }

    setIsUploadingPhoto(true);

    try {
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

      if (isSupabaseConfigured) {
        try {
          const cleanName = (name || 'usuario').toLowerCase().replace(/[^a-z0-9]/g, '-');
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

      setAvatarUrl(finalUrl);
      success('Foto carregada e pronta para salvar!');
    } catch {
      toastError('Erro ao processar imagem.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Informe o nome completo do aluno.');
      return;
    }
    if (!email.trim()) {
      toastError('Informe o e-mail de acesso e contato.');
      return;
    }

    setIsSaving(true);
    try {
      const updates: Partial<Student> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        birthDate,
        gender,
        level,
        status,
        goals,
        availableDays,
        experience: experience.trim(),
        notes: notes.trim(),
        restrictions: restrictions.trim(),
        preferences: preferences.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      };

      const updated = await studentRepository.update(student.id, updates);

      // Sync corresponding User account in userRepository
      const uId = student.userId || student.id;
      const allUsers = await userRepository.getAll();
      const studentUser = allUsers.find(
        (u) => u.id === uId || u.studentProfileId === student.id
      );

      if (studentUser) {
        await userRepository.update(studentUser.id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          avatarUrl: avatarUrl.trim() || studentUser.avatarUrl,
        });

        if (newPassword.trim()) {
          info(`Nova senha para "${name}" definida com sucesso.`);
        }
      }

      const finalStudent = updated || { ...student, ...updates };
      onStudentUpdated(finalStudent);
      success(`Cadastro de "${name}" atualizado com sucesso!`);
      onClose();
    } catch {
      toastError('Erro ao atualizar dados do aluno.');
    } finally {
      setIsSaving(false);
    }
  };

  const age = calculateAge(birthDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Cadastro & Configurações do Aluno"
      size="xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Banner com Foto e Identificação */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group shrink-0">
            <img
              src={
                avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt="Foto do Aluno"
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
            />
            <button
              type="button"
              disabled={isUploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/50 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold gap-1 cursor-pointer"
              title="Trocar Foto"
            >
              <Camera className="w-5 h-5" />
              <span>{isUploadingPhoto ? 'Enviando...' : 'Alterar'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhotoUpload(f);
              }}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {name || 'Nome do Aluno'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-mono mt-0.5">
              ID: {student.id} {student.userId ? `• User: ${student.userId}` : ''}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                className="text-xs py-1"
              >
                {isUploadingPhoto ? 'Carregando foto...' : 'Upload de Foto'}
              </Button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-xs text-rose-500 hover:underline cursor-pointer"
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 1. Dados Pessoais e Acesso */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-500" />
            Dados Pessoais & Contato
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Completo *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mariana Silva"
              required
            />

            <Input
              label="E-mail de Acesso e Contato *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mariana@email.com"
              required
            />

            <Input
              label="Telefone / WhatsApp *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98765-4321"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Nascimento"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                helperText={age > 0 ? `${age} anos` : undefined}
              />

              <Select
                label="Gênero"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                options={[
                  { value: 'Feminino', label: 'Feminino' },
                  { value: 'Masculino', label: 'Masculino' },
                  { value: 'Outro', label: 'Outro' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* 2. Classificação & Status */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Perfil & Nível de Treinamento
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Nível Técnico do Aluno"
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              options={[
                { value: 'Iniciante', label: 'Iniciante (Pouca ou nenhuma vivência)' },
                { value: 'Intermediário', label: 'Intermediário (Treina com regularidade)' },
                { value: 'Avançado', label: 'Avançado (Mais de 2 anos de consistência)' },
                { value: 'Atleta', label: 'Atleta / Competidor' },
              ]}
            />

            <Select
              label="Status da Matrícula"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'Ativo', label: 'Ativo (Treinando normalmente)' },
                { value: 'Atenção', label: 'Atenção (Baixa frequência ou pendência)' },
                { value: 'Pausado', label: 'Pausado (Férias / Viagem / Lesão temporária)' },
                { value: 'Arquivado', label: 'Arquivado (Desistiu / Inativo)' },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Objetivos Principais do Aluno
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_GOALS.map((g) => {
                const isSelected = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-2xs font-semibold'
                        : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{g}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Dias Disponíveis para Treino na Semana
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => {
                const isSelected = availableDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-semibold'
                        : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{d}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Orientações, Restrições e Notas */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Anamnese, Restrições & Observações da Personal
          </h3>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Restrições Físicas, Dores ou Lesões
            </label>
            <textarea
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              rows={2}
              placeholder="Ex: Leve sensibilidade no ombro esquerdo em rotação externa..."
              className="w-full bg-white dark:bg-dark-card border border-slate-200/90 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 rounded-xl text-xs p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Preferências de Treino e Rotina
            </label>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={2}
              placeholder="Ex: Prefere treinar no início da manhã; gosta de supino máquina..."
              className="w-full bg-white dark:bg-dark-card border border-slate-200/90 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 rounded-xl text-xs p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Notas Exclusivas da Personal (Rafaela)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Anotações internas sobre o acompanhamento..."
              className="w-full bg-white dark:bg-dark-card border border-slate-200/90 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 rounded-xl text-xs p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* 4. Segurança / Redefinir Senha */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            Acesso do Aluno ao App
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <Input
              label="Redefinir Senha de Acesso (Opcional)"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha para o aluno..."
              helperText="Deixe em branco para manter a senha atual inalterada."
            />
            {newPassword && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 pb-2">
                ⚠️ A nova senha será salva assim que você clicar em Salvar Alterações.
              </span>
            )}
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
};

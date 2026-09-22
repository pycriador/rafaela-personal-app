import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { studentRepository } from '../../repositories/studentRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Check, ShieldAlert } from 'lucide-react';
import { DayOfWeek, StudentGoal } from '../../types';

export const StudentCreateEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<StudentGoal[]>(['Hipertrofia']);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['Segunda', 'Quarta', 'Sexta']);
  const [level, setLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado' | 'Atleta'>('Iniciante');
  const [experience, setExperience] = useState('');
  const [notes, setNotes] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);

  const goalOptions: StudentGoal[] = [
    'Emagrecimento',
    'Hipertrofia',
    'Condicionamento',
    'Força',
    'Saúde',
    'Mobilidade',
    'Performance',
    'Manutenção',
  ];

  const daysList: DayOfWeek[] = [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
    'Domingo',
  ];

  const toggleGoal = (g: StudentGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const toggleDay = (d: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      error('Preencha ao menos o nome e e-mail do aluno.');
      return;
    }
    if (selectedDays.length === 0) {
      error('Selecione pelo menos um dia disponível para treino.');
      return;
    }

    setLoading(true);
    try {
      const newSt = await studentRepository.create({
        userId: `user-${Date.now()}`,
        name,
        birthDate: birthDate || '2000-01-01',
        gender,
        phone: phone || '(11) 90000-0000',
        email,
        goals: selectedGoals,
        availableDays: selectedDays,
        level,
        experience: experience || 'Praticante regular.',
        notes,
        restrictions,
        preferences,
        avatarUrl: `https://images.unsplash.com/photo-${gender === 'Feminino' ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'}?w=150`,
      });

      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        action: 'Aluno cadastrado',
        description: `Novo aluno cadastrado: ${name} (${selectedGoals.join(', ')}).`,
        studentId: newSt.id,
        iconType: 'edit',
      });

      success('Aluno cadastrado com sucesso!');
      navigate(`/personal/students/${newSt.id}`);
    } catch (err) {
      error('Erro ao cadastrar aluno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/personal/students')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Cadastrar Novo Aluno
          </h1>
          <p className="text-xs text-slate-500 dark:text-dark-muted">
            Configure o perfil, objetivos e disponibilidade de treino
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>1. Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nome Completo *"
                placeholder="Ex: Mariana Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Input
              label="E-mail *"
              type="email"
              placeholder="ex: aluno@mock.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Telefone / WhatsApp"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Data de Nascimento"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <Select
              label="Sexo"
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              options={[
                { value: 'Feminino', label: 'Feminino' },
                { value: 'Masculino', label: 'Masculino' },
                { value: 'Outro', label: 'Outro' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Objetivos */}
        <Card>
          <CardHeader>
            <CardTitle>2. Objetivos (Selecione um ou mais)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {goalOptions.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-cardElevated text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rotina e Disponibilidade */}
        <Card>
          <CardHeader>
            <CardTitle>3. Rotina de Treino (Dias Disponíveis)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {daysList.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-cardElevated text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>4. Informações Adicionais & Restrições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Nível de Experiência"
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
              options={[
                { value: 'Iniciante', label: 'Iniciante (menos de 6 meses)' },
                { value: 'Intermediário', label: 'Intermediário (6 meses a 2 anos)' },
                { value: 'Avançado', label: 'Avançado (mais de 2 anos)' },
                { value: 'Atleta', label: 'Atleta / Competidor' },
              ]}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Histórico & Experiência Prévia
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Pratica musculação há 2 anos, já treinou crossfit..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-cardElevated/80 border border-slate-200 dark:border-dark-border rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Restrições Físicas / Articulares (Não criar diagnóstico médico)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Leve desconforto lombar em sobrecarga axial; sensibilidade no ombro..."
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-cardElevated/80 border border-slate-200 dark:border-dark-border rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Preferências & Observações da Rafaela
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Prefere treinos curtos e intensos pela manhã..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="w-full bg-slate-50 dark:bg-dark-cardElevated/80 border border-slate-200 dark:border-dark-border rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Nota: Este cadastro registra informações de apoio físico e rotina de treinamento. Não substitui avaliações clínicas e médicas formais.
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/personal/students')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
          >
            Salvar e Cadastrar Aluno
          </Button>
        </div>
      </form>
    </div>
  );
};

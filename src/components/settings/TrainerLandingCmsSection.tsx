import React, { useState, useEffect } from 'react';
import {
  Globe,
  Layout,
  ExternalLink,
  Copy,
  Check,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Smartphone,
  Eye,
  Award,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainerFilter } from '../../context/TrainerFilterContext';
import { trainerLandingRepository } from '../../repositories/trainerLandingRepository';
import { userRepository } from '../../repositories/userRepository';
import { TrainerLandingPageConfig, TrainerLandingFeaturedPlan, TrainerLandingTestimonial, User } from '../../types';

export const TrainerLandingCmsSection: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const { effectiveTrainerId, trainers } = useTrainerFilter();

  const isAdmin = user?.role === 'admin' || user?.id === 'user-rafaela';

  const [activeTrainerId, setActiveTrainerId] = useState<string>(
    effectiveTrainerId || user?.id || 'user-rafaela'
  );
  const [landingConfig, setLandingConfig] = useState<TrainerLandingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewTab, setPreviewTab] = useState<'editor' | 'preview'>('editor');

  const loadLandingConfig = async (trainerId: string) => {
    setLoading(true);
    try {
      const config = await trainerLandingRepository.getByTrainerId(trainerId);
      setLandingConfig(config);
    } catch (err) {
      console.error('Erro ao carregar Landing Page CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLandingConfig(activeTrainerId);
  }, [activeTrainerId]);

  const handleTrainerChange = (newTrainerId: string) => {
    setActiveTrainerId(newTrainerId);
    loadLandingConfig(newTrainerId);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!landingConfig) return;

    if (!landingConfig.slug.trim()) {
      toastError('Informe um link (slug) exclusivo para a landing page.');
      return;
    }

    setSaving(true);
    try {
      const saved = await trainerLandingRepository.save(landingConfig);
      setLandingConfig(saved);
      success('Landing page atualizada e publicada com sucesso!');
    } catch (err) {
      toastError('Erro ao salvar landing page.');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = landingConfig
    ? `${window.location.origin}/p/${landingConfig.slug}`
    : '';

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    success('Link da sua Landing Page copiado!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Add specialty tag
  const [newTagInput, setNewTagInput] = useState('');
  const handleAddSpecialty = () => {
    if (!newTagInput.trim() || !landingConfig) return;
    setLandingConfig({
      ...landingConfig,
      specialties: [...landingConfig.specialties, newTagInput.trim()],
    });
    setNewTagInput('');
  };

  const handleRemoveSpecialty = (index: number) => {
    if (!landingConfig) return;
    setLandingConfig({
      ...landingConfig,
      specialties: landingConfig.specialties.filter((_, i) => i !== index),
    });
  };

  // Plans Management
  const handleAddPlan = () => {
    if (!landingConfig) return;
    const newPlan: TrainerLandingFeaturedPlan = {
      id: `plan-${Date.now()}`,
      name: 'Novo Plano de Treino',
      price: 350,
      billing: 'R$ 350 / mês',
      description: 'Prescrição personalizada com suporte semanal.',
      features: ['Acesso ao aplicativo', 'Ajuste de treinos', 'Chat com o personal'],
    };
    setLandingConfig({
      ...landingConfig,
      featuredPlans: [...landingConfig.featuredPlans, newPlan],
    });
  };

  const handleRemovePlan = (planId: string) => {
    if (!landingConfig) return;
    setLandingConfig({
      ...landingConfig,
      featuredPlans: landingConfig.featuredPlans.filter((p) => p.id !== planId),
    });
  };

  const handleUpdatePlan = (index: number, updates: Partial<TrainerLandingFeaturedPlan>) => {
    if (!landingConfig) return;
    const plans = [...landingConfig.featuredPlans];
    plans[index] = { ...plans[index], ...updates };
    setLandingConfig({ ...landingConfig, featuredPlans: plans });
  };

  // Testimonials Management
  const handleAddTestimonial = () => {
    if (!landingConfig) return;
    const newTestimonial: TrainerLandingTestimonial = {
      name: 'Nome do Aluno(a)',
      result: 'Resultado alcançado (ex: -5kg em 60 dias)',
      comment: 'Escreva aqui o depoimento ou feedback real enviado pelo aluno.',
    };
    setLandingConfig({
      ...landingConfig,
      testimonials: [...landingConfig.testimonials, newTestimonial],
    });
  };

  const handleRemoveTestimonial = (index: number) => {
    if (!landingConfig) return;
    setLandingConfig({
      ...landingConfig,
      testimonials: landingConfig.testimonials.filter((_, i) => i !== index),
    });
  };

  const handleUpdateTestimonial = (index: number, updates: Partial<TrainerLandingTestimonial>) => {
    if (!landingConfig) return;
    const tests = [...landingConfig.testimonials];
    tests[index] = { ...tests[index], ...updates };
    setLandingConfig({ ...landingConfig, testimonials: tests });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white">
                Mini CMS • Landing Page do Personal
              </h2>
              <Badge variant="success" size="sm">
                {landingConfig?.isPublished ? 'Publicada Online' : 'Modo Rascunho'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl leading-relaxed">
              Crie e customize a sua própria página de vendas com link exclusivo, bio, fotos, depoimentos reais e tabela de preços com checkout direto.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {landingConfig && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(publicUrl, '_blank')}
                leftIcon={<ExternalLink className="w-3.5 h-3.5 text-blue-400" />}
              >
                Ver Página Pública
              </Button>
            </>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave()}
            isLoading={saving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Salvar & Publicar
          </Button>
        </div>
      </div>

      {/* Admin Multi-Trainer Switcher */}
      {isAdmin && trainers.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-white">
              Editando Landing Page de:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trainers.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTrainerChange(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTrainerId === t.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs'
                    : 'bg-white dark:bg-dark-card border border-slate-200/90 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <img
                  src={t.avatarUrl}
                  alt={t.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor & Preview Toggle Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-dark-border pb-1">
        <button
          type="button"
          onClick={() => setPreviewTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            previewTab === 'editor'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Painel CMS de Conteúdo</span>
        </button>

        <button
          type="button"
          onClick={() => setPreviewTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            previewTab === 'preview'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Prévia em Tempo Real</span>
        </button>
      </div>

      {loading || !landingConfig ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Carregando configurações da Landing Page...
        </div>
      ) : previewTab === 'editor' ? (
        /* CMS EDITOR FORM */
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Domain & URL settings */}
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-dark-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Link & Endereço da Página Pública
              </CardTitle>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Slug do Link Próprio (URL) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 text-xs font-mono bg-slate-100 dark:bg-dark-cardElevated border border-r-0 border-slate-200 dark:border-dark-border rounded-l-xl text-slate-500">
                    /p/
                  </span>
                  <input
                    type="text"
                    value={landingConfig.slug}
                    onChange={(e) =>
                      setLandingConfig({
                        ...landingConfig,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      })
                    }
                    placeholder="seu-nome-personal"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-r-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Link completo: <code className="text-emerald-500">{publicUrl}</code>
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tema Visual de Destaque
                </label>
                <div className="flex items-center gap-3">
                  {(['emerald', 'blue', 'purple', 'amber', 'rose'] as const).map((color) => {
                    const colorMap = {
                      emerald: 'bg-emerald-500',
                      blue: 'bg-blue-500',
                      purple: 'bg-purple-500',
                      amber: 'bg-amber-500',
                      rose: 'bg-rose-500',
                    };
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setLandingConfig({ ...landingConfig, accentColor: color })}
                        className={`w-7 h-7 rounded-full ${colorMap[color]} transition-all cursor-pointer flex items-center justify-center ${
                          landingConfig.accentColor === color ? 'ring-3 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={`Cor ${color}`}
                      >
                        {landingConfig.accentColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Hero Header & Bio */}
          <Card className="p-5 space-y-4">
            <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-dark-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Título Principal & Biografia
              </CardTitle>
            </CardHeader>

            <div className="space-y-3">
              <Input
                label="Título Principal (Headline de Impacto) *"
                value={landingConfig.headline}
                onChange={(e) => setLandingConfig({ ...landingConfig, headline: e.target.value })}
                placeholder="Ex: Transforme Seu Físico com Método Científico e Acompanhamento..."
                required
              />

              <Input
                label="Subtítulo ou Promessa de Valor"
                value={landingConfig.subheadline || ''}
                onChange={(e) => setLandingConfig({ ...landingConfig, subheadline: e.target.value })}
                placeholder="Ex: Consultoria individualizada focada em hipertrofia e resultados reais."
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Biografia & Metodologia (Sobre Mim) *
                </label>
                <textarea
                  rows={4}
                  value={landingConfig.bio}
                  onChange={(e) => setLandingConfig({ ...landingConfig, bio: e.target.value })}
                  placeholder="Conte sua trajetória, formação, especialidades e como funciona o seu acompanhamento..."
                  className="w-full bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border rounded-xl p-3 text-xs focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="URL da Foto de Perfil"
                  value={landingConfig.photoUrl || ''}
                  onChange={(e) => setLandingConfig({ ...landingConfig, photoUrl: e.target.value })}
                  placeholder="https://..."
                />
                <Input
                  label="URL da Imagem de Capa (Banner Hero)"
                  value={landingConfig.coverUrl || ''}
                  onChange={(e) => setLandingConfig({ ...landingConfig, coverUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input
                  label="CREF *"
                  value={landingConfig.cref}
                  onChange={(e) => setLandingConfig({ ...landingConfig, cref: e.target.value })}
                  placeholder="028914-G/SP"
                  required
                />
                <Input
                  label="Anos de Experiência"
                  type="number"
                  value={landingConfig.experienceYears}
                  onChange={(e) =>
                    setLandingConfig({
                      ...landingConfig,
                      experienceYears: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
                <Input
                  label="WhatsApp p/ Contato *"
                  value={landingConfig.whatsapp}
                  onChange={(e) => setLandingConfig({ ...landingConfig, whatsapp: e.target.value })}
                  placeholder="5511987654321"
                  required
                />
                <Input
                  label="Instagram (@seuuser)"
                  value={landingConfig.instagram || ''}
                  onChange={(e) => setLandingConfig({ ...landingConfig, instagram: e.target.value })}
                  placeholder="@rafaelapersonal"
                />
              </div>
            </div>

            {/* Specialties Tags */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Especialidades & Tags de Atuação
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {landingConfig.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-dark-cardElevated text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-dark-border"
                  >
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(i)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                  placeholder="Adicionar especialidade (ex: Powerlifting)..."
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSpecialty}
                  className="text-xs shrink-0"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 3: Featured Plans & Pricing */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  Planos & Preços em Destaque
                </CardTitle>
                <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5">
                  Adicione os pacotes visíveis na tabela de preços da sua Landing Page
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddPlan}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Novo Plano
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landingConfig.featuredPlans.map((plan, idx) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50/60 dark:bg-dark-cardElevated/40 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Plano #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlan(plan.id)}
                      className="text-slate-400 hover:text-rose-500"
                      title="Excluir este plano"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Nome do Plano"
                      value={plan.name}
                      onChange={(e) => handleUpdatePlan(idx, { name: e.target.value })}
                    />
                    <Input
                      label="Preço Mensal (R$)"
                      type="number"
                      value={plan.price}
                      onChange={(e) =>
                        handleUpdatePlan(idx, { price: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <Input
                    label="Texto de Cobrança / Duração"
                    value={plan.billing}
                    onChange={(e) => handleUpdatePlan(idx, { billing: e.target.value })}
                    placeholder="Ex: R$ 380 / mês (trimestral)"
                  />

                  <Input
                    label="Descrição Rápida"
                    value={plan.description}
                    onChange={(e) => handleUpdatePlan(idx, { description: e.target.value })}
                  />

                  <Input
                    label="Link de Checkout Direto (InfinityPay, PagBank, etc.)"
                    value={plan.checkoutUrl || ''}
                    onChange={(e) => handleUpdatePlan(idx, { checkoutUrl: e.target.value })}
                    placeholder="https://pay.infinitypay.io/..."
                  />

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!plan.highlight}
                      onChange={(e) => handleUpdatePlan(idx, { highlight: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Destacar como "Mais Popular"</span>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          {/* Card 4: Testimonials */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Depoimentos de Alunos Reais
                </CardTitle>
                <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5">
                  Resultados comprovados que geram prova social e credibilidade
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTestimonial}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Novo Depoimento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {landingConfig.testimonials.map((test, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50/60 dark:bg-dark-cardElevated/40 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Depoimento #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTestimonial(idx)}
                      className="text-slate-400 hover:text-rose-500"
                      title="Excluir este depoimento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Nome do Aluno"
                      value={test.name}
                      onChange={(e) => handleUpdateTestimonial(idx, { name: e.target.value })}
                    />
                    <Input
                      label="Resultado em Destaque"
                      value={test.result}
                      onChange={(e) => handleUpdateTestimonial(idx, { result: e.target.value })}
                      placeholder="-8kg e hipertrofia"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Comentário / Depoimento
                    </label>
                    <textarea
                      rows={2}
                      value={test.comment}
                      onChange={(e) => handleUpdateTestimonial(idx, { comment: e.target.value })}
                      className="w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl p-2 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Bottom Save Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold"
            >
              Salvar & Atualizar Landing Page
            </Button>
          </div>
        </form>
      ) : (
        /* LIVE PREVIEW FRAME */
        <Card className="p-0 overflow-hidden border-slate-200 dark:border-dark-border shadow-lg">
          <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-400 font-mono ml-2">{publicUrl}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(publicUrl, '_blank')}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="text-xs py-1 h-7"
            >
              Abrir em Nova Aba
            </Button>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-dark-bg min-h-[500px] space-y-8 max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-md">
              <img
                src={landingConfig.photoUrl}
                alt={landingConfig.trainerName}
                className="w-32 h-32 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
              />
              <div className="space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    CREF {landingConfig.cref}
                  </span>
                  <span className="text-xs text-slate-500">
                    • {landingConfig.experienceYears} anos de experiência
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {landingConfig.headline}
                </h1>
                <p className="text-xs text-slate-600 dark:text-dark-muted leading-relaxed">
                  {landingConfig.subheadline || landingConfig.bio}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  {landingConfig.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-dark-cardElevated text-slate-700 dark:text-slate-300"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <h3 className="text-center text-base font-bold text-slate-900 dark:text-white">
                Planos de Consultoria Personalizada
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {landingConfig.featuredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-dark-card border space-y-3 relative ${
                      plan.highlight
                        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-dark-border'
                    }`}
                  >
                    {plan.highlight && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white shadow-xs">
                        Mais Escolhido
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {plan.name}
                    </h4>
                    <div className="text-2xl font-black text-emerald-500 font-mono">
                      R$ {plan.price}
                      <span className="text-xs font-normal text-slate-400"> /mês</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted leading-relaxed">
                      {plan.description}
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.highlight ? 'primary' : 'secondary'}
                      fullWidth
                      size="sm"
                      onClick={() =>
                        window.open(
                          plan.checkoutUrl ||
                            `https://wa.me/${landingConfig.whatsapp}?text=Ola%20gostaria%20de%20assinar%20o%20plano%20${encodeURIComponent(
                              plan.name
                            )}`,
                          '_blank'
                        )
                      }
                      className="text-xs"
                    >
                      Assinar Agora
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

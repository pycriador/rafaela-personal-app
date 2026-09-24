import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  Globe,
  Star,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { MembershipPlan, Student, PlanFrequency } from '../../types';
import { planRepository } from '../../repositories/planRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { useToast } from '../../context/ToastContext';
import { PlanEditorModal } from '../../components/plans/PlanEditorModal';
import { AssignPlanModal } from '../../components/plans/AssignPlanModal';

export const PlansManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [freqFilter, setFreqFilter] = useState<string>('all');
  const [showSiteFilter, setShowSiteFilter] = useState<string>('all');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<MembershipPlan | null>(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [planToAssign, setPlanToAssign] = useState<MembershipPlan | null>(null);

  const [planToDelete, setPlanToDelete] = useState<MembershipPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allPlans, allStudents] = await Promise.all([
        planRepository.getPlans(),
        studentRepository.getAll(),
      ]);
      setPlans(allPlans);
      setStudents(allStudents);
    } catch (err) {
      console.error(err);
      toastError('Erro ao carregar catálogo de planos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute student count per plan
  const planStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const planId = s.financialPlan?.planId;
      const planName = s.financialPlan?.planName?.toLowerCase().trim();
      if (planId) {
        counts[planId] = (counts[planId] || 0) + 1;
      } else if (planName) {
        // Fallback by name matching
        const matched = plans.find((p) => p.name.toLowerCase().trim() === planName);
        if (matched) {
          counts[matched.id] = (counts[matched.id] || 0) + 1;
        }
      }
    });
    return counts;
  }, [students, plans]);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesFeat = p.features.some((f) => f.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesFeat) return false;
      }
      if (freqFilter !== 'all' && p.frequency !== freqFilter) {
        return false;
      }
      if (showSiteFilter === 'landing' && !p.showOnLandingPage) {
        return false;
      }
      if (showSiteFilter === 'internal' && p.showOnLandingPage) {
        return false;
      }
      return true;
    });
  }, [plans, search, freqFilter, showSiteFilter]);

  // Toggle landing page visibility directly from card
  const handleToggleLandingPage = async (plan: MembershipPlan) => {
    const updatedState = !plan.showOnLandingPage;
    try {
      await planRepository.toggleLandingPage(plan.id, updatedState);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, showOnLandingPage: updatedState } : p))
      );
      if (updatedState) {
        success(`Plano "${plan.name}" agora está visível na Landing Page pública!`);
      } else {
        info(`Plano "${plan.name}" removido da vitrine pública do site.`);
      }
    } catch {
      toastError('Erro ao atualizar visibilidade na Landing Page.');
    }
  };

  // Toggle active status
  const handleToggleActive = async (plan: MembershipPlan) => {
    const updatedState = !plan.active;
    try {
      await planRepository.toggleActive(plan.id, updatedState);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, active: updatedState } : p))
      );
      success(`Plano "${plan.name}" ${updatedState ? 'ativado' : 'desativado'}.`);
    } catch {
      toastError('Erro ao alterar status do plano.');
    }
  };

  // Delete plan
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    try {
      await planRepository.deletePlan(planToDelete.id);
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      success(`Plano "${planToDelete.name}" removido do catálogo com sucesso.`);
      setPlanToDelete(null);
    } catch {
      toastError('Erro ao excluir plano.');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalLandingPlans = plans.filter((p) => p.showOnLandingPage && p.active).length;
  const totalSubscribers = Object.values(planStudentCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Central de Gestão de Planos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted">
            Cadastre planos, gere parcelas automáticas por duração em meses e controle quais opções aparecem na vitrine do site.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => window.open('/#planos', '_blank')}
            leftIcon={<Globe className="w-3.5 h-3.5 text-emerald-500" />}
            className="text-xs"
          >
            Ver Vitrine no Site
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setPlanToEdit(null);
              setIsEditorOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs"
          >
            + Novo Plano
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
              Total de Planos
            </span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {plans.length}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {plans.filter((p) => p.active).length} ativos no sistema
          </span>
        </Card>

        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
              Na Landing Page
            </span>
            <Globe className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalLandingPlans}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            visíveis para novos visitantes
          </span>
        </Card>

        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
              Alunos Vinculados
            </span>
            <Users className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalSubscribers}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            com plano atribuído ativo
          </span>
        </Card>

        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
              Mais Escolhido
            </span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">
            {plans.find((p) => p.isPopular)?.name || 'Performance Pro'}
          </p>
          <span className="text-[11px] text-emerald-500 font-medium block mt-0.5">
            Destaque comercial ativo
          </span>
        </Card>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="p-4 border border-slate-200/80 dark:border-white/[0.08]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar plano por nome, benefício..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div>
            <Select
              value={freqFilter}
              onChange={(e) => setFreqFilter(e.target.value)}
              className="text-xs"
            >
              <option value="all">Todas as Periodicidades</option>
              <option value="mensal">Mensal (1 Mês)</option>
              <option value="trimestral">Trimestral (3 Meses)</option>
              <option value="semestral">Semestral (6 Meses)</option>
              <option value="anual">Anual (12 Meses)</option>
            </Select>
          </div>

          <div>
            <Select
              value={showSiteFilter}
              onChange={(e) => setShowSiteFilter(e.target.value)}
              className="text-xs"
            >
              <option value="all">Todos os Planos</option>
              <option value="landing">Exibidos na Landing Page</option>
              <option value="internal">Apenas Planos Internos</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Grid de Planos */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-400">Carregando catálogo de planos...</span>
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-white/[0.08]">
          <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nenhum plano encontrado
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Ajuste os filtros de pesquisa ou cadastre um novo plano de consultoria para os alunos.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              setPlanToEdit(null);
              setIsEditorOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Criar Primeiro Plano
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const studentCount = planStudentCounts[plan.id] || 0;
            const monthlyEquivalent = plan.monthlyEquivalentPrice || plan.price / Math.max(1, plan.durationMonths);

            return (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-md ${
                  plan.isPopular
                    ? 'border-emerald-500/50 dark:border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200/80 dark:border-white/[0.08]'
                } ${!plan.active ? 'opacity-60 bg-slate-50/50 dark:bg-white/[0.01]' : ''}`}
              >
                <div>
                  {/* Top Badges Header */}
                  <div className="p-4 pb-3 flex items-start justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="neutral" size="sm">
                        {plan.durationMonths === 1 ? '1 Mês' : `${plan.durationMonths} Meses`}
                      </Badge>

                      {plan.isPopular && (
                        <Badge variant="success" size="sm" className="gap-1">
                          <Star className="w-3 h-3 fill-emerald-500" />
                          <span>{plan.badgeText || 'Mais Escolhido'}</span>
                        </Badge>
                      )}

                      {!plan.isPopular && plan.badgeText && (
                        <Badge variant="info" size="sm">
                          {plan.badgeText}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {plan.showOnLandingPage && (
                        <span
                          className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold flex items-center gap-1"
                          title="Exibido na vitrine pública do site"
                        >
                          <Globe className="w-3 h-3" />
                          <span>No Site</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 line-clamp-2 min-h-8">
                        {plan.description || 'Consultoria e acompanhamento periodizado de treino.'}
                      </p>
                    </div>

                    {/* Preço & Parcelas */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-dark-cardElevated/70 border border-slate-200/60 dark:border-white/[0.06] flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Valor Total ({plan.durationMonths}x)
                        </span>
                        <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          R$ {plan.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-medium text-slate-400 block">
                          Parcela Mensal
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-200">
                          R$ {monthlyEquivalent.toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-400">/mês</span>
                        </span>
                      </div>
                    </div>

                    {/* Formas de Pagamento Aceitas */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Formas de Pagamento
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {plan.allowedPaymentMethods?.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                          >
                            {m === 'pix' ? 'PIX' : m === 'cartao_credito' ? 'Cartão' : 'Boleto'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Lista de Benefícios */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        O que está incluso ({plan.features?.length || 0})
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {plan.features?.slice(0, 4).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                        {plan.features && plan.features.length > 4 && (
                          <li className="text-[11px] text-slate-400 pl-5">
                            +{plan.features.length - 4} outros benefícios
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01] space-y-3">
                  {/* Switches Rápidos */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-500 dark:text-dark-muted hover:text-slate-800 dark:hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        checked={plan.showOnLandingPage}
                        onChange={() => handleToggleLandingPage(plan)}
                        className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>Exibir no site</span>
                    </label>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{studentCount} {studentCount === 1 ? 'aluno' : 'alunos'}</span>
                    </div>
                  </div>

                  {/* Botão Principal: Vincular a Aluno */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setPlanToAssign(plan);
                        setIsAssignOpen(true);
                      }}
                      className="flex-1 text-xs py-1.5"
                      leftIcon={<Users className="w-3.5 h-3.5" />}
                    >
                      Vincular a Aluno
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setPlanToEdit(plan);
                        setIsEditorOpen(true);
                      }}
                      className="p-2"
                      title="Editar plano"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlanToDelete(plan)}
                      className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      title="Excluir plano"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Plano */}
      <PlanEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setPlanToEdit(null);
        }}
        planToEdit={planToEdit}
        onSaved={loadData}
      />

      {/* Modal Vincular Plano a um Aluno */}
      <AssignPlanModal
        isOpen={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setPlanToAssign(null);
        }}
        plan={planToAssign}
        onPlanAssigned={loadData}
      />

      {/* Modal Confirmação de Exclusão */}
      {planToDelete && (
        <Modal
          isOpen={!!planToDelete}
          onClose={() => setPlanToDelete(null)}
          title="Excluir Plano"
          description={`Tem certeza que deseja excluir o plano "${planToDelete.name}"?`}
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Esta ação removerá o plano do catálogo comercial e da Landing Page pública. Alunos que já possuem este plano continuarão com seu histórico financeiro preservado.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setPlanToDelete(null)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isDeleting}
                onClick={handleConfirmDelete}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  Globe,
  Star,
  Users,
  Edit2,
  Trash2,
  Sparkles,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Percent,
  Clock,
  Infinity as InfinityIcon,
  ShieldCheck,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { MembershipPlan, Student, DiscountCoupon } from '../../types';
import { planRepository } from '../../repositories/planRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { couponRepository } from '../../repositories/couponRepository';
import { useToast } from '../../context/ToastContext';
import { useTrainerFilter } from '../../context/TrainerFilterContext';
import { PlanEditorModal } from '../../components/plans/PlanEditorModal';
import { AssignPlanModal } from '../../components/plans/AssignPlanModal';
import { CouponEditorModal } from '../../components/plans/CouponEditorModal';
import { PaymentMethodsManagement } from '../../components/plans/PaymentMethodsManagement';
import { CouponStudentsModal } from '../../components/plans/CouponStudentsModal';

const PLANS_PER_PAGE = 6;
const COUPONS_PER_PAGE = 6;

export const PlansManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: toastError, info } = useToast();

  // URL Tab: 'planos', 'cupons' or 'pagamentos'
  const currentTab = (searchParams.get('tab') as 'planos' | 'cupons' | 'pagamentos') || 'planos';
  // URL Page: defaults to 1
  const currentPageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const [couponForStudentsModal, setCouponForStudentsModal] = useState<DiscountCoupon | null>(null);

  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Plans
  const [planSearch, setPlanSearch] = useState('');
  const [freqFilter, setFreqFilter] = useState<string>('all');
  const [showSiteFilter, setShowSiteFilter] = useState<string>('all');

  // Filters for Coupons
  const [couponSearch, setCouponSearch] = useState('');
  const [couponTypeFilter, setCouponTypeFilter] = useState<string>('all');
  const [couponStatusFilter, setCouponStatusFilter] = useState<string>('all');

  // Modals for Plans
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<MembershipPlan | null>(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [planToAssign, setPlanToAssign] = useState<MembershipPlan | null>(null);

  const [planToDelete, setPlanToDelete] = useState<MembershipPlan | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // Modals for Coupons
  const [isCouponEditorOpen, setIsCouponEditorOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<DiscountCoupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<DiscountCoupon | null>(null);
  const [isDeletingCoupon, setIsDeletingCoupon] = useState(false);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { effectiveTrainerId } = useTrainerFilter();

  const loadData = async () => {
    try {
      setLoading(true);
      const [allPlans, allStudents, allCoupons] = await Promise.all([
        planRepository.getPlans(effectiveTrainerId),
        studentRepository.getAll(effectiveTrainerId ? { trainerId: effectiveTrainerId } : undefined),
        couponRepository.getCoupons(effectiveTrainerId),
      ]);
      setPlans(allPlans);
      setStudents(allStudents);
      setCoupons(allCoupons);
    } catch (err) {
      console.error(err);
      toastError('Erro ao carregar dados de planos e cupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveTrainerId]);

  // Tab change handler (updates URL)
  const handleTabChange = (newTab: 'planos' | 'cupons' | 'pagamentos') => {
    setSearchParams({ tab: newTab, page: '1' });
  };

  // URL Page change handler
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page to 1 when plan filters change
  const handlePlanFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    if (currentPageParam !== 1) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', '1');
        return next;
      });
    }
  };

  // Reset page to 1 when coupon filters change
  const handleCouponFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    if (currentPageParam !== 1) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', '1');
        return next;
      });
    }
  };

  // Compute student count per plan
  const planStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      const planId = s.financialPlan?.planId;
      const planName = s.financialPlan?.planName?.toLowerCase().trim();
      if (planId) {
        counts[planId] = (counts[planId] || 0) + 1;
      } else if (planName) {
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
      if (planSearch) {
        const q = planSearch.toLowerCase();
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
  }, [plans, planSearch, freqFilter, showSiteFilter]);

  // Paginated plans
  const totalPlanPages = Math.max(1, Math.ceil(filteredPlans.length / PLANS_PER_PAGE));
  const validPlanPage = Math.min(Math.max(1, currentPageParam), totalPlanPages);
  const paginatedPlans = useMemo(() => {
    const start = (validPlanPage - 1) * PLANS_PER_PAGE;
    return filteredPlans.slice(start, start + PLANS_PER_PAGE);
  }, [filteredPlans, validPlanPage]);

  // Mapeamento real dos cupons aplicados a alunos no banco de dados
  const couponRealUsageMap = useMemo(() => {
    const map: Record<string, { count: number; students: Student[] }> = {};
    coupons.forEach((c) => {
      const cleanCode = c.code.trim().toUpperCase();
      const match = students.filter(
        (s) => s.financialPlan?.discountCouponCode?.trim().toUpperCase() === cleanCode
      );
      map[cleanCode] = { count: match.length, students: match };
    });
    return map;
  }, [students, coupons]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return coupons.filter((c) => {
      if (couponSearch) {
        const q = couponSearch.toLowerCase();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        if (!matchesCode && !matchesDesc) return false;
      }
      if (couponTypeFilter !== 'all' && c.discountType !== couponTypeFilter) {
        return false;
      }
      if (couponStatusFilter === 'active' && !c.active) {
        return false;
      }
      if (couponStatusFilter === 'inactive' && c.active) {
        return false;
      }
      if (couponStatusFilter === 'expired') {
        const isExp = c.expiresAt && c.expiresAt < today;
        if (!isExp) return false;
      }
      if (couponStatusFilter === 'exhausted') {
        const realCount = couponRealUsageMap[c.code.trim().toUpperCase()]?.count || 0;
        const isExhausted = c.maxUses !== null && c.maxUses > 0 && realCount >= c.maxUses;
        if (!isExhausted) return false;
      }
      return true;
    });
  }, [coupons, couponSearch, couponTypeFilter, couponStatusFilter, couponRealUsageMap]);

  // Paginated coupons
  const totalCouponPages = Math.max(1, Math.ceil(filteredCoupons.length / COUPONS_PER_PAGE));
  const validCouponPage = Math.min(Math.max(1, currentPageParam), totalCouponPages);
  const paginatedCoupons = useMemo(() => {
    const start = (validCouponPage - 1) * COUPONS_PER_PAGE;
    return filteredCoupons.slice(start, start + COUPONS_PER_PAGE);
  }, [filteredCoupons, validCouponPage]);

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

  // Delete plan
  const handleConfirmDeletePlan = async () => {
    if (!planToDelete) return;
    setIsDeletingPlan(true);
    try {
      await planRepository.deletePlan(planToDelete.id);
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      success(`Plano "${planToDelete.name}" removido do catálogo com sucesso.`);
      setPlanToDelete(null);
    } catch {
      toastError('Erro ao excluir plano.');
    } finally {
      setIsDeletingPlan(false);
    }
  };

  // Toggle active status for Coupon
  const handleToggleCouponActive = async (coupon: DiscountCoupon) => {
    const nextState = !coupon.active;
    try {
      await couponRepository.toggleActive(coupon.id, nextState);
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, active: nextState } : c))
      );
      success(`Cupom "${coupon.code}" ${nextState ? 'ativado' : 'desativado'}.`);
    } catch {
      toastError('Erro ao alterar status do cupom.');
    }
  };

  // Delete coupon
  const handleConfirmDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setIsDeletingCoupon(true);
    try {
      await couponRepository.deleteCoupon(couponToDelete.id);
      setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
      success(`Cupom "${couponToDelete.code}" excluído com sucesso.`);
      setCouponToDelete(null);
    } catch {
      toastError('Erro ao excluir cupom.');
    } finally {
      setIsDeletingCoupon(false);
    }
  };

  // Copy coupon code
  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Código "${code}" copiado para a área de transferência!`);
    setTimeout(() => {
      setCopiedCode((curr) => (curr === code ? null : curr));
    }, 2000);
  };

  // Stats
  const totalLandingPlans = plans.filter((p) => p.showOnLandingPage && p.active).length;
  const totalSubscribers = Object.values(planStudentCounts).reduce((a, b) => a + b, 0);

  const activeCouponsCount = coupons.filter((c) => c.active).length;
  const totalCouponUses = useMemo(() => {
    return Object.values(couponRealUsageMap).reduce((acc, curr) => acc + curr.count, 0);
  }, [couponRealUsageMap]);
  const todayStr = new Date().toISOString().split('T')[0];
  const expiredOrExhaustedCount = coupons.filter((c) => {
    const realUses = couponRealUsageMap[c.code.trim().toUpperCase()]?.count || 0;
    return (
      (c.expiresAt && c.expiresAt < todayStr) ||
      (c.maxUses !== null && c.maxUses > 0 && realUses >= c.maxUses)
    );
  }).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {currentTab === 'planos' ? (
              <CreditCard className="w-5 h-5 text-emerald-500" />
            ) : currentTab === 'cupons' ? (
              <Tag className="w-5 h-5 text-emerald-500" />
            ) : (
              <Wallet className="w-5 h-5 text-emerald-500" />
            )}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentTab === 'planos'
                ? 'Central de Gestão de Planos'
                : currentTab === 'cupons'
                ? 'Gestão de Cupons de Desconto'
                : 'Opções e Formas de Pagamento'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted">
            {currentTab === 'planos'
              ? 'Cadastre planos, gere parcelas automáticas por duração em meses e sincronize com a vitrine do site.'
              : currentTab === 'cupons'
              ? 'Crie cupons promocionais em R$ ou %, defina limite de utilizações, validade e regras mínimas.'
              : 'Cadastre links de pagamento externo (InfinitePay, PagBank, PagSeguro, Mercado Pago, Asaas, Ton), PIX com QR Code, Boleto e Máquinas no Celular.'}
          </p>
        </div>

        {/* Dynamic Action Buttons according to Tab */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentTab === 'planos' ? (
            <>
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
            </>
          ) : currentTab === 'cupons' ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setCouponToEdit(null);
                setIsCouponEditorOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs"
            >
              + Novo Cupom
            </Button>
          ) : null}
        </div>
      </div>

      {/* Submenu / Abas de Navegação (URL Sync) */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('planos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${
            currentTab === 'planos'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Catálogo de Planos</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              currentTab === 'planos'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
            }`}
          >
            {plans.length}
          </span>
          {currentTab === 'planos' && (
            <span className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('cupons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${
            currentTab === 'cupons'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Cupons de Desconto</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              currentTab === 'cupons'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
            }`}
          >
            {activeCouponsCount} ativos
          </span>
          {currentTab === 'cupons' && (
            <span className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('pagamentos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${
            currentTab === 'pagamentos'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Opções de Pagamento</span>
          {currentTab === 'pagamentos' && (
            <span className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CATÁLOGO DE PLANOS */}
      {/* ========================================================================= */}
      {currentTab === 'planos' && (
        <div className="space-y-6">
          {/* KPI Stats Cards dos Planos */}
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

          {/* Barra de Filtros dos Planos */}
          <Card className="p-4 border border-slate-200/80 dark:border-white/[0.08]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar plano por nome, benefício..."
                  value={planSearch}
                  onChange={(e) => handlePlanFilterChange(setPlanSearch, e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div>
                <Select
                  value={freqFilter}
                  onChange={(e) => handlePlanFilterChange(setFreqFilter, e.target.value)}
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
                  onChange={(e) => handlePlanFilterChange(setShowSiteFilter, e.target.value)}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedPlans.map((plan) => {
                  const studentCount = planStudentCounts[plan.id] || 0;
                  const monthlyEquivalent =
                    plan.monthlyEquivalentPrice || plan.price / Math.max(1, plan.durationMonths);

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

              {/* Paginação por URL para Planos */}
              {totalPlanPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01]">
                  <span className="text-xs text-slate-500 dark:text-dark-muted font-medium">
                    Mostrando <strong className="text-slate-800 dark:text-white">{(validPlanPage - 1) * PLANS_PER_PAGE + 1}</strong> a{' '}
                    <strong className="text-slate-800 dark:text-white">
                      {Math.min(validPlanPage * PLANS_PER_PAGE, filteredPlans.length)}
                    </strong>{' '}
                    de <strong className="text-slate-800 dark:text-white">{filteredPlans.length}</strong> planos cadastrados
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={validPlanPage <= 1}
                      onClick={() => handlePageChange(validPlanPage - 1)}
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                      className="text-xs px-2.5 py-1"
                    >
                      Anterior
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPlanPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          type="button"
                          onClick={() => handlePageChange(pg)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            pg === validPlanPage
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={validPlanPage >= totalPlanPages}
                      onClick={() => handlePageChange(validPlanPage + 1)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      className="text-xs px-2.5 py-1"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: GESTÃO DE CUPONS DE DESCONTO */}
      {/* ========================================================================= */}
      {currentTab === 'cupons' && (
        <div className="space-y-6">
          {/* KPI Stats Cards dos Cupons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                  Total de Cupons
                </span>
                <Tag className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {coupons.length}
              </p>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                cadastrados no sistema
              </span>
            </Card>

            <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                  Cupons Ativos
                </span>
                <ShieldCheck className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {activeCouponsCount}
              </p>
              <span className="text-[11px] text-emerald-500 font-medium block mt-0.5">
                disponíveis para aplicação
              </span>
            </Card>

            <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                  Total de Resgates
                </span>
                <Users className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalCouponUses}
              </p>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                utilizações registradas
              </span>
            </Card>

            <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                  Expirados / Esgotados
                </span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {expiredOrExhaustedCount}
              </p>
              <span className="text-[11px] text-amber-500 font-medium block mt-0.5">
                requerem renovação
              </span>
            </Card>
          </div>

          {/* Barra de Filtros dos Cupons */}
          <Card className="p-4 border border-slate-200/80 dark:border-white/[0.08]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar cupom por código ou descrição..."
                  value={couponSearch}
                  onChange={(e) => handleCouponFilterChange(setCouponSearch, e.target.value)}
                  className="pl-9 text-xs font-mono uppercase"
                />
              </div>

              <div>
                <Select
                  value={couponTypeFilter}
                  onChange={(e) => handleCouponFilterChange(setCouponTypeFilter, e.target.value)}
                  className="text-xs"
                >
                  <option value="all">Todos os Tipos de Desconto</option>
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </Select>
              </div>

              <div>
                <Select
                  value={couponStatusFilter}
                  onChange={(e) => handleCouponFilterChange(setCouponStatusFilter, e.target.value)}
                  className="text-xs"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Apenas Ativos</option>
                  <option value="inactive">Apenas Inativos</option>
                  <option value="expired">Apenas Expirados</option>
                  <option value="exhausted">Apenas Esgotados</option>
                </Select>
              </div>
            </div>
          </Card>

          {/* Grid de Cupons */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs text-slate-400">Carregando catálogo de cupons...</span>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-white/[0.08]">
              <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Nenhum cupom encontrado
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Ajuste os filtros de pesquisa ou cadastre um novo cupom promocional para seus alunos.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setCouponToEdit(null);
                  setIsCouponEditorOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Cadastrar Primeiro Cupom
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedCoupons.map((coupon) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isExpired = coupon.expiresAt && coupon.expiresAt < today;
                  const cleanCode = coupon.code.trim().toUpperCase();
                  const realUsage = couponRealUsageMap[cleanCode] || { count: 0, students: [] };
                  const isExhausted =
                    coupon.maxUses !== null && coupon.maxUses > 0 && realUsage.count >= coupon.maxUses;
                  const isAvailable = coupon.active && !isExpired && !isExhausted;

                  // Usage percentage based on real database records
                  const usagePct =
                    coupon.maxUses !== null && coupon.maxUses > 0
                      ? Math.min(100, Math.round((realUsage.count / coupon.maxUses) * 100))
                      : null;

                  return (
                    <Card
                      key={coupon.id}
                      className={`flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-md ${
                        !coupon.active || isExpired || isExhausted
                          ? 'opacity-70 bg-slate-50/50 dark:bg-white/[0.01]'
                          : 'border-slate-200/80 dark:border-white/[0.08]'
                      }`}
                    >
                      <div>
                        {/* Header com Código e Switch de Ativação */}
                        <div className="p-4 pb-3 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-extrabold text-sm tracking-wider">
                              {coupon.code}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleCopyCouponCode(coupon.code)}
                              className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                              title="Copiar código do cupom"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isExhausted ? (
                              <Badge variant="danger" size="sm">
                                Esgotado
                              </Badge>
                            ) : isExpired ? (
                              <Badge variant="warning" size="sm">
                                Expirado
                              </Badge>
                            ) : coupon.active ? (
                              <Badge variant="success" size="sm">
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="neutral" size="sm">
                                Pausado
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Corpo com Desconto e Regras */}
                        <div className="p-5 space-y-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                                {coupon.discountType === 'percentage'
                                  ? `${coupon.discountValue}% OFF`
                                  : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {coupon.discountType === 'percentage'
                                  ? 'desconto percentual'
                                  : 'desconto fixo'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 line-clamp-2 min-h-8">
                              {coupon.description || 'Desconto promocional para planos da consultoria.'}
                            </p>
                          </div>

                          {/* Caixa de Regras de Quantidade / Resgates Reais */}
                          <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-dark-cardElevated/70 border border-slate-200/60 dark:border-white/[0.06] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-dark-muted flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-violet-500" />
                                Resgates no Banco:
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {coupon.maxUses !== null && coupon.maxUses > 0 ? (
                                  `${realUsage.count} de ${coupon.maxUses} alunos`
                                ) : (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <InfinityIcon className="w-3.5 h-3.5" /> Ilimitado ({realUsage.count} alunos)
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* Barra de Progresso de Usos (se limitado) */}
                            {coupon.maxUses !== null && coupon.maxUses > 0 && usagePct !== null && (
                              <div className="space-y-1">
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.1] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 rounded-full ${
                                      usagePct >= 100
                                        ? 'bg-rose-500'
                                        : usagePct >= 80
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${usagePct}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>{usagePct}% resgatado</span>
                                  <span>{Math.max(0, coupon.maxUses - realUsage.count)} restantes</span>
                                </div>
                              </div>
                            )}

                            {/* Botão para ver os alunos reais */}
                            <div className="pt-1 border-t border-slate-200/40 dark:border-white/[0.04] flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => setCouponForStudentsModal(coupon)}
                                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Users className="w-3 h-3" />
                                {realUsage.count === 0
                                  ? 'Nenhum aluno utilizou ainda (0)'
                                  : `Ver ${realUsage.count} ${
                                      realUsage.count === 1 ? 'aluno vinculado' : 'alunos vinculados'
                                    }`}
                              </button>
                            </div>
                          </div>

                          {/* Validade e Regra Mínima */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                              <span className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                Validade:
                              </span>
                              <span className="font-medium">
                                {coupon.expiresAt ? (
                                  <span
                                    className={
                                      isExpired
                                        ? 'text-rose-500 font-bold'
                                        : 'text-slate-800 dark:text-slate-200'
                                    }
                                  >
                                    Até {coupon.expiresAt.split('-').reverse().join('/')}
                                    {isExpired ? ' (Expirado)' : ''}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Sem data limite</span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                              <span className="flex items-center gap-1.5 text-slate-400">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                Valor mínimo:
                              </span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {coupon.minPlanPrice !== null &&
                                coupon.minPlanPrice !== undefined &&
                                coupon.minPlanPrice > 0 ? (
                                  `Planos ≥ R$ ${coupon.minPlanPrice.toFixed(2)}`
                                ) : (
                                  <span className="text-slate-400">Qualquer plano</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.01] space-y-3">
                        <div className="flex items-center justify-between text-xs pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-500 dark:text-dark-muted hover:text-slate-800 dark:hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={coupon.active}
                              onChange={() => handleToggleCouponActive(coupon)}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{coupon.active ? 'Cupom Ativo' : 'Cupom Pausado'}</span>
                          </label>

                          <span className="text-[10px] text-slate-400">
                            {coupon.updatedAt ? new Date(coupon.updatedAt).toLocaleDateString('pt-BR') : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setCouponToEdit(coupon);
                              setIsCouponEditorOpen(true);
                            }}
                            className="flex-1 text-xs py-1.5"
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          >
                            Editar Cupom
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCouponToDelete(coupon)}
                            className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            title="Excluir cupom"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Paginação por URL para Cupons */}
              {totalCouponPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01]">
                  <span className="text-xs text-slate-500 dark:text-dark-muted font-medium">
                    Mostrando <strong className="text-slate-800 dark:text-white">{(validCouponPage - 1) * COUPONS_PER_PAGE + 1}</strong> a{' '}
                    <strong className="text-slate-800 dark:text-white">
                      {Math.min(validCouponPage * COUPONS_PER_PAGE, filteredCoupons.length)}
                    </strong>{' '}
                    de <strong className="text-slate-800 dark:text-white">{filteredCoupons.length}</strong> cupons cadastrados
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={validCouponPage <= 1}
                      onClick={() => handlePageChange(validCouponPage - 1)}
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                      className="text-xs px-2.5 py-1"
                    >
                      Anterior
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalCouponPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          type="button"
                          onClick={() => handlePageChange(pg)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            pg === validCouponPage
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={validCouponPage >= totalCouponPages}
                      onClick={() => handlePageChange(validCouponPage + 1)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      className="text-xs px-2.5 py-1"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: OPÇÕES E MEIOS DE PAGAMENTO */}
      {/* ========================================================================= */}
      {currentTab === 'pagamentos' && (
        <PaymentMethodsManagement plans={plans} />
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

      {/* Modal Confirmação de Exclusão de Plano */}
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
              <Button type="button" variant="ghost" onClick={() => setPlanToDelete(null)} disabled={isDeletingPlan}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isDeletingPlan}
                onClick={handleConfirmDeletePlan}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Criar / Editar Cupom */}
      <CouponEditorModal
        isOpen={isCouponEditorOpen}
        onClose={() => {
          setIsCouponEditorOpen(false);
          setCouponToEdit(null);
        }}
        couponToEdit={couponToEdit}
        onSaved={loadData}
      />

      {/* Modal Confirmação de Exclusão de Cupom */}
      {couponToDelete && (
        <Modal
          isOpen={!!couponToDelete}
          onClose={() => setCouponToDelete(null)}
          title="Excluir Cupom de Desconto"
          description={`Tem certeza que deseja excluir o cupom "${couponToDelete.code}"?`}
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Esta ação removerá permanentemente o cupom &ldquo;{couponToDelete.code}&rdquo;. Ele não poderá mais ser aplicado a novos planos ou mensalidades de alunos.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCouponToDelete(null)} disabled={isDeletingCoupon}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isDeletingCoupon}
                onClick={handleConfirmDeleteCoupon}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Lista de Alunos com Cupom Aplicado */}
      <CouponStudentsModal
        isOpen={!!couponForStudentsModal}
        onClose={() => setCouponForStudentsModal(null)}
        coupon={couponForStudentsModal}
        students={students}
      />
    </div>
  );
};

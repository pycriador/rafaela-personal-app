import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Globe,
  Star,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { MembershipPlan, PlanFrequency, PaymentMethod } from '../../types';
import { planRepository } from '../../repositories/planRepository';
import { useToast } from '../../context/ToastContext';

interface PlanEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: MembershipPlan | null;
  onSaved: () => void;
}

export const PlanEditorModal: React.FC<PlanEditorModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
  onSaved,
}) => {
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'treino' | 'combo'>('treino');
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [frequency, setFrequency] = useState<PlanFrequency>('trimestral');
  const [price, setPrice] = useState<number>(350);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(['pix', 'cartao_credito']);
  const [features, setFeatures] = useState<string[]>([
    'Acesso total ao app de treino',
    'Ajustes de carga semanais',
    'Suporte direto via WhatsApp',
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [showOnLandingPage, setShowOnLandingPage] = useState<boolean>(true);
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [badgeText, setBadgeText] = useState('');
  const [active, setActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name);
      setDescription(planToEdit.description);
      setCategory(planToEdit.category || 'treino');
      setDurationMonths(planToEdit.durationMonths);
      setFrequency(planToEdit.frequency);
      setPrice(planToEdit.price);
      setPaymentMethods(planToEdit.allowedPaymentMethods || ['pix', 'cartao_credito']);
      setFeatures(planToEdit.features && planToEdit.features.length > 0 ? [...planToEdit.features] : []);
      setShowOnLandingPage(planToEdit.showOnLandingPage);
      setIsPopular(!!planToEdit.isPopular);
      setBadgeText(planToEdit.badgeText || '');
      setActive(planToEdit.active !== false);
    } else {
      setName('');
      setDescription('');
      setCategory('treino');
      setDurationMonths(6);
      setFrequency('semestral');
      setPrice(600);
      setPaymentMethods(['pix', 'cartao_credito']);
      setFeatures([
        'Planejamento periodizado completo',
        'Geração automática de parcelas mensais',
        'Avaliação física periódica',
        'Suporte direto via WhatsApp com a Rafaela',
      ]);
      setShowOnLandingPage(true);
      setIsPopular(false);
      setBadgeText('');
      setActive(true);
    }
  }, [planToEdit, isOpen]);

  // Quick preset duration click
  const handleDurationPreset = (months: number) => {
    setDurationMonths(months);
    if (months === 1) setFrequency('mensal');
    else if (months === 3) setFrequency('trimestral');
    else if (months === 6) setFrequency('semestral');
    else if (months === 12) setFrequency('anual');
    else setFrequency('personalizado');
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Informe o nome do plano.');
      return;
    }
    if (durationMonths <= 0) {
      toastError('A duração em meses deve ser maior que zero.');
      return;
    }
    if (price <= 0) {
      toastError('O preço deve ser maior que zero.');
      return;
    }
    if (paymentMethods.length === 0) {
      toastError('Selecione pelo menos uma forma de pagamento aceita.');
      return;
    }

    setIsSaving(true);
    try {
      const monthlyEquivalent = Math.round((price / durationMonths) * 100) / 100;

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        durationMonths,
        frequency,
        price,
        monthlyEquivalentPrice: monthlyEquivalent,
        allowedPaymentMethods: paymentMethods,
        features: features.filter((f) => f.trim().length > 0),
        showOnLandingPage,
        isPopular,
        badgeText: isPopular ? badgeText.trim() || 'Mais Escolhido' : badgeText.trim(),
        active,
      };

      if (planToEdit) {
        await planRepository.updatePlan(planToEdit.id, payload);
        success(`Plano "${name}" atualizado com sucesso!`);
      } else {
        await planRepository.createPlan(payload);
        success(`Plano "${name}" criado com sucesso!`);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao salvar plano.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? 'Editar Plano de Consultoria' : 'Criar Novo Plano de Consultoria'}
      description="Configure o plano comercial, regras de parcelamento e visibilidade na vitrine do site"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome & Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nome do Plano <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Ex: Semestral Foco & Consistência"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Categoria
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'treino' | 'combo')}
              className="text-xs"
            >
              <option value="treino">Apenas Treino</option>
              <option value="combo">Combo Treino + Nutrição</option>
            </Select>
          </div>
        </div>

        {/* Duração em Meses com Presets Rápidos */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Duração do Plano (Meses & Parcelas) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 3, 6, 12].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleDurationPreset(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  durationMonths === m
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {m === 1 ? '1 Mês (Mensal)' : `${m} Meses (${m}x)`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Duração Exata (Meses):</span>
              <Input
                type="number"
                min="1"
                max="36"
                value={durationMonths}
                onChange={(e) => handleDurationPreset(parseInt(e.target.value, 10) || 1)}
                required
                className="text-xs font-mono font-bold"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Periodicidade:</span>
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as PlanFrequency)}
                className="text-xs"
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
                <option value="personalizado">Personalizado</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Preço Total & Equivalente por Mês */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200/80 dark:border-white/[0.06]">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Valor Total do Plano (R$) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold font-mono">
                R$
              </span>
              <Input
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
                className="pl-9 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-medium text-slate-400 block">
              Equivalente Mensal ({durationMonths} parcelas):
            </span>
            <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              R$ {(price / Math.max(1, durationMonths)).toFixed(2)}
              <span className="text-xs font-normal text-slate-400"> / mês</span>
            </p>
          </div>
        </div>

        {/* Formas de Pagamento Permitidas */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Formas de Pagamento Aceitas <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={paymentMethods.includes('pix')}
                onChange={() => togglePaymentMethod('pix')}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                PIX Instantâneo
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={paymentMethods.includes('cartao_credito')}
                onChange={() => togglePaymentMethod('cartao_credito')}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Cartão de Crédito
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={paymentMethods.includes('boleto')}
                onChange={() => togglePaymentMethod('boleto')}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Boleto Bancário
              </span>
            </label>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Descrição Curta
          </label>
          <Input
            type="text"
            placeholder="Ex: Foco em evolução contínua, correção biomecânica e hipertrofia."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Benefícios / Features List */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Benefícios Inclusos no Plano ({features.length})
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Adicionar novo benefício..."
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              className="text-xs flex-1"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddFeature}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-dark-cardElevated text-xs border border-slate-200/60 dark:border-white/[0.04]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 truncate">{feat}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Remover benefício"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Visibilidade e Destaques na Landing Page */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] space-y-3 bg-slate-50/50 dark:bg-white/[0.02]">
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            Vitrine do Site & Destaques
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnLandingPage}
                onChange={(e) => setShowOnLandingPage(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Exibir na Landing Page do Site
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Aparece nas opções de planos públicos para novos visitantes
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Destaque ("Mais Escolhido")
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Card ganha borda destacada e badge exclusivo
                </span>
              </div>
            </label>
          </div>

          {isPopular && (
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-dark-muted block mb-1">
                Texto do Badge de Destaque
              </label>
              <Input
                type="text"
                placeholder="Ex: Mais Escolhido ou Melhor Custo-Benefício"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="text-xs"
              />
            </div>
          )}
        </div>

        {/* Botões do Rodapé */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Check className="w-4 h-4" />}>
            {planToEdit ? 'Salvar Alterações' : 'Criar Plano'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { Tag, Percent, DollarSign, Calendar, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DiscountCoupon } from '../../types';
import { couponRepository } from '../../repositories/couponRepository';
import { useToast } from '../../context/ToastContext';

interface CouponEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponToEdit: DiscountCoupon | null;
  onSaved: () => void;
}

export const CouponEditorModal: React.FC<CouponEditorModalProps> = ({
  isOpen,
  onClose,
  couponToEdit,
  onSaved,
}) => {
  const { success, error: toastError } = useToast();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('15');

  // Regras adicionais
  const [hasLimit, setHasLimit] = useState(false);
  const [maxUses, setMaxUses] = useState<string>('50');

  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string>('');

  const [hasMinPrice, setHasMinPrice] = useState(false);
  const [minPlanPrice, setMinPlanPrice] = useState<string>('150');

  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (couponToEdit) {
      setCode(couponToEdit.code);
      setDescription(couponToEdit.description || '');
      setDiscountType(couponToEdit.discountType);
      setDiscountValue(String(couponToEdit.discountValue));

      if (couponToEdit.maxUses !== null && couponToEdit.maxUses > 0) {
        setHasLimit(true);
        setMaxUses(String(couponToEdit.maxUses));
      } else {
        setHasLimit(false);
        setMaxUses('50');
      }

      if (couponToEdit.expiresAt) {
        setHasExpiry(true);
        setExpiresAt(couponToEdit.expiresAt);
      } else {
        setHasExpiry(false);
        setExpiresAt('');
      }

      if (couponToEdit.minPlanPrice !== null && couponToEdit.minPlanPrice !== undefined && couponToEdit.minPlanPrice > 0) {
        setHasMinPrice(true);
        setMinPlanPrice(String(couponToEdit.minPlanPrice));
      } else {
        setHasMinPrice(false);
        setMinPlanPrice('150');
      }

      setActive(couponToEdit.active);
    } else {
      setCode('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue('15');
      setHasLimit(false);
      setMaxUses('50');
      setHasExpiry(false);
      setExpiresAt('');
      setHasMinPrice(false);
      setMinPlanPrice('150');
      setActive(true);
    }
  }, [couponToEdit, isOpen]);

  const handleCodeChange = (val: string) => {
    // Sanitiza para maiúsculas e remove espaços e caracteres especiais inadequados
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    setCode(cleaned);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toastError('Informe o código do cupom (ex: VERAO2026).');
      return;
    }

    if (cleanCode.length < 3) {
      toastError('O código do cupom deve ter pelo menos 3 caracteres.');
      return;
    }

    const numVal = parseFloat(discountValue);
    if (isNaN(numVal) || numVal <= 0) {
      toastError('Informe um valor de desconto válido maior que zero.');
      return;
    }

    if (discountType === 'percentage' && numVal > 100) {
      toastError('A porcentagem de desconto não pode ser maior que 100%.');
      return;
    }

    let parsedMaxUses: number | null = null;
    if (hasLimit) {
      const uses = parseInt(maxUses, 10);
      if (isNaN(uses) || uses <= 0) {
        toastError('Informe uma quantidade máxima de usos válida.');
        return;
      }
      parsedMaxUses = uses;
    }

    let parsedMinPrice: number | null = null;
    if (hasMinPrice) {
      const price = parseFloat(minPlanPrice);
      if (isNaN(price) || price < 0) {
        toastError('Informe um valor mínimo de plano válido.');
        return;
      }
      parsedMinPrice = price;
    }

    if (hasExpiry && !expiresAt) {
      toastError('Selecione a data de validade do cupom.');
      return;
    }

    setIsSaving(true);
    try {
      await couponRepository.saveCoupon({
        id: couponToEdit ? couponToEdit.id : undefined,
        code: cleanCode,
        description: description.trim(),
        discountType,
        discountValue: numVal,
        maxUses: parsedMaxUses,
        expiresAt: hasExpiry ? expiresAt : null,
        minPlanPrice: parsedMinPrice,
        active,
      });

      success(
        couponToEdit
          ? `Cupom "${cleanCode}" atualizado com sucesso!`
          : `Cupom "${cleanCode}" criado com sucesso!`
      );
      onSaved();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Erro ao salvar cupom.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={couponToEdit ? `Editar Cupom: ${couponToEdit.code}` : 'Criar Novo Cupom de Desconto'}
      description="Configure o código, tipo de desconto, limite de utilização e data de validade."
      size="md"
    >
      <form onSubmit={handleSave} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Código do Cupom */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
            Código do Cupom <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Ex: VERAO2026, VIP15, BLACKFRIDAY"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="pl-9 font-mono uppercase tracking-wider font-bold text-sm"
              required
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Letras maiúsculas, números e hífens. O código que os alunos ou você digitarão.
          </span>
        </div>

        {/* Descrição */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
            Descrição / Finalidade
          </label>
          <Input
            type="text"
            placeholder="Ex: Campanha de volta às aulas ou indicação de amigo"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Tipo de Desconto e Valor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
              Tipo de Desconto <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  discountType === 'percentage'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Porcentagem (%)</span>
              </button>

              <button
                type="button"
                onClick={() => setDiscountType('fixed')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  discountType === 'fixed'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Valor Fixo (R$)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block mb-1">
              Valor do Desconto <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                step="any"
                min="0.01"
                max={discountType === 'percentage' ? '100' : undefined}
                placeholder={discountType === 'percentage' ? '15' : '50.00'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="pr-9 font-bold text-sm"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                {discountType === 'percentage' ? '%' : 'R$'}
              </span>
            </div>
          </div>
        </div>

        {/* Quantidade de Cupons / Limite de Usos */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-500" />
              Quantidade / Limite de Resgates
            </span>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-muted cursor-pointer">
              <input
                type="checkbox"
                checked={hasLimit}
                onChange={(e) => setHasLimit(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Limitar quantidade</span>
            </label>
          </div>

          {hasLimit ? (
            <div className="pt-1">
              <Input
                type="number"
                min="1"
                placeholder="Ex: 50 cupons disponíveis"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="text-xs"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                {couponToEdit
                  ? `Já utilizado ${couponToEdit.usedCount} de ${maxUses || 0} vezes.`
                  : 'Após atingir essa quantidade de usos, o cupom será marcado como esgotado.'}
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              Uso ilimitado — qualquer aluno poderá resgatar enquanto o cupom estiver ativo.
            </p>
          )}
        </div>

        {/* Validade / Data de Expiração */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              Prazo de Validade
            </span>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-muted cursor-pointer">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Definir data de expiração</span>
            </label>
          </div>

          {hasExpiry ? (
            <div className="pt-1">
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="text-xs"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                O cupom ficará indisponível automaticamente a partir das 23:59 desta data.
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              Sem data de expiração — válido por tempo indeterminado até ser desativado manualmente.
            </p>
          )}
        </div>

        {/* Valor Mínimo do Plano */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              Valor Mínimo do Plano
            </span>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-muted cursor-pointer">
              <input
                type="checkbox"
                checked={hasMinPrice}
                onChange={(e) => setHasMinPrice(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Exigir valor mínimo</span>
            </label>
          </div>

          {hasMinPrice ? (
            <div className="pt-1">
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 200.00"
                  value={minPlanPrice}
                  onChange={(e) => setMinPlanPrice(e.target.value)}
                  className="text-xs pr-9"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  R$
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Só será aceito se o valor bruto do plano for igual ou superior a esta quantia.
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              Aplicável a qualquer valor de plano (sem exigência mínima).
            </p>
          )}
        </div>

        {/* Status Ativo / Inativo */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/30 dark:bg-white/[0.01]">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Status do Cupom
            </span>
            <span className="text-[11px] text-slate-400 block">
              {active ? 'Ativo — pode ser resgatado pelos alunos.' : 'Inativo — temporariamente pausado.'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Rodapé e Botões */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {couponToEdit ? 'Salvar Alterações' : 'Cadastrar Cupom'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

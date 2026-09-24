import React, { useState, useEffect } from 'react';
import { ExternalPaymentLink, ExternalPaymentProvider, MembershipPlan } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../../context/ToastContext';
import { Globe, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface ExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkToEdit: ExternalPaymentLink | null;
  plans: MembershipPlan[];
  onSave: (data: Omit<ExternalPaymentLink, 'id' | 'createdAt'>) => Promise<void>;
}

export const PROVIDERS_META: Record<
  ExternalPaymentProvider,
  { name: string; tag: string; defaultUrlPrefix: string; description: string; color: string }
> = {
  infinitepay: {
    name: 'InfinitePay',
    tag: 'Menores Taxas & Link Inteligente',
    defaultUrlPrefix: 'https://loja.infinitepay.io/',
    description: 'Link inteligente que aceita PIX sem taxa e parcelamento até 12x.',
    color: 'emerald',
  },
  pagbank: {
    name: 'PagBank (UOL)',
    tag: 'Checkout Seguro UOL',
    defaultUrlPrefix: 'https://pag.ae/',
    description: 'Checkout transparente e botão de pagamento com segurança PagBank.',
    color: 'amber',
  },
  pagseguro: {
    name: 'PagSeguro Transparente',
    tag: 'Gateway de Pagamento',
    defaultUrlPrefix: 'https://pagseguro.uol.com.br/',
    description: 'Link direto da plataforma PagSeguro.',
    color: 'yellow',
  },
  mercadopago: {
    name: 'Mercado Pago',
    tag: 'Checkout Pro & Point',
    defaultUrlPrefix: 'https://mpago.la/',
    description: 'Cobrança com saldo em conta, cartão parcelado e PIX Mercado Pago.',
    color: 'sky',
  },
  asaas: {
    name: 'Asaas',
    tag: 'Gestão & Régua de Cobrança',
    defaultUrlPrefix: 'https://www.asaas.com/c/',
    description: 'Cobrança recorrente automatizada com split e notificações WhatsApp/SMS.',
    color: 'blue',
  },
  stone_ton: {
    name: 'Ton / Stone',
    tag: 'Link de Pagamento Ton',
    defaultUrlPrefix: 'https://link.ton.com.br/',
    description: 'Link de pagamento rápido da Stone e Ton.',
    color: 'emerald',
  },
  outro: {
    name: 'Outro Gateway / Checkout Próprio',
    tag: 'Link Externo Personalizado',
    defaultUrlPrefix: 'https://',
    description: 'Outra solução de checkout ou página externa de pagamento.',
    color: 'violet',
  },
};

export const ExternalLinkModal: React.FC<ExternalLinkModalProps> = ({
  isOpen,
  onClose,
  linkToEdit,
  plans,
  onSave,
}) => {
  const { error: toastError } = useToast();
  const [provider, setProvider] = useState<ExternalPaymentProvider>('infinitepay');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [applicablePlanIds, setApplicablePlanIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (linkToEdit) {
      setProvider(linkToEdit.provider);
      setTitle(linkToEdit.title);
      setUrl(linkToEdit.url);
      setDescription(linkToEdit.description || '');
      setActive(linkToEdit.active);
      setApplicablePlanIds(linkToEdit.applicablePlanIds || []);
    } else {
      setProvider('infinitepay');
      setTitle('InfinitePay (Link Inteligente / PIX e Cartão)');
      setUrl('https://loja.infinitepay.io/rafaela-personal');
      setDescription('Menores taxas do mercado. Aceita PIX imediato e parcelamento no cartão até 12x.');
      setActive(true);
      setApplicablePlanIds([]);
    }
  }, [linkToEdit, isOpen]);

  const handleProviderChange = (newProvider: ExternalPaymentProvider) => {
    setProvider(newProvider);
    const meta = PROVIDERS_META[newProvider];
    if (!linkToEdit) {
      setTitle(`${meta.name} (${meta.tag})`);
      setUrl(meta.defaultUrlPrefix);
      setDescription(meta.description);
    }
  };

  const handleTogglePlan = (planId: string) => {
    setApplicablePlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Informe um título ou nome para o link de pagamento.');
      return;
    }
    if (!url.trim() || !url.startsWith('http')) {
      toastError('Informe uma URL de pagamento válida (iniciando com http:// ou https://).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        provider,
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        active,
        applicablePlanIds: applicablePlanIds.length > 0 ? applicablePlanIds : undefined,
      });
      onClose();
    } catch {
      toastError('Erro ao salvar link de pagamento externo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={linkToEdit ? 'Editar Link de Pagamento Externo' : 'Cadastrar Link de Pagamento Externo'}
      description="Configure links de gateways como InfinitePay, PagBank, PagSeguro, Mercado Pago, Asaas e Ton"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Provedor / Gateway */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Empresa / Gateway de Pagamento
          </label>
          <Select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as ExternalPaymentProvider)}
            className="text-xs"
          >
            {Object.entries(PROVIDERS_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.name} — {meta.tag}
              </option>
            ))}
          </Select>
        </div>

        {/* Título de Exibição */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Título de Identificação
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: InfinitePay - Link de Pagamento Inteligente"
            className="text-xs"
            required
          />
        </div>

        {/* URL do Link */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            URL do Link de Pagamento
          </label>
          <div className="relative">
            <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://loja.infinitepay.io/..."
              className="pl-9 text-xs font-mono"
              required
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Cole aqui o link gerado no aplicativo da empresa ou no painel da maquininha.
          </span>
        </div>

        {/* Descrição / Instruções */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Instruções para o Aluno (Opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Ex: Aceita PIX imediato e cartão de crédito em até 12x. Ao finalizar, envie o comprovante."
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-dark-card p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Planos Vinculados (Opcional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Planos Aplicáveis
          </label>
          <span className="text-[11px] text-slate-400 block mb-2">
            Deixe todos desmarcados para disponibilizar este link para qualquer plano, ou selecione planos específicos:
          </span>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {plans.map((p) => {
              const isChecked = applicablePlanIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => handleTogglePlan(p.id)}
                  className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate font-medium">{p.name}</span>
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Ativo / Inativo */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Link Ativo para Cobranças
            </span>
            <span className="text-[11px] text-slate-400 block">
              Se desativado, o link não será exibido como opção de pagamento.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            leftIcon={<Globe className="w-4 h-4" />}
          >
            {linkToEdit ? 'Salvar Alterações' : 'Cadastrar Link'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

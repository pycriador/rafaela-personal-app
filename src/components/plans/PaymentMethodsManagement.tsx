import React, { useState, useEffect } from 'react';
import {
  PaymentSettings,
  ExternalPaymentLink,
  PixPaymentConfig,
  BoletoPaymentConfig,
  PosMachineConfig,
  MembershipPlan,
} from '../../types';
import {
  paymentMethodRepository,
  generatePixEmvPayload,
  calculatePixCrc16,
} from '../../repositories/paymentMethodRepository';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useTrainerFilter } from '../../context/TrainerFilterContext';
import { ExternalLinkModal, PROVIDERS_META } from './ExternalLinkModal';
import {
  CreditCard,
  QrCode,
  FileText,
  Smartphone,
  Plus,
  Check,
  Copy,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Wallet,
  Building,
  RefreshCw,
} from 'lucide-react';

interface PaymentMethodsManagementProps {
  plans: MembershipPlan[];
}

const POPULAR_BRANDS = [
  'Visa',
  'Mastercard',
  'Elo',
  'American Express',
  'Hipercard',
  'Alelo',
  'VR Benefícios',
  'Sodexo (Pluxee)',
  'Cabal',
  'Banescard',
];

export const PaymentMethodsManagement: React.FC<PaymentMethodsManagementProps> = ({ plans }) => {
  const { success, error: toastError, info } = useToast();
  const { effectiveTrainerId } = useTrainerFilter();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Sub-tabs inside Opções de Pagamento
  const [activeSection, setActiveSection] = useState<
    'links' | 'pix' | 'boleto' | 'maquininha'
  >('links');

  // External link modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<ExternalPaymentLink | null>(null);

  // Copied states
  const [copiedLinkUrl, setCopiedLinkUrl] = useState<string | null>(null);
  const [copiedPixPayload, setCopiedPixPayload] = useState(false);

  // PIX Interactive simulator state
  const [pixAmountSim, setPixAmountSim] = useState<number>(280);
  const [pixTxIdSim, setPixTxIdSim] = useState<string>('MENSAL');

  // Form states for saving
  const [pixForm, setPixForm] = useState<PixPaymentConfig>({
    enabled: true,
    keyType: 'email',
    keyValue: '',
    beneficiaryName: '',
    beneficiaryCity: 'Sao Paulo',
    bankName: '',
    instructions: '',
  });

  const [boletoForm, setBoletoForm] = useState<BoletoPaymentConfig>({
    enabled: true,
    provider: 'PagBank / Asaas',
    daysUntilDue: 3,
    lateFinePercentage: 2,
    monthlyInterestPercentage: 1,
    instructions: '',
  });

  const [posForm, setPosForm] = useState<PosMachineConfig>({
    enabled: true,
    provider: 'pagbank_celular',
    providerName: 'PagBank no Celular (Tap on Phone)',
    acceptedBrands: POPULAR_BRANDS.slice(0, 8),
    maxInstallments: 12,
    passFeeToStudent: false,
    instructions: '',
  });

  const [isSavingPix, setIsSavingPix] = useState(false);
  const [isSavingBoleto, setIsSavingBoleto] = useState(false);
  const [isSavingPos, setIsSavingPos] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodRepository.getSettings(effectiveTrainerId);
      setSettings(data);
      setPixForm(data.pix);
      setBoletoForm(data.boleto);
      setPosForm(data.posMachine);
    } catch {
      toastError('Erro ao carregar configurações de pagamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [effectiveTrainerId]);

  // Compute live PIX EMV Payload
  const livePixPayload = (() => {
    if (!pixForm.keyValue) return '';
    return generatePixEmvPayload({
      pixKey: pixForm.keyValue,
      beneficiaryName: pixForm.beneficiaryName || 'Rafaela Personal',
      beneficiaryCity: pixForm.beneficiaryCity || 'Sao Paulo',
      amount: pixAmountSim > 0 ? pixAmountSim : undefined,
      txId: pixTxIdSim || '***',
    });
  })();

  const qrCodeUrl = livePixPayload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
        livePixPayload
      )}`
    : '';

  // Copy handlers
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkUrl(url);
    success('Link de pagamento copiado para a área de transferência!');
    setTimeout(() => setCopiedLinkUrl(null), 2500);
  };

  const handleCopyPixPayload = () => {
    if (!livePixPayload) return;
    navigator.clipboard.writeText(livePixPayload);
    setCopiedPixPayload(true);
    success('Código PIX Copia e Cola oficial copiado com sucesso!');
    setTimeout(() => setCopiedPixPayload(false), 2500);
  };

  // External link actions
  const handleSaveExternalLink = async (
    data: Omit<ExternalPaymentLink, 'id' | 'createdAt'>
  ) => {
    if (linkToEdit) {
      await paymentMethodRepository.updateExternalLink(linkToEdit.id, data, effectiveTrainerId);
      success('Link de pagamento atualizado com sucesso!');
    } else {
      await paymentMethodRepository.addExternalLink(data, effectiveTrainerId);
      success('Novo link de pagamento cadastrado com sucesso!');
    }
    await loadSettings();
  };

  const handleDeleteExternalLink = async (id: string, title: string) => {
    if (!window.confirm(`Deseja realmente excluir o link de pagamento "${title}"?`)) return;
    await paymentMethodRepository.deleteExternalLink(id, effectiveTrainerId);
    success('Link de pagamento excluído.');
    await loadSettings();
  };

  const handleToggleLinkActive = async (link: ExternalPaymentLink) => {
    const updated = !link.active;
    await paymentMethodRepository.toggleExternalLink(link.id, updated, effectiveTrainerId);
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        externalLinks: prev.externalLinks.map((l) =>
          l.id === link.id ? { ...l, active: updated } : l
        ),
      };
    });
    info(`Link "${link.title}" ${updated ? 'ativado' : 'pausado'}.`);
  };

  // Save Sections
  const handleSavePix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixForm.keyValue.trim()) {
      toastError('Informe a chave PIX.');
      return;
    }
    setIsSavingPix(true);
    try {
      const updated = await paymentMethodRepository.updatePix(pixForm, effectiveTrainerId);
      setSettings(updated);
      success('Configurações de PIX salvas com sucesso!');
    } catch {
      toastError('Erro ao salvar configurações de PIX.');
    } finally {
      setIsSavingPix(false);
    }
  };

  const handleSaveBoleto = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBoleto(true);
    try {
      const updated = await paymentMethodRepository.updateBoleto(boletoForm, effectiveTrainerId);
      setSettings(updated);
      success('Configurações de Boleto salvas com sucesso!');
    } catch {
      toastError('Erro ao salvar configurações de boleto.');
    } finally {
      setIsSavingBoleto(false);
    }
  };

  const handleSavePos = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPos(true);
    try {
      const updated = await paymentMethodRepository.updatePosMachine(posForm, effectiveTrainerId);
      setSettings(updated);
      success('Configurações de Maquininha no Celular e Cartão salvas com sucesso!');
    } catch {
      toastError('Erro ao salvar maquininha e cartões.');
    } finally {
      setIsSavingPos(false);
    }
  };

  const handleToggleBrand = (brand: string) => {
    setPosForm((prev) => {
      const exists = prev.acceptedBrands.includes(brand);
      const next = exists
        ? prev.acceptedBrands.filter((b) => b !== brand)
        : [...prev.acceptedBrands, brand];
      return { ...prev, acceptedBrands: next };
    });
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-slate-400">Carregando opções de pagamento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-navegação interna de opções de pagamento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setActiveSection('links')}
          className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            activeSection === 'links'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 shadow-2xs font-semibold'
              : 'border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Links de Gateways</span>
            <span className="text-[10px] text-slate-400 block font-normal">
              {settings.externalLinks.filter((l) => l.active).length} ativos (InfinitePay, PagBank...)
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('pix')}
          className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            activeSection === 'pix'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 shadow-2xs font-semibold'
              : 'border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">PIX Direto & QR Code</span>
            <span className="text-[10px] text-slate-400 block font-normal">
              {pixForm.enabled ? 'Ativo e Gerando' : 'Desativado'}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('maquininha')}
          className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            activeSection === 'maquininha'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 shadow-2xs font-semibold'
              : 'border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Cartão no Celular</span>
            <span className="text-[10px] text-slate-400 block font-normal">
              Tap on Phone & Bandeiras
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('boleto')}
          className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
            activeSection === 'boleto'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 shadow-2xs font-semibold'
              : 'border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Boleto Bancário</span>
            <span className="text-[10px] text-slate-400 block font-normal">
              {boletoForm.enabled ? 'Ativo (3 dias)' : 'Desativado'}
            </span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 1: LINKS DE PAGAMENTO EXTERNO (GATEWAYS) */}
      {/* ========================================================================= */}
      {activeSection === 'links' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                Links de Pagamento das Principais Empresas do Brasil
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cadastre e gerencie links gerados no InfinitePay, PagBank, PagSeguro, Mercado Pago, Asaas ou Ton.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setLinkToEdit(null);
                setIsLinkModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs shrink-0"
            >
              + Novo Link Externo
            </Button>
          </div>

          {/* Grid de Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.externalLinks.map((link) => {
              const meta = PROVIDERS_META[link.provider] || PROVIDERS_META.outro;
              const isCopied = copiedLinkUrl === link.url;

              return (
                <Card
                  key={link.id}
                  className={`flex flex-col justify-between overflow-hidden border transition-all ${
                    !link.active
                      ? 'opacity-60 bg-slate-50/50 dark:bg-white/[0.01]'
                      : 'border-slate-200/80 dark:border-white/[0.08]'
                  }`}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
                            {meta.name}
                          </span>
                          <Badge variant={link.active ? 'success' : 'neutral'} size="sm">
                            {link.active ? 'Ativo' : 'Pausado'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {link.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLinkToEdit(link);
                            setIsLinkModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                          title="Editar link"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExternalLink(link.id, link.title)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Excluir link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-dark-muted line-clamp-2 min-h-8">
                      {link.description || meta.description}
                    </p>

                    {/* URL formatada */}
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.04] text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                      {link.url}
                    </div>

                    {/* Planos vinculados */}
                    {link.applicablePlanIds && link.applicablePlanIds.length > 0 && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span>Vinculado a:</span>
                        <strong className="text-slate-700 dark:text-slate-200">
                          {link.applicablePlanIds.length} plano(s) específico(s)
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Ações inferiores */}
                  <div className="p-3 border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/40 dark:bg-white/[0.01] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyLink(link.url)}
                        leftIcon={
                          isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                        className="text-xs px-2.5 py-1"
                      >
                        {isCopied ? 'Copiado!' : 'Copiar'}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                        leftIcon={<ExternalLink className="w-3.5 h-3.5 text-sky-500" />}
                        className="text-xs px-2.5 py-1"
                      >
                        Testar
                      </Button>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-500 dark:text-dark-muted">
                      <input
                        type="checkbox"
                        checked={link.active}
                        onChange={() => handleToggleLinkActive(link)}
                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Ativo</span>
                    </label>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO 2: PIX DIRETO COM QR CODE & COPIA E COLA */}
      {/* ========================================================================= */}
      {activeSection === 'pix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário de Configuração do PIX */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-5 border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Configuração da Chave PIX da Personal
                    </h3>
                    <span className="text-xs text-slate-400">
                      Utilizada no gerador dinâmico oficial BR Code e recebimentos imediatos
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pixForm.enabled}
                    onChange={(e) => setPixForm({ ...pixForm, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              <form onSubmit={handleSavePix} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tipo de Chave PIX
                    </label>
                    <Select
                      value={pixForm.keyType}
                      onChange={(e) =>
                        setPixForm({ ...pixForm, keyType: e.target.value as any })
                      }
                      className="text-xs"
                    >
                      <option value="email">E-mail</option>
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="phone">Telefone / Celular</option>
                      <option value="random">Chave Aleatória (EVP)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Chave PIX
                    </label>
                    <Input
                      type="text"
                      value={pixForm.keyValue}
                      onChange={(e) => setPixForm({ ...pixForm, keyValue: e.target.value })}
                      placeholder="rafaela.personal@email.com"
                      className="text-xs font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Titular / Favorecido
                    </label>
                    <Input
                      type="text"
                      value={pixForm.beneficiaryName}
                      onChange={(e) =>
                        setPixForm({ ...pixForm, beneficiaryName: e.target.value })
                      }
                      placeholder="Rafaela Santos Silva"
                      className="text-xs"
                      required
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Nome conforme cadastrado na conta bancária (máx. 25 letras).
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cidade da Conta
                    </label>
                    <Input
                      type="text"
                      value={pixForm.beneficiaryCity}
                      onChange={(e) =>
                        setPixForm({ ...pixForm, beneficiaryCity: e.target.value })
                      }
                      placeholder="Sao Paulo"
                      className="text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Instituição Bancária
                    </label>
                    <Input
                      type="text"
                      value={pixForm.bankName}
                      onChange={(e) => setPixForm({ ...pixForm, bankName: e.target.value })}
                      placeholder="Nubank / Banco Inter / Itaú"
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Instruções no Recibo/Comprovante
                    </label>
                    <Input
                      type="text"
                      value={pixForm.instructions || ''}
                      onChange={(e) =>
                        setPixForm({ ...pixForm, instructions: e.target.value })
                      }
                      placeholder="Envie o comprovante pelo WhatsApp após pagar"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSavingPix}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Salvar Configurações do PIX
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Preview Interativo ao Vivo do QR Code & Copia e Cola */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 border border-slate-200/80 dark:border-white/[0.08] bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Demonstração do QR Code em Tempo Real
                  </h4>
                </div>
                <Badge variant="success" size="sm">
                  Padrão EMV Oficial
                </Badge>
              </div>

              {/* Simulador de valor */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Valor Simulado (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pixAmountSim}
                    onChange={(e) => setPixAmountSim(parseFloat(e.target.value) || 0)}
                    className="text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Identificador (TxID)
                  </label>
                  <Input
                    type="text"
                    value={pixTxIdSim}
                    onChange={(e) => setPixTxIdSim(e.target.value.toUpperCase())}
                    className="text-xs font-mono uppercase"
                  />
                </div>
              </div>

              {/* QR Code Imagem Gerada */}
              <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] flex flex-col items-center justify-center text-center shadow-xs">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code PIX Dinâmico"
                    className="w-44 h-44 object-contain rounded-xl p-1 bg-white"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center bg-slate-100 dark:bg-white/[0.04] rounded-xl text-xs text-slate-400">
                    Preencha a chave PIX
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {pixForm.beneficiaryName || 'Rafaela Personal'}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  {pixAmountSim > 0 ? `R$ ${pixAmountSim.toFixed(2)}` : 'Valor aberto / livre'}
                </span>
              </div>

              {/* Código PIX Copia e Cola */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-dark-muted block">
                  Código PIX Copia e Cola (BR Code EMV):
                </span>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-2">
                  <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate select-all">
                    {livePixPayload || 'Preencha a chave PIX'}
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleCopyPixPayload}
                    leftIcon={
                      copiedPixPayload ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                    className="text-xs py-1 px-2.5 shrink-0"
                  >
                    {copiedPixPayload ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO 3: CARTÃO DE CRÉDITO NO CELULAR & MAQUININHA (TAP ON PHONE) */}
      {/* ========================================================================= */}
      {activeSection === 'maquininha' && (
        <Card className="p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cobrança por Cartão de Crédito e Débito no Celular
                </h3>
                <span className="text-xs text-slate-400">
                  Configure o aplicativo de celular (ex: PagBank Tap, InfiniteTap, Ton) e as bandeiras aceitas
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={posForm.enabled}
                onChange={(e) => setPosForm({ ...posForm, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          <form onSubmit={handleSavePos} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Solução de Cobrança no Celular / Maquininha
                </label>
                <Select
                  value={posForm.provider}
                  onChange={(e) => {
                    const prov = e.target.value as any;
                    const names: Record<string, string> = {
                      pagbank_celular: 'PagBank no Celular (PagVendas Tap)',
                      infinitetap: 'InfinitePay no Celular (InfiniteTap)',
                      mercadopago_tap: 'Mercado Pago Point Tap no Celular',
                      ton_tap: 'Ton Tap no Celular (Stone)',
                      maquininha_fisica: 'Maquininha Física Tradicional',
                    };
                    setPosForm({
                      ...posForm,
                      provider: prov,
                      providerName: names[prov] || 'Maquininha Presencial',
                    });
                  }}
                  className="text-xs"
                >
                  <option value="pagbank_celular">PagBank no Celular (Tap on Phone)</option>
                  <option value="infinitetap">InfinitePay no Celular (InfiniteTap)</option>
                  <option value="mercadopago_tap">Mercado Pago Point Tap no Celular</option>
                  <option value="ton_tap">Ton Tap no Celular (Stone)</option>
                  <option value="maquininha_fisica">Maquininha Física Tradicional</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parcelamento Presencial Permitido
                </label>
                <Select
                  value={posForm.maxInstallments}
                  onChange={(e) =>
                    setPosForm({ ...posForm, maxInstallments: parseInt(e.target.value, 10) })
                  }
                  className="text-xs"
                >
                  <option value={1}>À vista (1x)</option>
                  <option value={3}>Até 3x no cartão</option>
                  <option value={6}>Até 6x no cartão</option>
                  <option value={10}>Até 10x no cartão</option>
                  <option value={12}>Até 12x no cartão</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Repasse de Taxas da Máquina
                </label>
                <Select
                  value={posForm.passFeeToStudent ? 'pass' : 'absorb'}
                  onChange={(e) =>
                    setPosForm({
                      ...posForm,
                      passFeeToStudent: e.target.value === 'pass',
                    })
                  }
                  className="text-xs"
                >
                  <option value="absorb">Absorver taxas (sem custo extra para o aluno)</option>
                  <option value="pass">Repassar juros de parcelamento ao aluno</option>
                </Select>
              </div>
            </div>

            {/* Seletor de Bandeiras Aceitas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Bandeiras Aceitas nas Maquininhas que Funcionam no Celular
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {POPULAR_BRANDS.map((brand) => {
                  const isAccepted = posForm.acceptedBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => handleToggleBrand(brand)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isAccepted
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-500'
                      }`}
                    >
                      <span>{brand}</span>
                      {isAccepted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/[0.2]" />
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1.5">
                Clique nas bandeiras para habilitar ou desabilitar a aceitação em treinos presenciais.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instruções de Cobrança Presencial
              </label>
              <Input
                type="text"
                value={posForm.instructions || ''}
                onChange={(e) => setPosForm({ ...posForm, instructions: e.target.value })}
                placeholder="Cobrança presencial por aproximação ou chip no início do treino"
                className="text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingPos}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Salvar Configurações de Cartão e Celular
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO 4: BOLETO BANCÁRIO */}
      {/* ========================================================================= */}
      {activeSection === 'boleto' && (
        <Card className="p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Configurações de Cobrança por Boleto Bancário
                </h3>
                <span className="text-xs text-slate-400">
                  Emissão de boletos registrados através de gateways autorizados
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={boletoForm.enabled}
                onChange={(e) => setBoletoForm({ ...boletoForm, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          <form onSubmit={handleSaveBoleto} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Provedor / Emissor de Boletos
                </label>
                <Input
                  type="text"
                  value={boletoForm.provider}
                  onChange={(e) => setBoletoForm({ ...boletoForm, provider: e.target.value })}
                  placeholder="PagBank / Asaas / Mercado Pago / Inter"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prazo de Vencimento Padrão
                </label>
                <Select
                  value={boletoForm.daysUntilDue}
                  onChange={(e) =>
                    setBoletoForm({
                      ...boletoForm,
                      daysUntilDue: parseInt(e.target.value, 10),
                    })
                  }
                  className="text-xs"
                >
                  <option value={1}>1 dia útil</option>
                  <option value={2}>2 dias úteis</option>
                  <option value={3}>3 dias úteis (Recomendado)</option>
                  <option value={5}>5 dias úteis</option>
                  <option value={7}>7 dias corridos</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Multa após Vencimento (%)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  value={boletoForm.lateFinePercentage || 2}
                  onChange={(e) =>
                    setBoletoForm({
                      ...boletoForm,
                      lateFinePercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Instruções Impressas no Boleto
              </label>
              <Input
                type="text"
                value={boletoForm.instructions || ''}
                onChange={(e) => setBoletoForm({ ...boletoForm, instructions: e.target.value })}
                placeholder="A compensação bancária pode levar de 24 a 72 horas úteis."
                className="text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSavingBoleto}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Salvar Configurações de Boleto
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Modal para Adicionar / Editar Link Externo */}
      <ExternalLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setLinkToEdit(null);
        }}
        linkToEdit={linkToEdit}
        plans={plans}
        onSave={handleSaveExternalLink}
      />
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Tag,
  DollarSign,
  FileText,
  Share2,
  ShieldCheck,
  TrendingDown,
  Layers,
  ArrowRight,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { studentRepository } from '../../repositories/studentRepository';
import { couponRepository } from '../../repositories/couponRepository';
import { Student, StudentPaymentRecord, DiscountCoupon } from '../../types';
import { PaymentReceiptModal } from '../../components/students/PaymentReceiptModal';
import { AdvancePaymentModal } from '../../components/students/AdvancePaymentModal';
import { useToast } from '../../context/ToastContext';

export const StudentFinancialPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [receiptPayment, setReceiptPayment] = useState<StudentPaymentRecord | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  // Cupom validation simulation test
  const [testCouponCode, setTestCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponDetails, setCouponDetails] = useState<DiscountCoupon | null>(null);

  const loadStudent = async () => {
    if (!studentProfile) return;
    try {
      setLoading(true);
      const targetId = studentProfile.userId || studentProfile.id;
      let data = await studentRepository.getById(targetId);
      if (!data && studentProfile.id) {
        data = await studentRepository.getById(studentProfile.id);
      }
      setStudent(data);

      if (data?.financialPlan?.discountCouponCode) {
        const found = await couponRepository.getCouponByCode(data.financialPlan.discountCouponCode);
        setCouponDetails(found);
      }
    } catch (err) {
      console.error(err);
      toastError('Erro ao carregar informações financeiras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [studentProfile]);

  const financialPlan = student?.financialPlan;
  const payments = financialPlan?.payments || [];

  const paidPayments = useMemo(
    () => payments.filter((p) => p.status === 'pago'),
    [payments]
  );

  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status !== 'pago'),
    [payments]
  );

  const totalPaid = useMemo(
    () => paidPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0),
    [paidPayments]
  );

  const totalRemaining = useMemo(
    () => pendingPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0),
    [pendingPayments]
  );

  const nextDuePayment = useMemo(() => {
    if (pendingPayments.length === 0) return null;
    return [...pendingPayments].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0];
  }, [pendingPayments]);

  const discountSaved = useMemo(() => {
    if (!financialPlan?.originalPrice || !financialPlan?.price) return 0;
    return Math.max(0, financialPlan.originalPrice - financialPlan.price);
  }, [financialPlan]);

  const isExpired = financialPlan?.expiresAt
    ? new Date(financialPlan.expiresAt) < new Date()
    : false;

  const handleTestCoupon = async () => {
    const clean = testCouponCode.trim().toUpperCase();
    if (!clean) {
      toastError('Digite o código de um cupom para testar.');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const planPrice = financialPlan?.price || 280;
      const res = await couponRepository.validateCoupon({
        code: clean,
        planPrice,
        studentId: student?.id,
        hasOtherDiscount: !!(financialPlan?.discountType && financialPlan.discountType !== 'none'),
      });

      if (res.isValid) {
        success(`${res.message} Entre em contato com a Rafaela para aplicar em sua próxima renovação!`);
      } else {
        toastError(res.message);
      }
    } catch {
      toastError('Erro ao validar cupom.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleContactWhatsApp = () => {
    const text = `Olá Rafaela! Gostaria de tirar uma dúvida sobre meu plano financeiro (${financialPlan?.planName || 'Consultoria'}).`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-slate-400">Carregando painel financeiro...</span>
      </div>
    );
  }

  if (!financialPlan) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <Card className="p-12 text-center border-dashed border-2 border-slate-200 dark:border-white/[0.08]">
          <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Nenhum plano financeiro vinculado
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Você ainda não possui um plano de consultoria ativo. Entre em contato com a Rafaela para ativar seu plano personalizado.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={handleContactWhatsApp}
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Falar com a Rafaela no WhatsApp
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header com Resumo do Plano */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                Meu Plano de Treino
              </span>
              <Badge variant={isExpired ? 'danger' : 'success'} size="sm">
                {isExpired ? 'Plano Vencido / Expirado' : 'Assinatura Ativa'}
              </Badge>
              <Badge variant="neutral" size="sm">
                {financialPlan.frequency.toUpperCase()}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {financialPlan.planName}
            </h1>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-dark-muted mt-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                Início:{' '}
                {financialPlan.startDate
                  ? financialPlan.startDate.split('-').reverse().join('/')
                  : 'N/A'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Vigência até:{' '}
                {financialPlan.expiresAt
                  ? financialPlan.expiresAt.split('-').reverse().join('/')
                  : 'N/A'}
              </span>
              <span>•</span>
              <span>Vencimento todo dia {financialPlan.billingDay}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleContactWhatsApp}
              leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-500" />}
              className="text-xs"
            >
              Falar com Rafaela
            </Button>

            {pendingPayments.length > 0 && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsAdvanceModalOpen(true)}
                leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                className="text-xs shadow-xs"
              >
                Adiantar Parcelas
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Já Pago */}
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
              Total Já Pago
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            R$ {totalPaid.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {paidPayments.length} de {payments.length} parcelas quitadas
          </span>
        </Card>

        {/* Total Restante a Pagar */}
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
              Saldo Restante
            </span>
            <DollarSign className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            R$ {totalRemaining.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {pendingPayments.length} parcelas pendentes
          </span>
        </Card>

        {/* Próximo Vencimento */}
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
              Próxima Parcela
            </span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">
            {nextDuePayment?.dueDate
              ? nextDuePayment.dueDate.split('-').reverse().join('/')
              : 'Tudo quitado!'}
          </p>
          <span className="text-[11px] text-emerald-500 font-medium block mt-0.5">
            {nextDuePayment ? `R$ ${nextDuePayment.amount.toFixed(2)}` : 'Nenhuma parcela pendente'}
          </span>
        </Card>

        {/* Economia com Cupom */}
        <Card className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
              Desconto Aplicado
            </span>
            <Tag className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-violet-600 dark:text-violet-400 mt-1">
            R$ {discountSaved.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {financialPlan.discountCouponCode
              ? `Cupom: ${financialPlan.discountCouponCode}`
              : 'Economia total no plano'}
          </span>
        </Card>
      </div>

      {/* Seção Cupom de Desconto Aplicado */}
      <Card className="p-5 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cupom de Desconto & Vantagens
              </h3>
              {financialPlan.discountCouponCode ? (
                <div className="space-y-1 mt-0.5">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Você possui o cupom{' '}
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                      {financialPlan.discountCouponCode}
                    </strong>{' '}
                    aplicado ao seu plano de consultoria.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                    <span>
                      Economia gerada:{' '}
                      <strong className="text-emerald-500">R$ {discountSaved.toFixed(2)}</strong>
                    </span>
                    {couponDetails && (
                      <>
                        <span>•</span>
                        <span>{couponDetails.singleUsePerStudent ? 'Uso Único por Aluno' : 'Reutilizável'}</span>
                        <span>•</span>
                        <span>{couponDetails.isCumulative ? 'Acumulativo' : 'Uso Exclusivo (Não Acumulativo)'}</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                  Nenhum cupom aplicado atualmente neste ciclo. Se você recebeu um código promocional, pode testar sua validade abaixo.
                </p>
              )}
            </div>
          </div>

          {/* Testar Cupom se não tiver */}
          {!financialPlan.discountCouponCode && (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Código do cupom..."
                value={testCouponCode}
                onChange={(e) => setTestCouponCode(e.target.value.toUpperCase())}
                className="text-xs font-mono uppercase w-36 sm:w-44 py-1.5"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleTestCoupon}
                isLoading={isValidatingCoupon}
                className="text-xs"
              >
                Validar
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* SEÇÃO 1: PARCELAS PENDENTES / A VENCER */}
      {/* ========================================================================= */}
      <Card className="border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Parcelas Pendentes ({pendingPayments.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Acompanhe as próximas mensalidades programadas para o seu plano.
            </p>
          </div>

          {pendingPayments.length > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsAdvanceModalOpen(true)}
              leftIcon={<DollarSign className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Adiantar Parcelas
            </Button>
          )}
        </div>

        {pendingPayments.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Todas as parcelas estão quitadas!
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Não há mensalidades pendentes para este ciclo contratado.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {pendingPayments.map((p) => {
              const isLate = p.dueDate ? new Date(p.dueDate) < new Date() : false;

              return (
                <div
                  key={p.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.installments} • {p.referenceMonth}
                      </span>
                      {isLate ? (
                        <Badge variant="danger" size="sm">
                          Vencido
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Pendente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Vencimento:{' '}
                        {p.dueDate ? p.dueDate.split('-').reverse().join('/') : 'A definir'}
                      </span>
                      <span>•</span>
                      <span className="uppercase">{p.paymentMethod}</span>
                      {p.notes && (
                        <>
                          <span>•</span>
                          <span>{p.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                      R$ {p.amount.toFixed(2)}
                    </span>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAdvanceModalOpen(true)}
                      className="text-xs py-1"
                    >
                      Pagar / Adiantar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* SEÇÃO 2: HISTÓRICO DE PAGAMENTOS / O QUE JÁ FOI PAGO */}
      {/* ========================================================================= */}
      <Card className="border border-slate-200/80 dark:border-white/[0.08] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Histórico de Pagamentos Quitado ({paidPayments.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize os comprovantes digitais e recibos de todas as parcelas já pagas.
          </p>
        </div>

        {paidPayments.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhum pagamento registrado ainda
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Os pagamentos confirmados aparecerão aqui com recibo digital disponível.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {paidPayments.map((p) => {
              return (
                <div
                  key={p.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.installments} • {p.referenceMonth}
                      </span>
                      <Badge variant="success" size="sm">
                        Pago
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Pago em:{' '}
                        {p.paidDate
                          ? p.paidDate.split('-').reverse().join('/')
                          : 'Data não informada'}
                      </span>
                      <span>•</span>
                      <span className="uppercase">{p.paymentMethod}</span>
                      {p.notes && (
                        <>
                          <span>•</span>
                          <span>{p.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      R$ {p.amount.toFixed(2)}
                    </span>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setReceiptPayment(p)}
                      leftIcon={<FileText className="w-3.5 h-3.5 text-emerald-500" />}
                      className="text-xs py-1"
                    >
                      Comprovante
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal de Comprovante de Pagamento */}
      {student && (
        <PaymentReceiptModal
          isOpen={!!receiptPayment}
          onClose={() => setReceiptPayment(null)}
          payment={receiptPayment}
          student={student}
        />
      )}

      {/* Modal de Solicitação de Adiantamento */}
      {student && (
        <AdvancePaymentModal
          isOpen={isAdvanceModalOpen}
          onClose={() => setIsAdvanceModalOpen(false)}
          student={student}
          onPaymentUpdated={(updated) => {
            setStudent(updated);
            loadStudent();
          }}
        />
      )}
    </div>
  );
};

import React from 'react';
import { DiscountCoupon, Student } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';
import { Users, Tag, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CouponStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: DiscountCoupon | null;
  students: Student[];
}

export const CouponStudentsModal: React.FC<CouponStudentsModalProps> = ({
  isOpen,
  onClose,
  coupon,
  students,
}) => {
  const navigate = useNavigate();
  if (!coupon) return null;

  // Real students who have this coupon code applied in their financialPlan
  const matchingStudents = students.filter((s) => {
    const code = s.financialPlan?.discountCouponCode?.trim().toUpperCase();
    return code === coupon.code.trim().toUpperCase();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Alunos com o Cupom "${coupon.code}"`}
      description={`Listagem real do banco de dados de alunos com desconto ativo deste cupom`}
      size="md"
    >
      <div className="space-y-4">
        {/* Header Resumo */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-extrabold text-sm">
              {coupon.code}
            </span>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}% OFF`
                  : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
              </span>
              <span className="text-[11px] text-slate-400 block font-normal">
                {coupon.singleUsePerStudent ? 'Uso Único por Aluno' : 'Reutilizável'} •{' '}
                {coupon.isCumulative ? 'Acumulativo' : 'Não Acumulativo'}
              </span>
            </div>
          </div>

          <Badge variant={matchingStudents.length > 0 ? 'success' : 'neutral'} size="sm">
            {matchingStudents.length} {matchingStudents.length === 1 ? 'aluno real' : 'alunos reais'}
          </Badge>
        </div>

        {matchingStudents.length === 0 ? (
          <div className="p-8 text-center border-dashed border-2 border-slate-200 dark:border-white/[0.08] rounded-2xl">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nenhum aluno utilizando este cupom no momento
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Este cupom ainda não foi vinculado ao plano financeiro de nenhum aluno no banco de dados.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {matchingStudents.map((st) => {
              const orig = st.financialPlan?.originalPrice || 0;
              const current = st.financialPlan?.price || 0;
              const discountGiven = Math.max(0, orig - current);

              return (
                <div
                  key={st.id}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        st.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                      }
                      alt={st.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/[0.1] shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {st.name}
                      </h5>
                      <span className="text-[11px] text-slate-400 truncate block">
                        Plano: {st.financialPlan?.planName || 'Consultoria'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono block">
                        R$ {current.toFixed(2)}
                      </span>
                      {discountGiven > 0 && (
                        <span className="text-[10px] text-slate-400 line-through block font-mono">
                          R$ {orig.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onClose();
                        const targetId = st.userId || st.id;
                        navigate(`/personal/students/${targetId}?tab=resumo`);
                      }}
                      className="text-xs px-2 py-1"
                      rightIcon={<ArrowRight className="w-3 h-3" />}
                    >
                      Ver Perfil
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Check, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface PlanItem {
  id: string;
  name: string;
  category: 'treino' | 'combo';
  price: number;
  period: string;
  popular?: boolean;
  tag?: string;
  description: string;
  features: string[];
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanItem | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, plan }) => {
  const { success } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('Hipertrofia');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      success('Pré-matrícula iniciada com sucesso! Redirecionando para o WhatsApp da Rafaela...');

      // Open WhatsApp with prefilled message
      const message = encodeURIComponent(
        `Olá Rafaela! Gostaria de iniciar no plano *${plan.name}* (R$ ${plan.price}${plan.period}).\n\n*Meus Dados:*\n- Nome: ${name}\n- E-mail: ${email}\n- WhatsApp: ${phone}\n- Objetivo Principal: ${goal}`
      );
      window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inicie sua Transformação"
      description="Preencha seus dados para receber a anamnese inicial e orientações de acesso"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selected Plan Summary Card */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Plano Selecionado
              </span>
              {plan.tag && (
                <Badge variant="brand" size="sm">
                  {plan.tag}
                </Badge>
              )}
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {plan.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-dark-muted">
              {plan.description}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Investimento</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              R$ {plan.price}
            </span>
            <span className="text-[11px] text-slate-500">{plan.period}</span>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nome Completo *
            </label>
            <Input
              required
              placeholder="Ex: Mariana Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-mail para Acesso *
              </label>
              <Input
                required
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp com DDD *
              </label>
              <Input
                required
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Seu Objetivo Principal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="Hipertrofia">Hipertrofia Muscular e Definição</option>
              <option value="Emagrecimento">Emagrecimento e Queima de Gordura</option>
              <option value="Condicionamento">Condicionamento Físico e Disposição</option>
              <option value="Forca">Ganho de Força e Performance</option>
              <option value="Saude">Saúde, Postura e Alívio de Dores</option>
            </select>
          </div>
        </div>

        {/* Security & Guarantee Note */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-100 dark:border-dark-border/40 flex items-center gap-2.5 text-xs text-slate-500 dark:text-dark-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Garantia incondicional de 7 dias. Atendimento direto e personalizado com a Rafaela.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<MessageCircle className="w-4 h-4" />}
          >
            Garantir Vaga no WhatsApp
          </Button>
        </div>
      </form>
    </Modal>
  );
};

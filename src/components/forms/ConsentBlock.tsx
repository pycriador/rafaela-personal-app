import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface ConsentBlockProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  statement?: string;
  termsVersion?: string;
  disabled?: boolean;
  requiredError?: boolean;
}

export const ConsentBlock: React.FC<ConsentBlockProps> = ({
  accepted,
  onChange,
  statement = 'Declaro que as informações fornecidas nesta anamnese são verdadeiras e completas, autorizando o seu armazenamento seguro para fins exclusivos de prescrição e acompanhamento físico na plataforma Rafaela Personal App.',
  termsVersion = '1.0',
  disabled = false,
  requiredError = false,
}) => {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        requiredError && !accepted
          ? 'border-rose-500 bg-rose-500/10'
          : accepted
          ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20'
          : 'border-slate-200 dark:border-dark-border bg-slate-50/60 dark:bg-dark-cardElevated/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Termo de Ciência & Consentimento Informado
            </h4>
            <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
              Versão {termsVersion}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
            &ldquo;{statement}&rdquo;
          </p>

          <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 dark:bg-dark-card cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Li, declaro que as informações são verdadeiras e autorizo o registro para acompanhamento.
            </span>
          </label>

          {requiredError && !accepted && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold pt-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Para enviar este formulário, confirme o aceite.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

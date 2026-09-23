import React, { useState, useEffect } from 'react';
import { aiConsentRepository } from '../../repositories/aiConsentRepository';
import { useToast } from '../../context/ToastContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Sparkles, ShieldCheck, Lock } from 'lucide-react';

interface AIConsentToggleProps {
  studentId: string;
  studentName: string;
}

export const AIConsentToggle: React.FC<AIConsentToggleProps> = ({ studentId, studentName }) => {
  const { success, error: toastError } = useToast();
  const [allowed, setAllowed] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const consent = await aiConsentRepository.getByStudentId(studentId);
        if (consent) {
          setAllowed(consent.allowed);
          setUpdatedAt(consent.updatedAt);
        } else {
          setAllowed(true);
        }
      } catch (err) {
        console.error('Erro ao carregar consentimento de IA:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  const handleToggle = async () => {
    try {
      const nextState = !allowed;
      const updated = await aiConsentRepository.setConsent(studentId, nextState, 'user-rafaela');
      setAllowed(updated.allowed);
      setUpdatedAt(updated.updatedAt);
      if (nextState) {
        success(`Uso de IA autorizado para os dados de ${studentName}.`);
      } else {
        success(`Uso de IA restrito para os dados de ${studentName}.`);
      }
    } catch {
      toastError('Não foi possível alterar o consentimento de IA.');
    }
  };

  if (loading) return null;

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200/60 dark:border-dark-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Uso de Inteligência Artificial (AI Copilot)
          </h4>
          <Badge variant={allowed ? 'success' : 'neutral'} size="sm">
            {allowed ? 'Autorizado' : 'Restrito'}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 dark:text-dark-muted max-w-xl">
          Permite a utilização estritamente minimizada dos dados de treino e saúde do aluno pelo assistente de planejamento da Personal Rafaela.
        </p>
        {updatedAt && (
          <span className="text-[10px] text-slate-400 font-mono block">
            Última alteração: {new Date(updatedAt).toLocaleDateString('pt-BR')} por Rafaela
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
          allowed ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
        }`}
        role="switch"
        aria-checked={allowed}
        title="Alternar autorização de IA"
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            allowed ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

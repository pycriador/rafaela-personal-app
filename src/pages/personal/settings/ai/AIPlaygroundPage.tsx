import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { useToast } from '../../../../context/ToastContext';
import {
  Play,
  Sparkles,
  RefreshCw,
  Code2,
  Clock,
  Zap,
  Terminal,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { aiConfigRepository } from '../../../../repositories/aiConfigRepository';
import { AIWorkoutService } from '../../../../services/ai/AIWorkoutService';
import { studentRepository } from '../../../../repositories/studentRepository';
import { Student, AIModelInfo, AIConfig } from '../../../../types';

export const AIPlaygroundPage: React.FC = () => {
  const { success, error, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Selected parameters for test
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customGoal, setCustomGoal] = useState('Hipertrofia Glúteos & Membros Inferiores');
  const [targetDuration, setTargetDuration] = useState(50);
  const [trainerInstructions, setTrainerInstructions] = useState('Aluna com condromalácia grau 1 no joelho esquerdo. Priorizar exercícios em cadeia cinética fechada e evitar impacto repetitivo.');
  const [copied, setCopied] = useState(false);

  // Response state
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    data?: any;
    error?: string;
    latencyMs?: number;
    modelUsed?: string;
    modeUsed?: string;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [c, m, s] = await Promise.all([
          aiConfigRepository.getConfig(),
          aiConfigRepository.getModels(),
          studentRepository.getAll(),
        ]);
        setConfig(c);
        setModels(m);
        setStudents(s);
        if (s.length > 0) {
          setSelectedStudentId(s[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar playground:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleRunTest = async () => {
    if (!selectedStudentId) {
      error('Selecione um aluno para testar o contexto.');
      return;
    }

    setRunning(true);
    setExecutionResult(null);
    const startTime = performance.now();

    try {
      const proposal = await AIWorkoutService.generateWorkoutProposal({
        studentId: selectedStudentId,
        goal: customGoal,
        trainingDays: ['Segunda', 'Quarta', 'Sexta'],
        targetDurationMinutes: targetDuration,
        equipmentAvailable: ['Halteres', 'Barra', 'Polia', 'Smith'],
        trainerInstructions,
        selection: {
          includeStudentProfile: true,
          includeGoals: true,
          includeFrequency: true,
          includeHistory: true,
          includeAnamnesis: true,
          includeNutrition: true,
          includeFeedback: true,
          includeTrainerInstructions: true,
        },
      });

      const latencyMs = Math.round(performance.now() - startTime);

      setExecutionResult({
        success: true,
        data: proposal,
        latencyMs,
        modelUsed: proposal.model,
        modeUsed: config?.mode || 'mock',
      });
      success(`Proposta gerada com sucesso em ${latencyMs}ms!`);
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      setExecutionResult({
        success: false,
        error: err.message || 'Erro durante a inferência.',
        latencyMs,
      });
      error('Falha na geração do teste.');
    } finally {
      setRunning(false);
    }
  };

  const handleCopyJson = () => {
    if (!executionResult?.data) return;
    navigator.clipboard.writeText(JSON.stringify(executionResult.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    info('JSON copiado para a área de transferência.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Carregando ambiente de testes (Playground)...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-500" />
            AI Prompt & Model Playground
          </h2>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
            Simule requisições com dados reais de alunos, inspecione a estrutura JSON retornada e avalie a latência.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={config?.mode === 'gemini' ? 'success' : 'brand'} size="md">
            Modo: {config?.mode === 'gemini' ? 'Google Gemini AI (Nuvem)' : 'Motor de Regras (Local)'}
          </Badge>
          <Badge variant="neutral" size="md">
            Modelo: {config?.selectedModel}
          </Badge>
        </div>
      </div>

      {/* Grid: Configuração à Esquerda, Resposta à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Parâmetros (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 space-y-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Parâmetros de Entrada
            </CardTitle>

            {/* Selecionar Aluno */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Aluno para Contexto:
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 outline-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.goals?.join(', ') || 'Geral'})
                  </option>
                ))}
              </select>
            </div>

            {/* Objetivo */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Objetivo do Treino:
              </label>
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Duração Alvo */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Duração Alvo da Sessão (minutos):
              </label>
              <input
                type="number"
                min="30"
                max="90"
                value={targetDuration}
                onChange={(e) => setTargetDuration(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            {/* Diretrizes da Personal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Orientações Específicas da Rafaela:
              </label>
              <textarea
                rows={4}
                value={trainerInstructions}
                onChange={(e) => setTrainerInstructions(e.target.value)}
                placeholder="Ex: Ênfase em glúteo médio, evitar impacto nos joelhos..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 outline-none leading-relaxed"
              />
            </div>

            {/* Botão Executar */}
            <Button
              variant="primary"
              size="md"
              onClick={handleRunTest}
              isLoading={running}
              leftIcon={<Play className="w-4 h-4 fill-white" />}
              className="w-full"
            >
              Executar Inferência de Teste
            </Button>
          </Card>
        </div>

        {/* Painel de Resposta / Inspeção JSON (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-5 flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-500" />
                Retorno Estruturado & Validação
              </CardTitle>

              {executionResult?.data && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> {executionResult.latencyMs}ms
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyJson}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    {copied ? 'Copiado' : 'Copiar JSON'}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl p-4 overflow-auto max-h-[550px] border border-slate-800 leading-relaxed">
              {running ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2 py-16">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                  <span>Enviando contexto minimizado para inferência de IA...</span>
                </div>
              ) : executionResult ? (
                executionResult.success ? (
                  <pre className="whitespace-pre-wrap">{JSON.stringify(executionResult.data, null, 2)}</pre>
                ) : (
                  <div className="text-rose-400 p-4 space-y-2">
                    <div className="font-bold text-sm">❌ Erro na execução:</div>
                    <div className="font-mono text-xs">{executionResult.error}</div>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 dark:text-slate-500 gap-2 py-20 text-center">
                  <Terminal className="w-10 h-10 opacity-40 text-slate-400" />
                  <p className="text-xs">Clique em &ldquo;Executar Inferência de Teste&rdquo; para visualizar a resposta estruturada.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

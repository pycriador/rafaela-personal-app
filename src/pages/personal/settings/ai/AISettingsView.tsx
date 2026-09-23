import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { useToast } from '../../../../context/ToastContext';
import {
  Sparkles,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Sliders,
  FileCode,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { aiConfigRepository } from '../../../../repositories/aiConfigRepository';
import { secretStore } from '../../../../services/ai/secretStore';
import { GeminiAIProvider } from '../../../../services/ai/GeminiAIProvider';
import { AIPromptService } from '../../../../services/ai/AIPromptService';
import { AIConfig, AIModelInfo, AIMode } from '../../../../types';

export const AISettingsView: React.FC = () => {
  const { success, error, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingModels, setSyncingModels] = useState(false);

  // Config State
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [models, setModels] = useState<AIModelInfo[]>([]);

  // Key State
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [revealRawInput, setRevealRawInput] = useState(false);

  // Connection Test Status
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storedConfig, storedModels, isConfig, masked] = await Promise.all([
        aiConfigRepository.getConfig(),
        aiConfigRepository.getModels(),
        secretStore.isConfigured(),
        secretStore.getMaskedKey(),
      ]);

      setConfig(storedConfig);
      setModels(storedModels);
      setIsKeyConfigured(isConfig);
      setMaskedKey(masked);
    } catch (err) {
      console.error('Erro ao carregar configurações de IA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveKey = async () => {
    if (!newKeyInput.trim()) {
      error('Por favor, informe uma chave de API válida.');
      return;
    }

    try {
      const result = await secretStore.saveApiKey(newKeyInput);
      setMaskedKey(result.maskedKey);
      setIsKeyConfigured(true);
      setNewKeyInput('');
      setShowKeyInput(false);
      setTestResult(null);
      success('Chave de API do Gemini criptografada e armazenada com sucesso no vault local.');
    } catch (err: any) {
      error(err.message || 'Erro ao salvar chave.');
    }
  };

  const handleRemoveKey = async () => {
    if (window.confirm('Deseja remover a chave da API do Google Gemini?')) {
      await secretStore.removeApiKey();
      setMaskedKey(null);
      setIsKeyConfigured(false);
      setTestResult(null);
      info('Chave de API removida.');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const provider = new GeminiAIProvider();
      const result = await provider.testConnection();
      setTestResult(result);
      if (result.success) {
        success(result.message);
      } else {
        error(result.message);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Erro no teste de conexão.' });
      error('Falha no teste de conexão.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncModels = async () => {
    setSyncingModels(true);
    try {
      const provider = new GeminiAIProvider();
      const liveModels = await provider.listModels();
      if (liveModels.length > 0) {
        await aiConfigRepository.saveModels(liveModels);
        setModels(liveModels);
        success(`${liveModels.length} modelos Gemini sincronizados com sucesso.`);
      }
    } catch {
      error('Erro ao sincronizar modelos remotos.');
    } finally {
      setSyncingModels(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await aiConfigRepository.updateConfig(config);
      success('Configurações de Inteligência Artificial salvas com sucesso!');
    } catch {
      error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSystemPrompt = () => {
    if (!config) return;
    const defaultPrompt = AIPromptService.getSystemInstruction();
    setConfig({
      ...config,
      systemPrompt: defaultPrompt,
    });
    info('Prompt de sistema restaurado para a versão padrão da Rafaela.');
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Carregando configurações de IA...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de Segurança e Governança */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-bold">Diretriz Fundamental: IA como Assistente da Rafaela</p>
          <p className="text-slate-600 dark:text-emerald-300/80 leading-relaxed">
            A Inteligência Artificial atua exclusivamente como copiloto e gerador de propostas. Treinos e alterações
            nunca são aplicados de forma autônoma: toda proposta requer validação estruturada e aprovação prévia da Personal.
            As chaves de API utilizam criptografia e mascaramento com proteção Zero-Exposure.
          </p>
        </div>
      </div>

      {/* Modo de Execução & Provedor */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-dark-border">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Modo de Operação
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
              Escolha entre a API Oficial Google Gemini ou o Motor de Regras Biomecânico Local (sem consumo de tokens).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfig({ ...config, mode: 'mock' })}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                config.mode === 'mock'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Motor de Regras Local (Offline)
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, mode: 'gemini' })}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                config.mode === 'gemini'
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Google Gemini AI (Produção)
            </button>
          </div>
        </div>

        {/* Gerenciamento de Chave com Zero-Exposure */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" />
              Chave de API do Google Gemini
            </label>
            <span className="text-xs text-slate-500">
              {isKeyConfigured ? (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Configurada no Vault
                </span>
              ) : (
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Não configurada
                </span>
              )}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-dark-muted">Status do Armazenamento</div>
              <div className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                {maskedKey ? maskedKey : 'Nenhuma chave salva'}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-xs"
              >
                {showKeyInput ? 'Cancelar' : isKeyConfigured ? 'Atualizar Chave' : 'Inserir Chave'}
              </Button>

              {isKeyConfigured && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleTestConnection}
                    isLoading={testingConnection}
                    leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />}
                    className="text-xs"
                  >
                    Testar Conexão
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemoveKey}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Remover
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Form para inserção segura da chave */}
          {showKeyInput && (
            <div className="p-4 rounded-xl bg-white dark:bg-dark-card border border-emerald-500/30 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Digite a Chave de API do Google AI Studio:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={revealRawInput ? 'text' : 'password'}
                    value={newKeyInput}
                    onChange={(e) => setNewKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealRawInput(!revealRawInput)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {revealRawInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <Button variant="primary" size="sm" onClick={handleSaveKey} className="text-xs">
                  Criptografar & Salvar
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                A chave é criptografada e nunca exposta em tela após salva. Você pode obtê-la gratuitamente em{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-500 underline"
                >
                  Google AI Studio
                </a>.
              </p>
            </div>
          )}

          {/* Resultado do Teste de Conexão */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Seleção de Modelo & Parâmetros */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-dark-border">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-500" />
              Modelo & Parâmetros de Inferência
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
              Configure o modelo ativo e os hiperparâmetros de criatividade e limite de tokens para prescrição de treinos.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncModels}
            isLoading={syncingModels}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${syncingModels ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Sincronizar Modelos
          </Button>
        </div>

        {/* Lista de Modelos */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Modelo Ativo para Prescrições:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {models.map((m) => {
              const isSelected = config.selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setConfig({ ...config, selectedModel: m.id })}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{m.name}</span>
                    {m.id === 'gemini-2.0-flash' && (
                      <Badge variant="brand" size="sm">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-muted line-clamp-2 mb-3">
                    {m.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Janela: {m.contextWindow}</span>
                    {m.supportsThinking && <span className="text-emerald-500 font-semibold">• Thinking</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders de Parâmetros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Temperatura */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Temperatura:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{config.temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Valores baixos (0.2 - 0.4) garantem fidelidade estrita às regras e à biblioteca de exercícios.
            </p>
          </div>

          {/* Limite de Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Max Tokens de Saída:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{config.maxOutputTokens}</span>
            </div>
            <input
              type="range"
              min="1024"
              max="8192"
              step="512"
              value={config.maxOutputTokens}
              onChange={(e) => setConfig({ ...config, maxOutputTokens: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Espaço suficiente para fichas estruturadas completas de segunda a sábado.
            </p>
          </div>

          {/* Nível de Detalhe */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nível de Justificativa:
            </label>
            <select
              value={config.detailLevel || 'balanced'}
              onChange={(e) => setConfig({ ...config, detailLevel: e.target.value as any })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="concise">Conciso (Apenas dados essenciais e alertas)</option>
              <option value="balanced">Equilibrado (Recomendado - Notas clínicas objetivas)</option>
              <option value="detailed">Detalhado (Justificativas biomecânicas completas)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Define a profundidade das observações incluídas para a Rafaela na proposta.
            </p>
          </div>
        </div>
      </Card>

      {/* Prompt Central do Sistema */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-dark-border">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-500" />
              Prompt Mestre de Instrução do Sistema
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
              Instruções globais e diretrizes biomecânicas da metodologia Rafaela aplicadas em todas as chamadas.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetSystemPrompt}
            className="text-xs"
          >
            Restaurar Instrução Padrão
          </Button>
        </div>

        <div className="space-y-2">
          <textarea
            rows={10}
            value={config.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
          />
          <p className="text-[11px] text-slate-400">
            Dica: Presets de instruções específicas (ex: Foco em Glúteos, Deload, Retorno de Lesão) podem ser selecionados diretamente no modal do Copilot ao prescrever para o aluno.
          </p>
        </div>
      </Card>

      {/* Botão de Ação Salvar */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={handleSaveConfig}
          isLoading={saving}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          Salvar Todas as Configurações de IA
        </Button>
      </div>
    </div>
  );
};

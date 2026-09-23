import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  TrendingUp,
  RotateCcw,
  HelpCircle,
  Award,
  Sparkles,
  CheckCheck,
  Dumbbell,
  Trash2,
  ChevronDown,
  RotateCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Student, StudentMessage, MessageCategory } from '../../types';
import { messageRepository } from '../../repositories/messageRepository';
import { useToast } from '../../context/ToastContext';

interface StudentTrainerChatSectionProps {
  student: Student;
  currentUserId?: string;
  currentUserRole?: 'personal' | 'student';
}

const CATEGORY_CONFIG: Record<
  MessageCategory,
  { label: string; icon: any; badgeClass: string; bgBubble: string }
> = {
  general: {
    label: 'Geral',
    icon: MessageSquare,
    badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
    bgBubble: 'bg-slate-100 dark:bg-dark-cardElevated',
  },
  weight_change: {
    label: 'Aumento de Carga',
    icon: TrendingUp,
    badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold',
    bgBubble: 'bg-emerald-500/10 border border-emerald-500/30',
  },
  exercise_change: {
    label: 'Troca de Exercício',
    icon: RotateCcw,
    badgeClass: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold',
    bgBubble: 'bg-cyan-500/10 border border-cyan-500/30',
  },
  question: {
    label: 'Dúvida Técnica',
    icon: HelpCircle,
    badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold',
    bgBubble: 'bg-amber-500/10 border border-amber-500/30',
  },
  assessment: {
    label: 'Avaliação da Treinadora',
    icon: Award,
    badgeClass: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold',
    bgBubble: 'bg-purple-500/10 border border-purple-500/30',
  },
  motivation: {
    label: 'Motivação & Feedback',
    icon: Sparkles,
    badgeClass: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold',
    bgBubble: 'bg-rose-500/10 border border-rose-500/30',
  },
};

export const StudentTrainerChatSection: React.FC<StudentTrainerChatSectionProps> = ({
  student,
  currentUserId = 'user-rafaela',
  currentUserRole = 'personal',
}) => {
  const { success, error: toastError } = useToast();
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
  const [activeFilter, setActiveFilter] = useState<'all' | MessageCategory>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const msgs = await messageRepository.getMessagesByStudentId(student.id);
      setMessages(msgs);
      await messageRepository.markAsRead(student.id, currentUserRole);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      if (!isBackground) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // 1. Polling contínuo em background para chat responsivo em tempo real
    const interval = setInterval(() => {
      loadMessages(true);
    }, 2500);

    // 2. Ouvinte de evento cross-tab / cross-window (storage change)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rafaela_app_student_messages_v1') {
        loadMessages(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Ouvinte de evento local disparado ao enviar ou marcar mensagens
    const handleChatMessageEvent = () => {
      loadMessages(true);
    };
    window.addEventListener('rafaela_chat_message', handleChatMessageEvent);
    window.addEventListener('rafaela_chat_read', handleChatMessageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rafaela_chat_message', handleChatMessageEvent);
      window.removeEventListener('rafaela_chat_read', handleChatMessageEvent);
    };
  }, [student.id, currentUserRole]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    try {
      const isPersonal = currentUserRole === 'personal';
      const senderName = isPersonal ? 'Rafaela Personal' : student.name;
      const senderId = isPersonal ? 'user-rafaela' : (student.userId || student.id);

      await messageRepository.sendMessage({
        studentId: student.id,
        senderId,
        senderName,
        senderRole: currentUserRole,
        content: inputContent.trim(),
        category: selectedCategory,
      });

      setInputContent('');
      setSelectedCategory('general');
      await loadMessages();
      success('Mensagem enviada com sucesso!');
    } catch (err) {
      toastError('Erro ao enviar mensagem.');
    }
  };

  const handleSendQuickMessage = (content: string, category: MessageCategory) => {
    setInputContent(content);
    setSelectedCategory(category);
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await messageRepository.deleteMessage(msgId);
      await loadMessages();
      success('Mensagem removida.');
    } catch (err) {
      toastError('Erro ao excluir mensagem.');
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.category === activeFilter;
  });

  const isStudentViewer = currentUserRole === 'student';
  const trainerAvatar = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&auto=format&fit=crop&q=80';

  return (
    <Card className="border-emerald-500/20 shadow-lg overflow-hidden flex flex-col h-[680px]">
      {/* Header with Title and Dropdown Filter */}
      <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-dark-border/60 bg-slate-50/60 dark:bg-dark-cardElevated/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={isStudentViewer ? trainerAvatar : (student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')}
              alt={isStudentViewer ? 'Rafaela Personal' : student.name}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
            />
            <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-dark-card" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-black">
                {isStudentViewer ? 'Bate-Papo com Rafaela Personal' : 'Bate-Papo & Alinhamento Técnico'}
              </CardTitle>
              <Badge variant="success" size="sm">
                {isStudentViewer ? 'Sua Treinadora' : 'Canal Direto'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-dark-muted">
              {isStudentViewer
                ? 'Tire dúvidas dos seus treinos, reporte alterações de carga ou solicite orientações'
                : `Comunicação direta entre Rafaela e ${student.name}`}
            </p>
          </div>
        </div>

        {/* Dropdown Filter & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-bold text-slate-500 dark:text-dark-muted hidden md:inline">
            Filtrar:
          </label>
          <div className="relative">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
              className="text-xs font-bold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-3 py-1.5 pr-7 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs appearance-none"
            >
              <option value="all">Todas as mensagens ({messages.length})</option>
              <option value="question">❓ Dúvidas Técnicas</option>
              <option value="weight_change">📈 Aumento de Carga</option>
              <option value="exercise_change">🔄 Troca de Exercício</option>
              <option value="assessment">🏆 Avaliações da Treinadora</option>
              <option value="motivation">✨ Motivação & Feedback</option>
              <option value="general">💬 Geral</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            title="Atualizar mensagens em tempo real"
            onClick={() => {
              setIsRefreshing(true);
              loadMessages(false);
            }}
            className="p-1.5 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </CardHeader>

      {/* Quick message templates bar with clean dropdown selector */}
      <div className="px-6 py-2.5 bg-slate-50/90 dark:bg-dark-cardElevated/30 border-b border-slate-200/50 dark:border-dark-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Dúvidas Frequentes & Atalhos:
          </span>
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const [cat, text] = val.split(':::');
              handleSendQuickMessage(text, cat as MessageCategory);
              e.target.value = '';
            }}
            className="w-full sm:w-auto text-xs font-bold bg-white dark:bg-dark-card border border-emerald-500/40 rounded-xl px-3 py-1.5 pr-7 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs appearance-none"
          >
            <option value="" disabled>
              ⚡ Escolher modelo de dúvida pronta para preencher...
            </option>
            {isStudentViewer ? (
              <>
                <option value="question:::Oi Rafaela! Estou com uma dúvida sobre a postura e amplitude correta neste exercício.">
                  ❓ Dúvida sobre postura e execução
                </option>
                <option value="weight_change:::Consegui progredir a carga hoje mantendo o controle total do movimento!">
                  💪 Relatar aumento de carga com boa postura
                </option>
                <option value="exercise_change:::O aparelho da ficha estava ocupado na academia e precisei realizar a alternativa recomendada.">
                  🔄 Reportar exercício alternativo realizado
                </option>
                <option value="question:::Senti bastante cansaço e fadiga muscular hoje. Posso ajustar o descanso para 60s ou reduzir uma série?">
                  ⏱️ Cansaço / Solicitar ajuste de descanso
                </option>
                <option value="question:::Senti um leve desconforto na articulação durante o exercício. É normal ou devo pausar?">
                  ⚠️ Relatar desconforto articular
                </option>
              </>
            ) : (
              <>
                <option value="weight_change:::Parabéns pela evolução de carga! Mantivemos cadência e controle perfeito no movimento.">
                  💪 Parabéns pela evolução de carga
                </option>
                <option value="exercise_change:::A substituição que você realizou foi perfeita e manteve o mesmo grupo muscular alvo.">
                  🔄 Substituição de exercício aprovada
                </option>
                <option value="question:::Atenção ao intervalo de descanso entre as séries: preserve os 60 segundos completos para recuperação.">
                  ⏱️ Atenção ao tempo de descanso
                </option>
                <option value="motivation:::Excelente constância e dedicação nos treinos! Continue firme que os resultados já estão visíveis.">
                  ✨ Elogio de constância e foco
                </option>
              </>
            )}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-emerald-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="text-base font-black text-slate-800 dark:text-slate-200">
              {activeFilter === 'all'
                ? 'Nenhuma mensagem ainda'
                : 'Nenhuma mensagem nesta categoria'}
            </p>
            <p className="text-xs text-slate-500 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
              {isStudentViewer
                ? 'Tire dúvidas técnicas diretamente com a Personal Rafaela sobre suas cargas, postura ou trocas de exercícios pelo campo abaixo.'
                : `Inicie a conversa com ${student.name} para esclarecer dúvidas e acompanhar a evolução.`}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe =
              (currentUserRole === 'personal' && msg.senderRole === 'personal') ||
              (currentUserRole === 'student' && msg.senderRole === 'student');

            const categoryInfo = msg.category ? CATEGORY_CONFIG[msg.category] : CATEGORY_CONFIG.general;
            const CategoryIcon = categoryInfo.icon;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="shrink-0 mt-1">
                  {msg.senderRole === 'personal' ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20">
                      RP
                    </div>
                  ) : (
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-300 dark:ring-dark-border"
                    />
                  )}
                </div>

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-1.5 text-[11px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {msg.senderName}
                    </span>
                    {msg.senderRole === 'personal' && (
                      <Badge variant="success" size="sm" className="text-[9px] py-0 px-1">Treinadora</Badge>
                    )}
                    {msg.category && msg.category !== 'general' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${categoryInfo.badgeClass}`}>
                        <CategoryIcon className="w-3 h-3" />
                        {categoryInfo.label}
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed group relative ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10'
                        : `${categoryInfo.bgBubble} text-slate-800 dark:text-slate-200 rounded-tl-none`
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.metadata?.exerciseName && (
                      <div
                        className={`mt-2 p-2 rounded-xl text-[11px] font-mono flex items-center justify-between gap-2 ${
                          isMe ? 'bg-black/20 text-white' : 'bg-white/60 dark:bg-black/30 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1 truncate">
                          <Dumbbell className="w-3.5 h-3.5" />
                          {msg.metadata.exerciseName}
                        </span>
                        {msg.metadata.weightAfter && (
                          <span className="font-bold shrink-0">
                            {msg.metadata.weightBefore ? `${msg.metadata.weightBefore}kg → ` : ''}
                            <strong className="text-emerald-400">
                              {msg.metadata.weightAfter}kg
                            </strong>
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                        isMe ? 'text-emerald-100/70' : 'text-slate-400'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />}
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-rose-400 ml-1 cursor-pointer"
                        title="Excluir mensagem"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with Category Dropdown */}
      <div className="p-4 bg-slate-50 dark:bg-dark-cardElevated/40 border-t border-slate-100 dark:border-dark-border/60 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-dark-muted">Classificar:</span>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MessageCategory)}
                className="text-xs font-bold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-2.5 py-1 pr-6 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
              >
                <option value="general">💬 Geral</option>
                <option value="question">❓ Dúvida Técnica</option>
                <option value="weight_change">📈 Aumento de Carga</option>
                <option value="exercise_change">🔄 Troca de Exercício</option>
                <option value="assessment">🏆 Avaliação da Treinadora</option>
                <option value="motivation">✨ Motivação & Feedback</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {inputContent.length > 0 ? `${inputContent.length} caracteres` : 'Pressione Enter para enviar'}
          </span>
        </div>

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isStudentViewer
                ? 'Digite sua dúvida técnica ou mensagem para a Rafaela... (Enter para enviar)'
                : 'Digite sua orientação ou feedback de treino para o aluno... (Enter para enviar)'
            }
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputContent.trim()}
            className="h-full px-4 rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
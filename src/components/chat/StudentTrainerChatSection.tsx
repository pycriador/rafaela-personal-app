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
  const [inputContent, setInputContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
  const [activeFilter, setActiveFilter] = useState<'all' | MessageCategory>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const msgs = await messageRepository.getMessagesByStudentId(student.id);
      setMessages(msgs);
      await messageRepository.markAsRead(student.id, currentUserRole);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [student.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    try {
      const isPersonal = currentUserRole === 'personal';
      const senderName = isPersonal ? 'Rafaela Personal' : student.name;
      const senderId = isPersonal ? 'user-rafaela' : student.id;

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

  return (
    <Card className="border-emerald-500/20 shadow-lg overflow-hidden flex flex-col h-[650px]">
      <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-dark-border/60 bg-slate-50/60 dark:bg-dark-cardElevated/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={student.name}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/30"
            />
            <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-dark-card" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-black">Bate-Papo & Alinhamento Técnico</CardTitle>
              <Badge variant="success" size="sm">Canal Direto</Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-dark-muted">
              Comunicação entre <strong>Rafaela</strong> e <strong>{student.name}</strong> para ajuste de cargas e exercícios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-dark-card'
            }`}
          >
            Todas ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('weight_change')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'weight_change'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-emerald-500 bg-emerald-500/10'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            Cargas
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('exercise_change')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'exercise_change'
                ? 'bg-cyan-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-cyan-500 bg-cyan-500/10'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            Trocas
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('assessment')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'assessment'
                ? 'bg-purple-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-purple-500 bg-purple-500/10'
            }`}
          >
            <Award className="w-3 h-3" />
            Avaliações
          </button>
        </div>
      </CardHeader>

      <div className="px-6 py-2 bg-slate-100/60 dark:bg-dark-cardElevated/20 border-b border-slate-200/50 dark:border-dark-border/40 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Atalhos rápidos:
        </span>
        <button
          type="button"
          onClick={() =>
            handleSendQuickMessage(
              'Parabéns pela evolução de carga no Supino! Mantivemos cadência e controle perfeito.',
              'weight_change'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-all shrink-0 text-[11px] cursor-pointer"
        >
          💪 Parabéns pela carga (+2kg)
        </button>
        <button
          type="button"
          onClick={() =>
            handleSendQuickMessage(
              'A substituição que você realizou foi perfeita e manteve o mesmo grupo muscular alvo.',
              'exercise_change'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-500 transition-all shrink-0 text-[11px] cursor-pointer"
        >
          🔄 Substituição autorizada
        </button>
        <button
          type="button"
          onClick={() =>
            handleSendQuickMessage(
              'Atenção ao intervalo de descanso entre as séries: preserve os 60 segundos completos para recuperação.',
              'question'
            )
          }
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-500 transition-all shrink-0 text-[11px] cursor-pointer"
        >
          ⏱️ Atenção ao descanso
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nenhuma mensagem nesta categoria
            </p>
            <p className="text-xs text-slate-400">
              Inicie a conversa para alinhar alterações de carga, trocas ou esclarecer dúvidas.
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

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-center gap-1.5 text-[11px] ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {msg.senderName}
                    </span>
                    {msg.senderRole === 'personal' && (
                      <Badge variant="success" size="sm" className="text-[9px] py-0 px-1">Treinadora</Badge>
                    )}
                    {msg.category && msg.category !== 'general' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${categoryInfo.badgeClass}`}
                      >
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

      <div className="p-4 bg-slate-50 dark:bg-dark-cardElevated/40 border-t border-slate-100 dark:border-dark-border/60 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-bold shrink-0">Classificar mensagem:</span>
          {(
            [
              'general',
              'weight_change',
              'exercise_change',
              'question',
              'assessment',
              'motivation',
            ] as MessageCategory[]
          ).map((cat) => {
            const isSelected = selectedCategory === cat;
            const conf = CATEGORY_CONFIG[cat];
            const Icon = conf.icon;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-lg flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border hover:border-emerald-500'
                }`}
              >
                <Icon className="w-3 h-3" />
                {conf.label}
              </button>
            );
          })}
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
            placeholder="Digite sua orientação, feedback de carga ou mensagem para o aluno... (Enter para enviar)"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
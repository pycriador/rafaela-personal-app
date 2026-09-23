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
  Reply,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Student, StudentMessage, MessageCategory } from '../../types';
import { messageRepository } from '../../repositories/messageRepository';
import { useToast } from '../../context/ToastContext';

interface StudentTrainerChatSectionProps {
  student: Student;
  currentUserId?: string;
  currentUserRole?: 'personal' | 'student';
  className?: string;
}

const CATEGORY_CONFIG: Record<
  MessageCategory,
  { label: string; icon: any; badgeClass: string; bgLight: string }
> = {
  general: {
    label: 'Geral',
    icon: MessageSquare,
    badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
    bgLight: 'bg-slate-100 dark:bg-dark-cardElevated',
  },
  question: {
    label: 'Dúvida Técnica',
    icon: HelpCircle,
    badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold',
    bgLight: 'bg-amber-500/10 dark:bg-amber-950/20',
  },
  weight_change: {
    label: 'Aumento de Carga',
    icon: TrendingUp,
    badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold',
    bgLight: 'bg-emerald-500/10 dark:bg-emerald-950/20',
  },
  exercise_change: {
    label: 'Troca de Exercício',
    icon: RotateCcw,
    badgeClass: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold',
    bgLight: 'bg-cyan-500/10 dark:bg-cyan-950/20',
  },
  assessment: {
    label: 'Avaliação da Treinadora',
    icon: Award,
    badgeClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-400 font-bold',
    bgLight: 'bg-purple-500/10 dark:bg-purple-950/20',
  },
  motivation: {
    label: 'Motivação & Feedback',
    icon: Sparkles,
    badgeClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-400 font-bold',
    bgLight: 'bg-rose-500/10 dark:bg-rose-950/20',
  },
};

function formatMessageDateGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Hoje';
  if (isYesterday) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export const StudentTrainerChatSection: React.FC<StudentTrainerChatSectionProps> = ({
  student,
  currentUserId = 'user-rafaela',
  currentUserRole = 'personal',
  className,
}) => {
  const { error: toastError } = useToast();
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
  const [activeFilter, setActiveFilter] = useState<'all' | MessageCategory>('all');
  const [replyingToMessage, setReplyingToMessage] = useState<StudentMessage | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStudentViewer = currentUserRole === 'student';
  const trainerAvatar =
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&auto=format&fit=crop&q=80';

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

    // Polling contínuo em background para chat responsivo em tempo real
    const interval = setInterval(() => {
      loadMessages(true);
    }, 2500);

    // Ouvinte cross-tab (storage change)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rafaela_app_student_messages_v1') {
        loadMessages(true);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Ouvinte de evento local customizado
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

  // Foca no campo de texto ao ativar resposta
  useEffect(() => {
    if (replyingToMessage) {
      textareaRef.current?.focus();
    }
  }, [replyingToMessage]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    try {
      const isPersonal = currentUserRole === 'personal';
      const senderName = isPersonal ? 'Rafaela Personal' : student.name;
      const senderId = isPersonal ? 'user-rafaela' : (student.userId || student.id);

      const replyToData = replyingToMessage
        ? {
            messageId: replyingToMessage.id,
            senderName: replyingToMessage.senderName,
            content: replyingToMessage.content,
          }
        : undefined;

      await messageRepository.sendMessage({
        studentId: student.id,
        senderId,
        senderName,
        senderRole: currentUserRole,
        content: inputContent.trim(),
        category: selectedCategory,
        replyTo: replyToData,
      });

      setInputContent('');
      setReplyingToMessage(null);
      setSelectedCategory('general');
      await loadMessages(true);

      // Scroll suave interno apenas quando o próprio usuário envia uma nova mensagem
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 50);
    } catch (err) {
      toastError('Erro ao enviar mensagem.');
    }
  };

  const handleSendQuickMessage = (content: string, category: MessageCategory) => {
    setInputContent(content);
    setSelectedCategory(category);
    textareaRef.current?.focus();
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await messageRepository.deleteMessage(msgId);
      await loadMessages(true);
    } catch (err) {
      toastError('Erro ao excluir mensagem.');
    }
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2');
      }, 1800);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'all') return true;
    return m.category === activeFilter;
  });

  return (
    <div className={`flex flex-col w-full h-full flex-1 min-h-0 overflow-hidden bg-transparent ${className || ''}`}>
      {/* 1. BARRA SUPERIOR FIXA NO TOPO (SEM CAIXA) */}
      <div className="shrink-0 z-10 py-3 px-4 sm:px-6 md:px-8 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-b border-slate-200/80 dark:border-dark-border/80 select-none shadow-2xs">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={
                  isStudentViewer
                    ? trainerAvatar
                    : (student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
                }
                alt={isStudentViewer ? 'Rafaela Personal' : student.name}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-xs"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white dark:ring-dark-card" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {isStudentViewer ? 'Rafaela Personal' : student.name}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  {isStudentViewer ? 'Treinadora Oficial' : 'Aluno'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online agora</span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-normal truncate">
                  {isStudentViewer
                    ? 'Canal oficial de dúvidas técnicas, execuções e treinos'
                    : 'Acompanhamento individual de metas e cargas'}
                </span>
              </div>
            </div>
          </div>

          {/* Controles de Filtro e Sincronização */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="text-xs font-bold bg-white dark:bg-[#111b21] border border-slate-200 dark:border-dark-border rounded-xl px-2.5 py-1.5 pr-7 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs appearance-none"
              >
                <option value="all">Todas ({messages.length})</option>
                <option value="question">❓ Dúvidas</option>
                <option value="weight_change">📈 Cargas</option>
                <option value="exercise_change">🔄 Trocas</option>
                <option value="assessment">🏆 Avaliações</option>
                <option value="motivation">✨ Feedback</option>
                <option value="general">💬 Geral</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              title="Atualizar mensagens"
              onClick={() => {
                setIsRefreshing(true);
                loadMessages(false);
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-500 hover:bg-white dark:hover:bg-[#111b21] border border-slate-200 dark:border-dark-border rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. ÁREA CENTRAL DE MENSAGENS COM ROLAGEM SUAVE (SEM BARRA VISÍVEL) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 sm:px-6 md:px-8 py-3 bg-[#efeae2]/15 dark:bg-[#0b141a]/30"
      >
        <div className="max-w-4xl mx-auto w-full space-y-4">
        {/* Banner Sutil de Privacidade */}
        <div className="flex justify-center select-none my-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-dark-cardElevated/60 text-slate-500 dark:text-slate-400 text-[11px] font-semibold text-center max-w-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Canal seguro gravado no banco de dados. Tire suas dúvidas diretamente com a treinadora.</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200">
              {activeFilter === 'all'
                ? 'Nenhuma mensagem trocada ainda'
                : 'Nenhuma mensagem nesta categoria'}
            </p>
            <p className="text-xs text-slate-500 dark:text-dark-muted leading-relaxed">
              {isStudentViewer
                ? 'Envie sua primeira dúvida sobre postura, execução ou evolução de cargas pela barra abaixo.'
                : `Inicie a conversa direta com ${student.name} para alinhar treinos e metas.`}
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const isMe =
              (currentUserRole === 'personal' && msg.senderRole === 'personal') ||
              (currentUserRole === 'student' && msg.senderRole === 'student');

            const categoryInfo = msg.category ? CATEGORY_CONFIG[msg.category] : CATEGORY_CONFIG.general;
            const CategoryIcon = categoryInfo.icon;

            // Agrupamento por data (Hoje, Ontem, etc.)
            const prevMsg = filteredMessages[idx - 1];
            const showDateHeader =
              !prevMsg ||
              new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

            return (
              <React.Fragment key={msg.id}>
                {showDateHeader && (
                  <div className="flex justify-center my-3 select-none">
                    <span className="px-3.5 py-1 rounded-full bg-slate-200/80 dark:bg-dark-cardElevated/90 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                      {formatMessageDateGroup(msg.timestamp)}
                    </span>
                  </div>
                )}

                <div
                  id={`msg-${msg.id}`}
                  className={`flex items-end gap-2 transition-all duration-300 ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* BALÃO DE MENSAGEM */}
                  <div
                    className={`relative max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-xs group transition-shadow ${
                      isMe
                        ? 'bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef] rounded-tr-xs'
                        : 'bg-white text-[#111b21] dark:bg-dark-card dark:text-[#e9edef] rounded-tl-xs border border-slate-200/70 dark:border-dark-border/60'
                    }`}
                  >
                    {/* Cabeçalho do Balão (Autor & Categoria) */}
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span
                        className={`text-[11px] font-extrabold truncate ${
                          isMe
                            ? 'text-emerald-800 dark:text-emerald-200'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {msg.senderName}
                        {msg.senderRole === 'personal' && (
                          <span className="ml-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                            Treinadora
                          </span>
                        )}
                      </span>

                      {msg.category && msg.category !== 'general' && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold shrink-0 ${categoryInfo.badgeClass}`}
                        >
                          <CategoryIcon className="w-2.5 h-2.5" />
                          <span>{categoryInfo.label}</span>
                        </span>
                      )}
                    </div>

                    {/* BLOCO DE RESPOSTA COTADA (QUOTED REPLY) */}
                    {msg.replyTo && (
                      <div
                        onClick={() => scrollToMessage(msg.replyTo!.messageId)}
                        className={`mb-2 p-2.5 rounded-xl border-l-4 cursor-pointer transition-all ${
                          isMe
                            ? 'border-emerald-600 bg-emerald-600/10 dark:bg-black/20 hover:bg-emerald-600/15'
                            : 'border-emerald-500 bg-slate-100 dark:bg-black/25 hover:bg-slate-200/70'
                        }`}
                        title="Clique para ir até a mensagem original"
                      >
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 mb-0.5">
                          <Reply className="w-3 h-3" />
                          <span>{msg.replyTo.senderName}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {msg.replyTo.content}
                        </p>
                      </div>
                    )}

                    {/* METADADOS DE EXERCÍCIO / CARGA */}
                    {msg.metadata?.exerciseName && (
                      <div
                        className={`mb-2 p-2 rounded-xl text-xs font-mono flex items-center justify-between gap-2 ${
                          isMe
                            ? 'bg-emerald-700/15 dark:bg-black/25 text-emerald-900 dark:text-emerald-100'
                            : 'bg-slate-100 dark:bg-black/30 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1.5 truncate">
                          <Dumbbell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{msg.metadata.exerciseName}</span>
                        </span>
                        {msg.metadata.weightAfter && (
                          <span className="font-extrabold shrink-0 text-emerald-700 dark:text-emerald-300">
                            {msg.metadata.weightBefore ? `${msg.metadata.weightBefore}kg → ` : ''}
                            {msg.metadata.weightAfter}kg
                          </span>
                        )}
                      </div>
                    )}

                    {/* CONTEÚDO PRINCIPAL DO TEXTO */}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed break-words select-text">
                      {msg.content}
                    </p>

                    {/* RODAPÉ DO BALÃO: HORA, CHECKMARKS & AÇÕES */}
                    <div className="flex items-center justify-end gap-2 mt-1.5 select-none pt-0.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {isMe && (
                        <CheckCheck
                          className={`w-3.5 h-3.5 ${
                            msg.read
                              ? 'text-sky-500 dark:text-sky-400'
                              : 'text-slate-400 dark:text-slate-400'
                          }`}
                        />
                      )}

                      {/* Botões de Ação no Balão (Responder / Excluir) */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                          type="button"
                          onClick={() => setReplyingToMessage(msg)}
                          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 cursor-pointer transition-colors"
                          title="Responder a esta mensagem específica"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                          title="Excluir mensagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        </div>
      </div>

      {/* 3. BARRA INFERIOR FIXA DE RESPOSTA (RODAPÉ FIXO NO FUNDO) */}
      <div className="shrink-0 z-10 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-t border-slate-200/80 dark:border-dark-border/80">
        <div className="max-w-4xl mx-auto w-full space-y-2">
        {/* BANNER DE RESPOSTA ATIVA (QUOTED REPLY DOCKED) */}
        {replyingToMessage && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-dark-cardElevated border-l-4 border-emerald-500 shadow-xs animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                <Reply className="w-3.5 h-3.5" />
                <span>Respondendo a {replyingToMessage.senderName}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                {replyingToMessage.content}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReplyingToMessage(null)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-dark-border cursor-pointer"
              title="Cancelar resposta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SELETORES EM LINHA: CLASSIFICAR E MODELO DE DÚVIDAS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown de Classificação (preenchido automaticamente ao selecionar modelo) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
              Classificar:
            </span>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MessageCategory)}
                className="text-xs font-bold bg-slate-100 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border rounded-xl px-2.5 py-1.5 pr-7 text-slate-800 dark:text-slate-200 hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs appearance-none"
              >
                <option value="general">💬 Geral</option>
                <option value="question">❓ Dúvida</option>
                <option value="weight_change">📈 Carga</option>
                <option value="exercise_change">🔄 Troca</option>
                <option value="motivation">✨ Feedback</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Modelos Rápidos de Dúvida */}
          <div className="relative">
            <select
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const [cat, text] = val.split(':::');
                handleSendQuickMessage(text, cat as MessageCategory);
                e.target.value = '';
              }}
              className="text-xs font-bold bg-slate-100 dark:bg-dark-cardElevated border border-emerald-500/40 rounded-xl px-2.5 py-1.5 pr-7 text-emerald-800 dark:text-emerald-300 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs appearance-none"
            >
              <option value="" disabled>
                ⚡ Modelos de dúvidas...
              </option>
              {isStudentViewer ? (
                <>
                  <option value="question:::Oi Rafaela! Estou com uma dúvida sobre a postura e amplitude correta neste exercício.">
                    ❓ Dúvida sobre postura e execução
                  </option>
                  <option value="weight_change:::Consegui progredir a carga hoje mantendo o controle total do movimento!">
                    💪 Relatar aumento de carga
                  </option>
                  <option value="exercise_change:::O aparelho estava ocupado e precisei realizar a variação alternativa recomendada.">
                    🔄 Reportar exercício alternativo
                  </option>
                  <option value="question:::Senti bastante cansaço muscular hoje. Posso ajustar o descanso para 60s ou reduzir uma série?">
                    ⏱️ Solicitar ajuste de descanso
                  </option>
                  <option value="question:::Senti um leve desconforto na articulação durante a série. Devo pausar ou trocar?">
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

        {/* CAMPO DE DIGITAÇÃO E BOTÃO ENVIAR */}
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                replyingToMessage
                  ? `Responder para ${replyingToMessage.senderName}...`
                  : isStudentViewer
                  ? 'Digite sua mensagem para a Rafaela... (Enter para enviar)'
                  : `Digite sua mensagem para ${student.name}... (Enter para enviar)`
              }
              rows={1}
              className="w-full resize-none rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated/80 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-dark-card shadow-xs max-h-32 min-h-[46px]"
            />
          </div>

          <button
            type="submit"
            disabled={!inputContent.trim()}
            className="w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
            title="Enviar mensagem (Enter)"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};
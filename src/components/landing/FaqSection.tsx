import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Nunca treinei ou estou sedentária há anos. O acompanhamento é para mim?',
      a: 'Com certeza! A anamnese inicial identifica exatamente seu nível de partida. Se você for iniciante, sua prescrição terá foco em adaptação neuromuscular, postura e segurança articular, com ilustrações animadas no app que ensinam o movimento passo a passo antes de você colocar peso.',
    },
    {
      q: 'Como funciona o acompanhamento com a Nutricionista nos planos combinados?',
      a: 'No plano Total Fit e Transformação 360°, você recebe o atendimento de uma Nutricionista Esportiva credenciada pelo CFN. Ela realiza uma consulta online com você, calcula suas metas calóricas e macronutrientes alinhadas aos treinos da Rafaela e cadastra suas refeições com substituições inteligentes dentro do app.',
    },
    {
      q: 'Posso treinar em qualquer academia ou até mesmo em casa?',
      a: 'Sim! Na ficha de anamnese você informa os equipamentos que tem disponíveis (academia de bairro, rede de grande porte, condomínio ou halteres em casa). O plano é montado sob medida para o seu ambiente.',
    },
    {
      q: 'O que é a "Liberdade Monitorada" de substituição de exercícios?',
      a: 'É um recurso exclusivo do nosso app. Se um aparelho da sua ficha estiver ocupado, o app oferece opções alternativas pré-autorizadas pela Rafaela para o mesmo grupo muscular. Você troca com 1 toque, seu treino não perde a eficácia e a Rafaela recebe o registro no dashboard.',
    },
    {
      q: 'Como envio meus vídeos para correção de postura?',
      a: 'Nos planos Performance Pro, Elite e combos, você tem acesso ao canal direto de WhatsApp da Rafaela. Sempre que tiver dúvida na execução de um exercício como supino, terra ou agachamento, basta gravar um vídeo curto e enviar para receber o feedback técnico em áudio.',
    },
    {
      q: 'Existe contrato de fidelidade ou taxa de cancelamento?',
      a: 'Não. Você é livre para treinar conosco pelo tempo que fizer sentido para você. Não há taxa de matrícula nem multas de fidelidade.',
    },
    {
      q: 'Como recebo o acesso ao aplicativo após escolher meu plano?',
      a: 'Assim que a contratação for confirmada, você receberá seus dados de acesso (usuário e senha) para entrar diretamente no app, além do link do formulário de anamnese para começarmos a montagem do seu treino personalizado.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <Badge variant="brand" size="sm">
            Tire Suas Dúvidas
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-dark-muted">
            Transparência total para você dar o próximo passo rumo aos seus objetivos.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-dark-cardElevated/30 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 dark:bg-dark-cardElevated flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-emerald-500 text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-dark-muted leading-relaxed border-t border-slate-100 dark:border-dark-border/40 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Ainda ficou com alguma dúvida específica?
            </h4>
            <p className="text-xs text-slate-600 dark:text-dark-muted">
              Fale diretamente com a equipe da Rafaela pelo WhatsApp e tire suas dúvidas agora mesmo.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.open('https://wa.me/5511999999999?text=Ol%C3%A1%20Rafaela,%20estou%20com%20uma%20d%C3%BAvida%20sobre%20os%20planos', '_blank')}
            leftIcon={<MessageCircle className="w-4 h-4" />}
            className="shrink-0 text-xs font-bold"
          >
            Falar no WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
};

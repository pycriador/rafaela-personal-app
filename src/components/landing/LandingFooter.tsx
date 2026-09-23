import React from 'react';
import { Dumbbell, ShieldCheck, Heart, Globe, Mail, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-2xs">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-tight block">
                  Rafaela Personal
                </span>
                <span className="text-[10px] text-slate-500">
                  Biomecânica & Performance Esportiva
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Plataforma de consultoria esportiva individualizada com metodologia científica, catálogo de exercícios animados em 3 fases e acompanhamento postural contínuo.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Responsabilidade Profissional & Ética</span>
              </div>
              <p className="text-slate-500">
                Prescrição de treinamento sob responsabilidade técnica de Profissional de Educação Física (CREF Ativo). Orientações nutricionais dos planos combinados integradas exclusivamente por Nutricionistas habilitados pelo CFN.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navegação
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => scrollTo('recursos')} className="hover:text-emerald-400 transition-colors">
                  Recursos do App
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('metodologia')} className="hover:text-emerald-400 transition-colors">
                  Metodologia Biomecânica
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('demonstracao')} className="hover:text-emerald-400 transition-colors">
                  Demonstração de Exercícios
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('planos')} className="hover:text-emerald-400 transition-colors">
                  Planos de Treino & Combos
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('depoimentos')} className="hover:text-emerald-400 transition-colors">
                  Histórias de Sucesso
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('faq')} className="hover:text-emerald-400 transition-colors">
                  Perguntas Frequentes
                </button>
              </li>
            </ul>
          </div>

          {/* Client Area & Contact */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Área do Aluno & Contato
            </h4>

            <p className="text-slate-400 text-xs">
              Já é aluna ou personal? Acesse o portal administrativo ou a área de treino.
            </p>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors text-xs"
            >
              Acessar Plataforma Web
            </button>

            <div className="pt-2 space-y-1.5 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp: (11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>contato@rafaelapersonal.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>@rafaelapersonaltrainer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} Rafaela Personal Training. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> para quem busca evolução real.
          </p>
        </div>
      </div>
    </footer>
  );
};

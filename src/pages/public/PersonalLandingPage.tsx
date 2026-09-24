import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  Star,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  Dumbbell,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Award,
  Clock,
  ChevronRight,
  Users,
  Smartphone,
  Flame,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { trainerLandingRepository } from '../../repositories/trainerLandingRepository';
import { TrainerLandingPageConfig } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BrandLogo } from '../../components/ui/BrandLogo';

export const PersonalLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { theme, toggleTheme } = useTheme();

  const [config, setConfig] = useState<TrainerLandingPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (slug) {
        const data = await trainerLandingRepository.getBySlug(slug);
        setConfig(data);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Personal Trainer não encontrado</h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted max-w-md">
          A página do treinador solicitada não está publicada ou o link está incorreto.
        </p>
        <Link to="/">
          <Button variant="primary">Voltar para a Página Inicial</Button>
        </Link>
      </div>
    );
  }

  const cleanPhone = config.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-slate-900 dark:text-white transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-dark-bg/80 border-b border-slate-200/80 dark:border-dark-border/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={config.photoUrl}
              alt={config.trainerName}
              className="w-9 h-9 rounded-full object-cover border border-emerald-500"
            />
            <div>
              <span className="font-black text-sm tracking-tight block text-slate-900 dark:text-white">
                {config.trainerName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                CREF {config.cref}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
              title="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/login">
              <Button variant="secondary" size="sm" className="text-xs">
                Área do Aluno
              </Button>
            </Link>
            <a
              href={`https://wa.me/${cleanPhone}?text=Ola%20${encodeURIComponent(
                config.trainerName
              )},%20vim%20pela%20sua%20página%20e%20gostaria%20de%20consultoria!`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="primary"
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-500 hidden sm:flex"
                leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
              >
                Falar no WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>Consultoria Certificada • CREF {config.cref}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {config.headline}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-dark-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {config.subheadline || config.bio}
            </p>

            <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
              {config.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-dark-cardElevated text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-dark-border/60"
                >
                  ✓ {spec}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 justify-center lg:justify-start">
              <a href="#planos" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="bg-emerald-600 hover:bg-emerald-500 text-sm font-bold shadow-lg shadow-emerald-500/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Ver Planos & Preços
                </Button>
              </a>
              <a
                href={`https://wa.me/${cleanPhone}?text=Ola%20${encodeURIComponent(
                  config.trainerName
                )},%20gostaria%20de%20mais%20informações%20sobre%20sua%20consultoria.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="text-sm"
                  leftIcon={<MessageCircle className="w-4 h-4 text-emerald-500" />}
                >
                  Tirar Dúvidas Direto Comigo
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>{config.experienceYears} Anos de Experiência</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span>App Exclusivo Incluso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Garantia de Qualidade</span>
              </div>
            </div>
          </div>

          {/* Coach Photo Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-3xl blur-2xl transform -rotate-2" />
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-dark-border shadow-2xl bg-white dark:bg-dark-card">
                <img
                  src={config.photoUrl}
                  alt={config.trainerName}
                  className="w-full h-96 object-cover object-top"
                />
                <div className="p-5 space-y-2 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {config.trainerName}
                      </h3>
                      <span className="text-xs text-emerald-500 font-bold">
                        Personal Trainer Especialista
                      </span>
                    </div>
                    {config.instagram && (
                      <span className="text-xs text-slate-400 font-mono">
                        {config.instagram}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-muted leading-relaxed">
                    {config.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Differentials */}
      <section className="py-16 bg-slate-50 dark:bg-dark-cardElevated/40 border-y border-slate-200/80 dark:border-dark-border/80 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Como Funciona Meu Acompanhamento
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted">
              Uma metodologia testada que combina tecnologia de ponta, ciência do movimento e proximidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Anamnese Completa',
                desc: 'Avaliamos seu histórico, restrições articulares, rotina e metas específicas antes de prescrever qualquer carga.',
              },
              {
                step: '02',
                title: 'Ficha no Aplicativo',
                desc: 'Seu treino fica disponível no app com vídeos ilustrativos, séries, repetições e cronômetro de descanso integrado.',
              },
              {
                step: '03',
                title: 'Correção de Técnica',
                desc: 'Você envia vídeos executando os movimentos para refinamento postural e garantia de máxima eficiência sem lesões.',
              },
              {
                step: '04',
                title: 'Evolução Contínua',
                desc: 'Progressão calculada de cargas, deloads periódicos e trocas estratégicas de estímulo para nunca estagnar.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs space-y-3"
              >
                <span className="text-2xl font-black font-mono text-emerald-500">
                  {card.step}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-dark-muted leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="planos" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Investimento no Seu Resultado
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Escolha o Plano Ideal para Você
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted">
              Planos sem pegadinhas. Acompanhamento 100% individualizado com suporte e aplicativo completo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {config.featuredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-card border flex flex-col justify-between space-y-6 relative transition-all duration-200 ${
                  plan.highlight
                    ? 'border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-dark-border shadow-xs hover:border-slate-300'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white shadow-md">
                    Mais Popular
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2 pb-1 border-y border-slate-100 dark:border-dark-border">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-500 font-bold">R$</span>
                      <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-500">/mês</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {plan.billing}
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <a
                    href={
                      plan.checkoutUrl ||
                      `https://wa.me/${cleanPhone}?text=Ola%20${encodeURIComponent(
                        config.trainerName
                      )},%20quero%20assinar%20o%20plano%20${encodeURIComponent(plan.name)}!`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant={plan.highlight ? 'primary' : 'secondary'}
                      fullWidth
                      size="lg"
                      className={`text-xs font-bold ${
                        plan.highlight ? 'bg-emerald-600 hover:bg-emerald-500' : ''
                      }`}
                    >
                      Assinar Plano
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-dark-cardElevated/40 border-t border-slate-200/80 dark:border-dark-border/80 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Depoimentos de Quem Já Treina Comigo
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted">
                Resultados reais de alunos que transformaram sua saúde e físico
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.testimonials.map((test, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{test.comment}"
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-dark-border">
                    {test.avatarUrl ? (
                      <img
                        src={test.avatarUrl}
                        alt={test.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                        {test.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {test.name}
                      </h5>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        {test.result}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-dark-border px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-slate-800 dark:text-white">
              {config.trainerName} • CREF {config.cref}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-lg mx-auto">
            Plataforma oficial de prescrição e consultoria. Todos os treinos são estruturados de acordo com as normas do Conselho Federal de Educação Física.
          </p>
          <div className="pt-2">
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              Acessar Aplicativo de Treinos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

# Plano de Implementação: Landing Page Completa & Detalhada do Rafaela Personal App

Este documento detalha o planejamento da nova **Landing Page oficial** do ecossistema Rafaela Personal, apresentando os diferenciais do app, catálogo interativo, metodologia biomecânica e planos comerciais (3 planos de treinamento e 2 planos combinados com nutricionista esportivo).

---

## 🎯 Objetivos da Landing Page
1. **Posicionamento Profissional**: Demonstrar que o app não é uma planilha estática, mas uma plataforma tecnológica com biomecânica, auditoria de treinos e acompanhamento contínuo.
2. **Demonstração Interativa ao Vivo**: Permitir que visitantes experimentem o player animado com frames locais (mini vídeos), sem necessidade de login prévio.
3. **Conversão Clara de Planos**: Apresentar de forma transparente 3 planos focados em treino e 2 planos integrados com acompanhamento nutricional registrado (CFN).
4. **Fluxo de Navegação Coerente**:
   - Visitantes não autenticados acessam `/` para ver a Landing Page.
   - Botões "Entrar" direcionam para `/login` (ou para o dashboard caso já estejam logados).
   - Botões "Assinar Plano" abrem modal de matrícula / checkout demonstrativo ou contato direto via WhatsApp.

---

## 🎨 Estrutura & Seções da Interface

### 1. Navigation Bar (Fixa com Blur)
- Logo da Rafaela Personal com badge de tecnologia.
- Links de âncora suave: *Metodologia*, *Recursos do App*, *Planos*, *Nutrição Integrada*, *Depoimentos*, *FAQ*.
- Seletor de Tema (Dark/Light).
- Botão Secundário: **Entrar** (leva para `/login`).
- Botão Primário (CTA destaque): **Começar Agora** (scroll para Planos).

### 2. Hero Section de Alta Conversão
- **Headline**: *"Treine com a precisão de uma Personal Trainer de elite na palma da sua mão."*
- **Subheadline**: *"Metodologia baseada em biomecânica, liberdade monitorada para troca de exercícios, mais de 300 movimentos animados e acompanhamento nutricional integrado."*
- **Ações**: CTA "Quero meu Plano Personalizado" + "Ver Demonstração do App".
- **Visual Interativo**: Mockup interativo em CSS com um card de treino real executando o `ExerciseFramePlayer` (mini vídeo animado ao vivo de Supino/Agachamento) com selos de carga e postura.
- **Barra de Confiança**: Prova social (+500 alunos atendidos, 96% de adesão média, 302 exercícios catalogados, CREF ativo).

### 3. Recursos & Diferenciais Tecnológicos
- **300+ Exercícios Animados**: Animações vetoriais locais quadro a quadro (sem vídeos travando ou dependência de internet lenta).
- **Liberdade Monitorada**: O aluno pode substituir exercícios ocupados por alternativas prescritas e autorizadas pela Rafaela, com auditoria em tempo real.
- **Ajuste de Cargas & Progressão**: Registro inteligente de repetições, carga efetiva e histórico de esforço.
- **Auditoria Prescrito vs. Executado**: A personal monitora tudo pelo dashboard administrativo.

### 4. Metodologia Biomecânica da Rafaela
- 4 pilares:
  1. *Anamnese & Avaliação Funcional*
  2. *Periodização Individualizada*
  3. *Correção Postural Contínua*
  4. *Sobrecarga Progressiva Segura*

### 5. Seção de Planos com Seletor Dinâmico (Tabs)
Um seletor permite alternar entre:
- **Apenas Treinamento (3 Planos)**
- **Treino + Nutricionista (2 Planos Combinados)**

#### A. Planos de Treino:
1. **Start / Essencial** (R$ 89/mês):
   - Ficha de treino mensal individualizada.
   - Acesso total ao app e biblioteca de 300+ exercícios animados.
   - Registro de cargas e evolução básica.
   - Suporte via chat quinzenal.
2. **Performance / Pro (Destaque / Mais Escolhido)** (R$ 149/mês):
   - Periodização avançada atualizada a cada 4 semanas.
   - Liberdade monitorada para substituição autorizada de exercícios.
   - Análise de vídeos de execução postural por mensagem.
   - Suporte prioritário via WhatsApp direto com a Rafaela.
   - Relatórios mensais de evolução e gráficos de progressão.
3. **Elite 1-on-1 VIP** (R$ 279/mês):
   - Tudo do Plano Performance.
   - Ajustes ilimitados e acompanhamento semanal.
   - Avaliação física mensal por videoconferência com análise de mobilidade.
   - Acesso a treinos extras para viagens e eventos especiais.

#### B. Planos Combinados com Nutricionista:
4. **Total Fit (Treino + Nutri)** (R$ 249/mês):
   - Todo o acompanhamento do Plano Performance de treino.
   - Plano alimentar personalizado elaborado por **Nutricionista Esportiva parceira (CFN)**.
   - Cálculo individual de calorias e distribuição de macronutrientes.
   - Tabela de substituições inteligentes integrada no app.
   - Consulta online mensal de alinhamento com a nutricionista.
5. **Transformação 360° VIP (Treino + Nutrição Contínua + Exames)** (R$ 399/mês):
   - O acompanhamento mais completo do mercado.
   - Treino periodizado de alta performance + Nutrição esportiva contínua.
   - Reuniões quinzenais conjuntas (Rafaela Personal + Nutricionista).
   - Análise e interpretação de exames laboratoriais.
   - Prescrição orientada de suplementação e fitoterápicos.
   - Canal direto e suporte prioritário diário.

### 6. Área de Demonstração Interativa ("Experimente o App")
- Um simulador em tela onde o visitante pode clicar nas categorias (Peito, Costas, Pernas), selecionar um exercício e ver o player animar em velocidade normal ou 0.5x, com as instruções da Rafaela.

### 7. Prova Social & Casos de Sucesso
- Depoimentos de alunos reais do sistema (Mariana Silva, João Pedro, etc.) com percentual de adesão, fotos de antes/depois simuladas e relatos em primeira pessoa.

### 8. FAQ Interativo (Accordion)
- Respostas para as principais dúvidas:
  - *Nunca treinei, o app é para mim?*
  - *Como funciona a consulta com a nutricionista?*
  - *Posso treinar em qualquer academia ou em casa?*
  - *Como envio meus vídeos para correção de postura?*
  - *Posso cancelar quando quiser?*

### 9. Rodapé Completo
- Informações institucionais, registro CREF / CFN, links de navegação, política de privacidade, termos de uso e links sociais.

---

## 🛠️ Arquitetura Técnica Proposta

### Novos Componentes e Páginas:
1. `src/pages/public/LandingPage.tsx`: Página principal contendo todas as seções modulares.
2. `src/components/landing/LandingNavbar.tsx`: Barra de navegação com tema e autenticação rápida.
3. `src/components/landing/PricingSection.tsx`: Seletor de planos com cards comparativos, cálculo de economia e botões de contratação.
4. `src/components/landing/InteractiveDemo.tsx`: Demonstração ao vivo do catálogo de exercícios usando `ExerciseFramePlayer`.
5. `src/components/landing/FaqSection.tsx`: Sanfona (Accordion) suave de perguntas frequentes.
6. `src/components/landing/CheckoutModal.tsx`: Modal para simulação de matrícula e integração com WhatsApp comercial.

### Atualização de Rotas (`src/App.tsx`):
- `Route path="/"`: Renderiza a nova `<LandingPage />`.
- `Route path="/app"` ou botão no navbar: Acesso direto à plataforma para usuários logados.
- Usuários autenticados que acessam a Landing Page veem um botão conveniente *"Acessar meu Dashboard"* no topo.

---

## 🧪 Plano de Verificação
- **Responsividade**: Teste em resoluções mobile (375px), tablet (768px) e desktop (1440px).
- **Tema Claro / Escuro**: Garantir contraste ideal em ambos os modos.
- **Carregamento de Imagens**: Garantir que as ilustrações e players usem `getAssetUrl` sem quebras no GitHub Pages.
- **Build & CI**: Executar `npm run build` e `npm run test:flow` para assegurar integridade total.

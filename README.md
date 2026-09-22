# 🏋️‍♀️ RAFAELA PERSONAL APP • Plataforma Completa de Treinamento & Acompanhamento

Plataforma web profissional, responsiva e mobile-first para a personal trainer **Rafaela** gerenciar seus alunos, prescrever treinos com flexibilidade controlada, orientar planos nutricionais, acompanhar a evolução física e auditar em tempo real a execução prática de cada série.

---

## 🌟 Destaques da Plataforma

- **Dual-Portal**: Acesso diferenciado e seguro para a **Personal Trainer** e para os **Alunos**.
- **Auditabilidade Absoluta (Regra de Ouro)**: Comparação contínua de **Prescrito vs. Executado vs. Alterado**. Cada carga aumentada/reduzida, exercício substituído ou pulado pelo aluno gera um log detalhado com data, motivo e impacto.
- **Mini Vídeos de Exercícios Locais**: Biblioteca com **32 exercícios** e **96 frames vetoriais SVG de alta definição** (`1 -> 2 -> 3 -> 2 -> 1`), simulando as fases concêntrica e excêntrica sem latência de rede ou custos de streaming.
- **Backup Seguro & Conformidade LGPD**: Exportação do banco completo em `.JSON` com **senhas protegidas por hash criptográfico (SHA-256 com salt)** e downloads de planilhas `.CSV` por tabela.
- **Filtros e Paginação na URL**: Todas as listagens essenciais suportam filtros reativos e paginação persistida nos search params (`?page=1&query=...`), permitindo compartilhamento de links e navegação fluida.
- **Arquitetura Híbrida Desacoplada (Repository Pattern)**: Suporta **Supabase (PostgreSQL)** como backend primário e conta com fallback transparente para armazenamento local em caso de falta de conexão ou ambiente offline.

---

## 📱 Funcionalidades

### 👩‍🏫 Portal da Personal Trainer (`/personal/*`)

1. **Dashboard Geral (`/personal/dashboard`)**:
   - Indicadores ao vivo: total de alunos ativos, treinos concluídos hoje, adesão média global e taxa de conclusão.
   - **Feed de Auditoria em Tempo Real**: acompanhamento instantâneo de cargas alteradas, exercícios substituídos e justificativas enviadas pelos alunos.
   - Alertas rápidos de aniversários da semana e próximos treinos agendados.
2. **Gestão de Alunos (`/personal/students`)**:
   - Listagem com busca textual, filtro de status (Ativo, Pausado, Arquivado) e paginação na URL.
   - Cadastro completo de novos alunos com restrições físicas, rotina, metas e nível de treinamento.
   - Perfil individual do aluno (`/personal/students/:id`) com abas estruturadas:
     - **Resumo**: estatísticas de adesão, perfil e resumo de alterações.
     - **Treinos**: plano de treino ativo com botões de visualização dos mini vídeos e permissões.
     - **Histórico & Auditoria**: histórico de todas as sessões realizadas com comparativo de carga.
     - **Alimentação**: plano alimentar do aluno com gerenciamento direto de refeições.
     - **Evolução**: gráficos de peso e evolução de cargas em exercícios-chave.
     - **Configurações**: controles para pausar e arquivar o aluno.
3. **Prescrição & Montagem de Treinos (`/personal/workouts/new`)**:
   - Seleção de aluno com filtro e paginação por URL.
   - Divisão de treinos por dias da semana (Segunda a Sábado) e foco muscular.
   - Adição visual de exercícios com pré-visualização de imagem cartoon.
   - Configuração granular de permissões por exercício:
     - Permitir alteração de carga.
     - Permitir substituição por alternativas autorizadas.
     - Permitir pular exercício com justificativa.
4. **Biblioteca de Exercícios (`/personal/exercises`)**:
   - Catálogo de exercícios categorizados (Peito, Costas, Pernas, Ombros, Bíceps, Tríceps, Core).
   - Player vetorial interativo com controles de reprodução, ajuste de velocidade (`0.5x`, `1x`, `1.5x`) e seletor de postura por fase (Início, Transição e Pico).
   - Filtros combinados por busca, categoria, tipo de equipamento e nível de dificuldade, integrados à URL.
   - Cadastro e edição de novos exercícios com alternativas sugeridas.
5. **Central de Nutrição (`/personal/nutrition`)**:
   - Navegação de alunos com paginação e busca por URL.
   - CRUD completo de refeições (Café da manhã, Almoço, Lanche, Jantar, Ceia).
   - Adição, edição e exclusão de itens alimentares, quantidades, sugestões de substituições e notas nutricionais.
6. **Evolução & Bioimpedância (`/personal/evolution`)**:
   - Seletor de aluno com gráficos dinâmicos de curva de peso corporal.
   - Acompanhamento de sobrecarga progressiva (evolução de cargas em kg ao longo do tempo).
   - Galeria de fotos comparativas antes/depois para visualização de resultados estéticos.
7. **Relatórios & Métricas (`/personal/reports`)**:
   - Gráficos consolidados de frequência, adesão dos alunos e volume semanal de séries.
   - Tabela analítica com opção de exportação.
8. **Configurações & Central de Backup (`/personal/settings`)**:
   - Contadores em tempo real de registros em cada tabela do sistema.
   - **Download do Banco Completo (.JSON)** com credenciais criptografadas via Web Crypto API (SHA-256 com salt) - zero senhas em texto puro.
   - **Exportação Individual (.CSV)** para Alunos, Treinos, Sessões, Auditoria, Nutrição e Usuários.
   - Conformidade com as diretrizes de privacidade e LGPD.

---

### 🏃‍♂️ Portal do Aluno (`/student/*`)

1. **Dashboard do Aluno (`/student/dashboard`)**:
   - Card em destaque com o treino prescrito para o dia de hoje e atalho para início imediato.
   - Contador de consistência (dias seguidos) e metas semanais cumpridas.
   - Feed com as últimas sessões e atalhos rápidos.
2. **Execução de Treino Ativo (`/student/workout/active/:dayId`)**:
   - Interface com botões táteis grandes, projetada para uso em smartphones dentro da academia.
   - **Mini player de movimento animado**: animação vetorial do exercício atual para validação de postura.
   - **Cronômetro de descanso regressivo (`RestTimer`)**: dispara automaticamente ao concluir cada série com notificações visuais e sonoras.
   - **Alteração de carga flexível**: o aluno pode ajustar o peso executado (+/- kg), gerando automaticamente a notificação para a Rafaela.
   - **Substituição inteligente**: caso uma máquina esteja ocupada, o aluno pode substituir por um exercício alternativo pré-aprovado pela Rafaela.
   - **Pulo seguro**: opção de pular um exercício mediante preenchimento rápido de justificativa.
   - Finalização do treino com animação de confetes e salvamento instantâneo da sessão.
3. **Meus Treinos (`/student/workouts`)**:
   - Lista completa de todos os dias prescritos e exercícios detalhados.
4. **Minha Alimentação (`/student/nutrition`)**:
   - Guia diário de refeições com opções autorizadas de substituição de alimentos.
5. **Minha Evolução (`/student/evolution`)**:
   - Histórico de pesagens, progresso de cargas nos exercícios favoritos e fotos de evolução.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite
- **Estilização**: Tailwind CSS, Design System Dark/Light Mode
- **Ícones**: Lucide React
- **Gráficos**: Recharts
- **Efeitos**: Canvas Confetti
- **Banco de Dados & Backend**: Supabase (PostgreSQL + REST API)
- **Biblioteca de Movimentos**: Vetores SVG locais adaptados de bryllim/workout-guide
- **Linter & Performance**: Oxlint

---

## 📂 Estrutura do Projeto

```text
rafaela-personal-app/
├── public/
│   └── exercises/
│       └── frames/              # 96 SVGs vetoriais dos 32 exercícios (frame-1, 2, 3)
├── scripts/
│   └── seed-supabase.cjs        # Script de carga inicial e migração para o Supabase
├── src/
│   ├── components/
│   │   ├── layout/              # Header, Sidebar, Bottom Nav
│   │   └── ui/                  # Button, Card, Modal, Tabs, ExerciseFramePlayer, RestTimer
│   ├── context/                 # AuthContext e ThemeContext
│   ├── data/                    # Dados iniciais e catálogos de exercícios
│   ├── layouts/                 # PersonalLayout e StudentLayout
│   ├── lib/                     # Configuração do cliente Supabase e utilitários
│   ├── pages/
│   │   ├── auth/                # LoginPage com alternador de perfis
│   │   ├── personal/            # Dashboard, Students, Workouts, Exercises, Nutrition, etc.
│   │   └── student/             # Dashboard, ActiveWorkout, Nutrition, Evolution
│   ├── repositories/            # Camada de abstração de dados (Supabase + LocalStorage fallback)
│   └── types/                   # Interfaces TypeScript completas
├── supabase/
│   └── schema.sql               # Esquema DDL para criação das tabelas no Supabase
├── .env.example                 # Exemplo de configuração de variáveis de ambiente
├── test-flow.js                 # Teste automatizado do fluxo ponta a ponta
└── package.json
```

---

## 🚀 Como Executar Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com/pycriador/rafaela-personal-app.git
cd rafaela-personal-app
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```
Preencha o `.env` com as credenciais do seu projeto Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```
> **Nota de Segurança**: O arquivo `.env` está incluído no `.gitignore` e **nunca** é enviado para o GitHub. Se nenhuma chave for informada, a aplicação opera automaticamente em modo local/offline através do cache do navegador.

### 4. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:5173](http://localhost:5173) no seu navegador.

### 5. Executar o Teste Automatizado de Fluxo
Valida o login da Rafaela, seleção de aluno, início de treino pela Mariana, alteração de carga, substituição, pulo de exercício, auditoria no dashboard e salvamento:
```bash
npm run test:flow
```

### 6. Gerar Build de Produção
```bash
npm run build
```

---

## 👥 Credenciais de Demonstração (Mock Auth)

O app conta com perfis pré-cadastrados para teste rápido:

| Usuário | E-mail | Senha Padrão | Perfil | Detalhes |
|---|---|---|---|---|
| **Rafaela** | `rafaela@mock.com` | `123456` | Personal Trainer | Acesso administrativo irrestrito |
| **Mariana** | `mariana@mock.com` | `123456` | Aluna | Foco em Hipertrofia (Seg/Qua/Sex) |
| **João** | `joao@mock.com` | `123456` | Aluno | Foco em Emagrecimento (Ter/Qui) |
| **Carlos** | `carlos@mock.com` | `123456` | Aluno | Foco em Condicionamento Físico |
| **Ana** | `ana@mock.com` | `123456` | Aluna | Corrida & Resistência Cardiovascular |
| **Fernanda** | `fernanda@mock.com` | `123456` | Aluna | Força & Ganho de Massa Muscular |

---

## 🌐 Deploy no GitHub Pages com Supabase

O projeto está 100% configurado com pipeline automatizado de CI/CD via **GitHub Actions** (`.github/workflows/deploy.yml`) para publicação contínua no **GitHub Pages** a cada `git push` na branch `main`.

### Passo a Passo para Ativação:

1. **Configurar os Secrets no Repositório GitHub**:
   - No GitHub, acesse seu repositório > **Settings** > **Secrets and variables** > **Actions**.
   - Clique no botão **New repository secret** e cadastre:
     - Nome: `VITE_SUPABASE_URL` | Valor: Sua URL do Supabase (ex: `https://seu-projeto.supabase.co`)
     - Nome: `VITE_SUPABASE_ANON_KEY` | Valor: Sua chave pública anônima do Supabase (`anon key`)

2. **Ativar o GitHub Pages via Actions**:
   - No repositório GitHub, acesse **Settings** > **Pages**.
   - Na seção **Build and deployment** > **Source**, selecione a opção **GitHub Actions**.

3. **Configurar as URLs no Painel do Supabase**:
   - No painel do Supabase, acesse **Authentication** > **URL Configuration**.
   - No campo **Site URL**, informe:
     `https://pycriador.github.io/rafaela-personal-app`
   - Em **Redirect URLs**, adicione:
     `https://pycriador.github.io/rafaela-personal-app/**`

4. **Deploy Automático**:
   - A cada `git push origin main`, o GitHub Actions compilará automaticamente a aplicação com o caminho base correto (`/rafaela-personal-app/`) e as credenciais seguras do Supabase.
   - O suporte a rotas diretas e F5 (SPA) está garantido através do fallback de redirecionamento em `public/404.html`.
   - O aplicativo estará acessível publicamente em:
     **`https://pycriador.github.io/rafaela-personal-app/`**

---

## 🔒 Segurança & Privacidade


- **Zero Credenciais Rastreadas**: Nenhuma chave privada, token ou URL de produção é mantida no código-fonte compartilhado.
- **Hashes Criptográficos**: Na exportação de dados em `/personal/settings`, as senhas são processadas com `crypto.subtle.digest('SHA-256')` enriquecidas com salt dinâmico, garantindo irreversibilidade.
- **Controle de Acesso**: Rotas do painel administrativo da personal são isoladas das rotas do portal do aluno via autenticação por role.

---

## 📄 Licença

Distribuído sob a licença MIT. Desenvolvido para modernizar e elevar a experiência de personal training da Rafaela e seus clientes.

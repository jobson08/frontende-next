This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Meu SaaS – Frontend

Frontend completo de um SaaS multi-tenant com 5 perfis de usuário:

- **Super Admin** → Gerencia todos os tenants
- **Admin do Tenant** → Gerencia alunos, responsáveis e funcionários
- **Funcionário** → Acesso limitado (ex: treinador)
- **Responsável** → Acompanha filhos e mensalidades
- **Aluno** → Acessa treinos, frequência, pagamentos (opcional)

## Stack (2025 – O que as empresas grandes usam)

| Tecnologia           | Versão          | Motivo                                |
| -------------------- | --------------- | ------------------------------------- |
| Next.js              | 15 (App Router) | Server Components + SEO + Performance |
| TypeScript           | 5.9+            | Segurança total                       |
| Tailwind CSS         | 3.4+            | Design rápido e consistente           |
| Shadcn/UI + Radix UI | latest          | Componentes acessíveis e lindos       |
| Lucide React         | latest          | Ícones SVG leves                      |
| Zod                  | latest          | Validação no frontend                 |
| React Hook Form      | latest          | Formulários perfeitos                 |
| TanStack Query       | latest          | Gerenciamento de estado da API        |
| Axios                | latest          | HTTP com interceptors                 |

## Estrutura de Pastas (Padrão Profissional)

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx                 # Login único (detecta role)
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                     # Sidebar + Navbar + RoleGuard
│   │   ├── loading.tsx                    # Skeleton global
│   │   ├── error.tsx                      # Error boundary
│   │   │
│   │   ├── dashboard/page.tsx             # Página inicial (varia por role)
│   │   │
│   │   ├── superadmin/
│   │   │   ├── page.tsx                   # Lista todos os tenants
│   │   │   └── [id]/page.tsx              # Detalhes do tenant
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx                   # Dashboard do admin
│   │   │   ├── alunos/
│   │   │   │   ├── page.tsx               # Lista + busca
│   │   │   │   └── [id]/page.tsx          # Detalhes + botão "Criar login"
│   │   │   └── responsaveis/page.tsx
│   │   │
│   │   ├── funcionario/
│   │   │   └── page.tsx
│   │   │
│   │   ├── aluno/
│   │   │   └── page.tsx                   # Dashboard do aluno
│   │   │
│   │   └── responsavel/
│   │       └── page.tsx                   # Dashboard do responsável
│   │
│   └── layout.tsx                         # Root layout + fonts + metadata
│
├── components/
│   ├── ui/                                # Shadcn/UI (não mexer)
│   ├── layout/
│   │   ├── Sidebar.tsx                    # Desktop (fixo)
│   │   ├── Navbar.tsx
│   │   ├── MobileMenu.tsx                 # Sheet com Sidebar dentro
│   │   └── RoleGuard.tsx                  # Protege rotas por role
│   ├── auth/
│   │   └── LoginForm.tsx
│   └── common/
│       ├── DataTable.tsx
│       ├── CreateLoginButton.tsx          # Reutilizável (aluno/responsável)
│       └── StatusBadge.tsx
│
├── lib/
│   ├── api.ts                             # Axios + token + tenantId automático
│   ├── queryClient.ts                     # TanStack Query config
│   └── utils.ts                           # cn(), formatDate, etc.
│
├── hooks/
│   ├── useAuth.ts                         # /auth/me + role + tenantId
│   └── useTenant.ts
│
├── contexts/
│   └── AuthContext.tsx                    # Auth global (opcional)
│
├── types/
│   └── index.ts                           # Tipos compartilhados
│
└── public/
└── favicon.ico
```

## Como Rodar

```bash
# Clone e instale
git clone https://github.com/seu-usuario/meu-saas-frontend.git
cd meu-saas-frontend
npm install

# Instale os componentes Shadcn
npx shadcn-ui@latest init
npx shadcn-ui@latest add button sheet avatar dropdown-menu table dialog form input label badge toast

# Variáveis de ambiente
cp .env.example .env.local
# Edite com sua URL da API

# Rode
npm run dev
```

Documentação do Frontend do Sistema FutElite
Esta documentação descreve a estrutura principal do frontend do sistema, focando nas funções e páginas chave. O sistema é dividido em módulos principais: SuperAdmin (gerenciamento global), dashboardUser (para usuários finais como alunos, responsáveis e crossfit), e (dashboard) (para administradores e funcionários da escolinha). Usamos Next.js com App Router, Supabase para autenticação e dados, Shadcn/UI para componentes, e TypeScript para tipagem.
A documentação está organizada por módulo, com detalhes sobre páginas, funcionalidades principais, rotas, componentes chave e fluxos de usuário. Todas as páginas são responsivas (mobile-first), com autenticação via Supabase e permissões baseadas em roles (admin, treinador, etc). Módulos como Aulas Extras e CrossFit são condicionais (ativados via configs da escolinha).

1. SuperAdmin (Gerenciamento Global do SaaS)
   Rota base: /superadmin
   Função principal: Administrar múltiplas escolinhas, pagamentos SaaS, relatórios globais e suporte. Acesso apenas para superadmin.

Escolinhas (/superadmin/tenants)
Funções principais: Lista todas as escolinhas cadastradas, com busca, filtro por status (ativa/inativa) e totais de alunos/funcionários. Botão para nova escolinha.
Componentes chave: Table para lista, SearchInput, Badge para status, Link para detalhes/editar.
Fluxo: Superadmin vê lista → clica em uma escolinha → abre detalhes.
Nova Escolinha (/superadmin/tenants/novo)
Funções principais: Formulário para criar nova escolinha (nome, endereço, admin inicial, plano SaaS). Validação Zod, upload de logo. Ao salvar, cria no Supabase e envia email de boas-vindas.
Componentes chave: Form com Input, Select para plano, Button submit, toast de sucesso.
Fluxo: Preenche form → salva → redireciona pra lista.

Detalhe da Escolinha (/superadmin/tenants/[id])
Funções principais: Mostra dados completos (alunos, funcionários, receita, status pagamento). Gráficos de crescimento, botão editar.
Componentes chave: Cards com stats, LineChart para receita, Table para alunos/funcionários.
Fluxo: Da lista → clica detalhe → vê info → edita se precisar.

Editar Escolinha (/superadmin/treinador/[id]/editar)
Funções principais: Formulário pré-preenchido para editar dados (nome, endereço, plano, admin). Atualiza no Supabase.
Componentes chave: Form semelhante ao novo, com useForm e dados carregados via Supabase.
Fluxo: Do detalhe → clica editar → altera → salva → volta ao detalhe.

Pagamentos SaaS (/superadmin/pagamentos)
Funções principais: Lista pagamentos das escolinhas (mensalidades SaaS), filtro por mês, total recebido, inadimplentes. Exportar CSV.
Componentes chave: Table com pagamentos, Search, Select filtro mês, Chart para evolução.
Fluxo: Superadmin vê pagamentos → filtra → envia lembrete para inadimplentes.

Relatórios Globais (/superadmin/relatorios)
Funções principais: Agregados de todas escolinhas (receita total, número de escolinhas ativas, crescimento). Gráficos comparativos, export PDF.
Componentes chave: LineChart, BarChart, Cards stats, Button export.
Fluxo: Superadmin analisa desempenho global → exporta relatório.

Configurações SaaS (/superadmin/configuracoes)
Funções principais: Configs globais (planos de assinatura, taxas SaaS, templates email). Toggle para features globais.
Componentes chave: Form com Switches, Input para taxas, Table para planos.
Fluxo: Superadmin altera configs → salva → afeta todas escolinhas.

Suporte (/superadmin/suporte)
Funções principais: Lista tickets de suporte das escolinhas, chat interno, histórico. Prioridade (alta/baixa).
Componentes chave: Table tickets, Tabs por status (aberto/resolvido), Chat component.
Fluxo: Superadmin vê ticket → responde → fecha.

2. dashboardUser (Usuários Finais: Aluno, CrossFit, Responsável)
   Rota base: /dashboarduser
   Função principal: Acesso pessoal para alunos, responsáveis e usuários CrossFit. Layout simples, foco em acompanhamento pessoal.

Aluno (Rota base: /dashboarduser/aluno-dashboard)
Dashboard (/dashboarduser/aluno-dashboard)
Funções principais: Resumo do aluno (progresso, frequência, próximas aulas). Cards com stats.
Componentes chave: Cards, Chart frequência, List próximas aulas.
Fluxo: Aluno vê resumo → clica em progresso/treinos.

Treinos (/dashboarduser/aluno-dashboard/treinos)
Funções principais: Lista treinos da semana, detalhes do dia, vídeos demonstrativos.
Componentes chave: Calendar view, Cards exercícios, Video player.
Fluxo: Aluno vê treino → assiste vídeo → se prepara.

Mensagens (/dashboarduser/aluno-dashboard/mensagens)
Funções principais: Chat com treinador/admin, histórico, envio mensagem.
Componentes chave: Tabs conversas, ScrollArea chat, Textarea envio.
Fluxo: Aluno lê mensagem do treinador → responde.

Progresso (/dashboarduser/aluno-dashboard/progresso)
Funções principais: Gráficos de evolução (notas, frequência), comparações mês a mês.
Componentes chave: LineChart, BarChart, Cards medias.
Fluxo: Aluno vê progresso → motivação pra continuar.

CrossFit (Rota base: /dashboarduser/crossfit-dashboard)
Dashboard (/dashboarduser/crossfit-dashboard)
Funções principais: Resumo pessoal (frequência, progresso, próxima aula).
Componentes chave: Cards stats, Calendar presença, Link pagamentos.
Fluxo: Usuário CrossFit vê resumo → vê próxima aula.

Pagamento (/dashboarduser/crossfit-dashboard/pagamento)
Funções principais: Histórico pagamentos, próximo vencimento, botão pagar.
Componentes chave: Table pagamentos, Cards status, Button PIX/Cartão.
Fluxo: Usuário vê pendente → clica pagar → integra com gateway.

Mensagens (/dashboarduser/crossfit-dashboard/mensagens)
Funções principais: Chat com treinador, avisos de aulas, histórico.
Componentes chave: Tabs conversas, Chat interface.
Fluxo: Usuário lê mensagem → responde.

Progresso (/dashboarduser/crossfit-dashboard/progresso)
Funções principais: Gráficos de evolução física, frequência, metas.
Componentes chave: LineChart progresso, Cards metas.
Fluxo: Usuário vê ganhos → motivação pra continuar.

Responsável (Rota base: /dashboarduser/responsavel-dashboard)
Dashboard (/dashboarduser/responsavel-dashboard)
Funções principais: Resumo dos filhos (frequência, avaliações, pagamentos). Card para aula extra se ativado.
Componentes chave: Cards por filho, Link pagamentos, Condicional aula extra.
Fluxo: Pai vê resumo → clica filho → detalhes.

Pagamentos (/dashboarduser/responsavel-dashboard/pagamentos)
Funções principais: Histórico, pendentes, botão pagar por filho.
Componentes chave: Table pagamentos, Button PIX, Cards status.
Fluxo: Pai vê pendente → paga.

Alunos (/dashboarduser/responsavel-dashboard/alunos)
Funções principais: Lista filhos, progresso individual, frequência.
Componentes chave: Cards por filho, Charts progresso.
Fluxo: Pai seleciona filho → vê detalhes.

Mensagens (/dashboarduser/responsavel-dashboard/mensagens)
Funções principais: Chat com treinador/admin, por filho.
Componentes chave: Tabs por filho, Chat interface.
Fluxo: Pai lê mensagem sobre filho → responde.

3. (dashboard) (Admin e Funcionários da Escolinha)
   Rota base: /dashboard
   Função principal: Gestão interna da escolinha. Permissões por role (admin, treinador).

Dashboard Admin (/dashboard)
Funções principais: Resumo geral (alunos, receita, frequência, inadimplentes). Gráficos, cards stats.
Componentes chave: Charts, Cards, Condicional CrossFit/aula extra.
Fluxo: Admin vê overview → clica em módulo.

Aluno (Rota base: /dashboard/aluno)
Dashboard (/dashboard/aluno)
Funções principais: Lista alunos, busca, filtro por categoria, totais.
Componentes chave: Table alunos, Search, Stats cards.
Fluxo: Admin vê lista → clica aluno → detalhes.

Novo Aluno (/dashboard/aluno/novo)
Funções principais: Formulário cadastro (nome, idade, responsável, categoria). Validação.
Componentes chave: Form, Select categoria, Button submit.
Fluxo: Preenche → salva → adiciona aluno.

Detalhe Aluno (/dashboard/aluno/[id])
Funções principais: Dados completos, histórico frequência, avaliações, pagamentos.
Componentes chave: Cards info, Charts frequência, List avaliações.
Fluxo: Da lista → clica detalhe → vê tudo.

Editar Aluno (/dashboard/aluno/[id]/editar)
Funções principais: Form pré-preenchido para editar dados.
Componentes chave: Form como novo, pré-load dados.
Fluxo: Do detalhe → edita → salva.

Responsável (Rota base: /dashboard/responsavel)
Dashboard (/dashboard/responsavel)
Funções principais: Lista responsáveis, busca, totais filhos, pagamentos.
Componentes chave: Table responsáveis, Search, Stats.
Fluxo: Admin vê lista → clica responsável → detalhes.

Novo (/dashboard/responsavel/novo)
Funções principais: Cadastro responsável (nome, email, filhos vinculados).
Componentes chave: Form, Select filhos, Button.
Fluxo: Preenche → salva.

Detalhe (/dashboard/responsavel/[id])
Funções principais: Dados, filhos, pagamentos, histórico mensagens.
Componentes chave: Cards filhos, Table pagamentos.
Fluxo: Da lista → detalhe.

Editar (/dashboard/responsavel/[id]/editar)
Funções principais: Edição dados.
Componentes chave: Form pré-load.
Fluxo: Do detalhe → edita.

Treinador (Rota base: /dashboard/treinador)
Dashboard (/dashboard/treinador)
Funções principais: Resumo treinos hoje, alunos, frequência, aulas extras.
Componentes chave: Cards stats, Lista treinos, Condicional extras.
Fluxo: Treinador vê resumo → clica ação.

Meus Alunos (/dashboard/treinador/meus-alunos)
Funções principais: Lista alunos, filtro, média, frequência, botão avaliar.
Componentes chave: Cards alunos, Search, Filtro categoria.
Fluxo: Treinador vê lista → clica aluno → avalia.

Marca Presença (/dashboard/treinador/marca-presenca)
Funções principais: Lista alunos do treino, checkbox, salvar presença.
Componentes chave: Checkbox list, Contador presentes, Button salvar.
Fluxo: Marca checkboxes → salva.

Plano Treino (/dashboard/treinador/plano-treino)
Funções principais: Exercícios do dia, duração, vídeos, dicas.
Componentes chave: Cards exercícios, Video player.
Fluxo: Treinador vê plano → aplica no campo.

Avaliar Aluno (/dashboard/treinador/avaliar-aluno/[id])
Funções principais: Notas por categoria, comentário, salvar avaliação.
Componentes chave: Botões notas, Textarea, Média real-time.
Fluxo: De meus-alunos → avalia aluno específico.

Aula Extra (/dashboard/treinador/aula-extra)
Funções principais: Lista aulas extras, status, marcar realizada.
Componentes chave: Cards aulas, Button marcar.
Fluxo: Treinador vê agendadas → marca realizada.

Mensagens (/dashboard/treinador/mensagens)
Funções principais: Chat com pais/turmas, envio mensagem.
Componentes chave: Tabs turmas/alunos, Chat interface.
Fluxo: Treinador envia comunicado → pais recebem.

CrossFit (Rota base: /dashboard/crossfit)
Dashboard (/dashboard/crossfit)
Funções principais: Resumo clientes, presença, pagamentos.
Componentes chave: Cards stats, Calendar presença.
Fluxo: Admin vê resumo CrossFit.

Novo Aluno (/dashboard/crossfit/novo-aluno)
Funções principais: Cadastro cliente CrossFit.
Componentes chave: Form nome, plano, frequência.
Fluxo: Preenche → salva.

Detalhe (/dashboard/crossfit/[id])
Funções principais: Dados cliente, histórico presença/pagamentos.
Componentes chave: Cards info, Tables histórico.
Fluxo: Da lista → detalhe.

Presença (/dashboard/crossfit/presenca)
Funções principais: Marcar presença clientes CrossFit.
Componentes chave: Checkbox list, Contador.
Fluxo: Marca → salva.

Editar (/dashboard/crossfit/[id]/editar)
Funções principais: Edição cliente.
Componentes chave: Form pré-load.
Fluxo: Do detalhe → edita.

Lançar Pagamentos (/dashboard/crossfit/lancar-pagamentos)
Funções principais: Registrar pagamento cliente CrossFit.
Componentes chave: Form pagamento, Select método.
Fluxo: Lança → atualiza status.

Financeiro (Rota base: /dashboard/financeiro)
Dashboard (/dashboard/financeiro)
Funções principais: Resumo receita, inadimplentes, gráficos.
Componentes chave: Charts, Cards, Condicional CrossFit.
Fluxo: Admin vê financeiro → filtra mês.

Relatório (/dashboard/financeiro/relatorio)
Funções principais: Relatórios detalhados, export.
Componentes chave: Tables, Charts, Button export.
Fluxo: Gera relatório → exporta.

Funcionários (Rota base: /dashboard/funcionarios)
Dashboard (/dashboard/funcionarios)
Funções principais: Lista funcionários, busca, totais.
Componentes chave: Table funcionários, Search.
Fluxo: Admin vê lista → clica funcionário.

Novo (/dashboard/funcionarios/novo)
Funções principais: Cadastro funcionário (nome, role, salário).
Componentes chave: Form, Select role (treinador, administrativo).
Fluxo: Preenche → salva.

Detalhe (/dashboard/funcionarios/[id])
Funções principais: Dados, salário, performance (se treinador, média alunos).
Componentes chave: Cards info, Charts performance.
Fluxo: Da lista → detalhe.

Editar (/dashboard/funcionarios/[id]/editar)
Funções principais: Edição dados.
Componentes chave: Form pré-load.
Fluxo: Do detalhe → edita.

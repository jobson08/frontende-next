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

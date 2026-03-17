# SaaSWPP AI

Plataforma SaaS multitenant para operação comercial via WhatsApp com inteligência artificial integrada.

## 🚀 Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript 5
- **Banco de Dados**: SQLite (via Prisma ORM)
- **Autenticação**: NextAuth.js v4
- **Estilização**: Tailwind CSS 3 + shadcn/ui
- **Estado**: TanStack Query + Zustand
- **Validação**: Zod + React Hook Form
- **Integrações**: Meta WhatsApp API, Evolution API, Iugu, OpenAI/Anthropic/Gemini

## 📋 Pré-requisitos

- Node.js 18+
- Bun (package manager)
- Conta no Meta for Developers (WhatsApp Business API)
- Chaves de API dos provedores de IA

## ⚡ Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd saaswpp-ai

# Instale as dependências
bun install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute as migrações do banco
bun run db:push

# (Opcional) Popule dados iniciais
bun run db:seed

# Inicie o servidor de desenvolvimento
bun run dev
```

## 🏗️ Estrutura do Projeto

```
saaswpp-ai/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Dados iniciais
├── public/                # Arquivos estáticos
├── src/
│   ├── app/               # Rotas do Next.js (App Router)
│   │   ├── (auth)/        # Rotas de autenticação
│   │   ├── (dashboard)/   # Painéis (Admin, Revendedor, Lojista)
│   │   ├── (landing)/     # Landing page
│   │   └── api/           # API Routes
│   ├── components/        # Componentes React
│   │   ├── ui/            # Componentes shadcn/ui
│   │   ├── layout/        # Layout components
│   │   ├── conversations/ # Central de conversas
│   │   ├── crm/           # CRM components
│   │   └── ...
│   ├── lib/               # Bibliotecas e utilitários
│   │   ├── ai/            # AI Pool com failover
│   │   ├── billing/       # Integração Iugu
│   │   ├── whatsapp/      # Provedores WhatsApp
│   │   ├── crm/           # Serviços CRM
│   │   └── ...
│   ├── hooks/             # React hooks customizados
│   └── types/             # Tipos TypeScript
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 👥 Painéis

### 1. Painel Admin
- Dashboard global com KPIs
- Gestão de lojistas
- Gestão de revendedores
- Configuração de planos
- Monitoramento de sistema
- Logs de auditoria

### 2. Painel Revendedor
- Dashboard comercial
- Carteira de clientes
- Links de aquisição
- Comissões e extrato
- Sugestões de upsell

### 3. Painel Lojista
- Dashboard operacional
- Central de conversas (3 colunas)
- CRM com pipeline
- Agenda
- Pedidos e Ordens de Serviço
- Financeiro
- Campanhas
- Base de conhecimento
- Configurações da IA

## 🤖 Módulo de IA

O sistema possui um pool de IA com failover automático entre múltiplos provedores:

- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus/Haiku
- **Google**: Gemini 1.5 Pro/Flash

Características:
- Seleção por prioridade, custo ou velocidade
- Failover automático em caso de erro/timeout
- Rate limiting por tenant
- Logs de execução e custos

## 📱 WhatsApp

Duas implementações disponíveis:

1. **Meta Cloud API** (oficial)
   - Templates aprovados
   - Métricas de qualidade
   - Billing por conversa

2. **Evolution API** (alternativa)
   - QR Code para conexão
   - Multi-instâncias
   - Sem taxa de plataforma

## 💳 Billing

Integração com Iugu para:
- Assinaturas recorrentes
- Cobrança via PIX, boleto, cartão
- Webhooks para eventos de pagamento
- Períodos de trial e grace period
- Gestão de inadimplência

## 🔒 Segurança

- Rate limiting por IP, tenant e usuário
- RBAC com permissões granulares
- Sanitização de inputs com Zod
- Logs de auditoria completos
- Proteção contra injeção de prompts

## 📊 Planos

| Recurso | Básico | Profissional | Premium |
|---------|--------|--------------|---------|
| Preço | R$ 97/mês | R$ 197/mês | R$ 397/mês |
| Mensagens IA | 500 | 2.000 | 10.000 |
| Contatos | 100 | 500 | 2.000 |
| Usuários | 1 | 3 | 10 |
| Números WhatsApp | 1 | 2 | 5 |
| IA Vendedora | ❌ | ✅ | ✅ |
| IA Preditiva | ❌ | ❌ | ✅ |
| ERP WhatsApp | ❌ | ❌ | ✅ |

## 🧪 Testes

```bash
# Testes unitários
bun test

# Testes de integração
bun test:integration

# Coverage
bun test:coverage
```

## 📦 Deploy

```bash
# Build de produção
bun run build

# Iniciar servidor
bun start
```

## 📝 Licença

Propriedade privada - Todos os direitos reservados.

## 🤝 Contribuição

Este é um projeto privado. Para contribuir, entre em contato com a equipe de desenvolvimento.

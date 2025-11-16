# Sistema de Gerenciamento de Caçambas

Sistema completo de gerenciamento de caçambas desenvolvido com tecnologias modernas de desenvolvimento web.

## 📋 Sobre o Projeto

Este é um sistema full-stack para gerenciamento de empresas de locação de caçambas, incluindo controle de:

- **Motoristas**: Cadastro e gerenciamento de motoristas
- **Caminhões**: Controle da frota de caminhões
- **Clientes**: Gestão de clientes
- **Caçambas**: Controle do inventário de caçambas
- **Pedidos**: Gerenciamento de pedidos de locação
- **Rotas**: Planejamento e otimização de rotas
- **Transações**: Controle financeiro
- **Manutenções**: Gestão de manutenções da frota
- **Mapa Operacional**: Visualização geográfica das operações
- **Contas a Pagar/Receber**: Controle financeiro completo
- **Dashboard**: Visão geral do negócio

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e não estilizados
- **Wouter** - Roteamento leve para React
- **tRPC** - Type-safe API calls
- **React Query** - Gerenciamento de estado assíncrono
- **Recharts** - Biblioteca de gráficos
- **Framer Motion** - Animações
- **Lucide React** - Ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **tRPC** - Type-safe API framework
- **Drizzle ORM** - ORM TypeScript-first
- **MySQL** - Banco de dados relacional
- **Jose** - JWT authentication
- **OpenAI** - Integração com IA

### DevOps & Tools
- **pnpm** - Gerenciador de pacotes
- **ESBuild** - Bundler JavaScript
- **Prettier** - Formatação de código
- **Vitest** - Framework de testes
- **TypeScript** - Type checking

## 📁 Estrutura do Projeto

```
cacamba_manager/
├── client/                 # Frontend React
│   ├── public/            # Arquivos estáticos
│   └── src/
│       ├── _core/         # Hooks e utilitários core
│       ├── components/    # Componentes React
│       ├── contexts/      # Contextos React
│       ├── hooks/         # Custom hooks
│       ├── lib/           # Bibliotecas e utilitários
│       ├── pages/         # Páginas da aplicação
│       ├── App.tsx        # Componente principal
│       ├── const.ts       # Constantes
│       ├── index.css      # Estilos globais
│       └── main.tsx       # Entry point
│
├── server/                # Backend Node.js
│   ├── _core/            # Core do servidor
│   │   ├── types/        # Tipos TypeScript
│   │   ├── context.ts    # Contexto tRPC
│   │   ├── cookies.ts    # Gerenciamento de cookies
│   │   ├── dataApi.ts    # API de dados
│   │   ├── env.ts        # Variáveis de ambiente
│   │   ├── index.ts      # Entry point do servidor
│   │   ├── llm.ts        # Integração com LLM
│   │   ├── map.ts        # Funcionalidades de mapa
│   │   ├── oauth.ts      # Autenticação OAuth
│   │   ├── trpc.ts       # Configuração tRPC
│   │   └── vite.ts       # Integração com Vite
│   ├── db.ts             # Configuração do banco de dados
│   ├── routers.ts        # Rotas da API
│   └── storage.ts        # Gerenciamento de storage
│
├── drizzle/              # Schema e migrações do banco
│   ├── migrations/       # Arquivos de migração
│   ├── meta/            # Metadados das migrações
│   ├── schema.ts        # Schema do banco de dados
│   └── relations.ts     # Relações entre tabelas
│
├── shared/               # Código compartilhado
│   ├── _core/           # Core compartilhado
│   ├── const.ts         # Constantes compartilhadas
│   └── types.ts         # Tipos compartilhados
│
├── patches/              # Patches para dependências
├── package.json          # Dependências do projeto
├── pnpm-lock.yaml       # Lock file do pnpm
├── tsconfig.json        # Configuração TypeScript
├── vite.config.ts       # Configuração Vite
├── vitest.config.ts     # Configuração Vitest
├── drizzle.config.ts    # Configuração Drizzle
├── components.json      # Configuração de componentes
└── REQUIREMENTS.md      # Requisitos do projeto
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+ 
- pnpm 8+
- MySQL 8+

### Passos de Instalação

1. Clone o repositório:
```bash
git clone https://github.com/lightearbuz-star/cacamba-manager.git
cd cacamba-manager
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco de dados:
```bash
pnpm db:push
```

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📜 Scripts Disponíveis

- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Compila o projeto para produção
- `pnpm start` - Inicia o servidor em modo produção
- `pnpm check` - Verifica tipos TypeScript
- `pnpm format` - Formata o código com Prettier
- `pnpm test` - Executa os testes
- `pnpm db:push` - Executa migrações do banco de dados

## 🗃️ Banco de Dados

O projeto utiliza MySQL com Drizzle ORM. O schema inclui as seguintes tabelas principais:

- `users` - Usuários do sistema
- `motoristas` - Motoristas cadastrados
- `caminhoes` - Frota de caminhões
- `clientes` - Clientes da empresa
- `cacambas` - Inventário de caçambas
- `pedidos` - Pedidos de locação
- `rotas` - Rotas planejadas
- `transacoes` - Transações financeiras
- `manutencoes` - Registros de manutenção

## 🔐 Autenticação

O sistema utiliza OAuth com Manus para autenticação de usuários.

## 🌐 API

A API é construída com tRPC, proporcionando type-safety completo entre frontend e backend.

## 📱 Funcionalidades

### Dashboard
- Visão geral das operações
- Gráficos e métricas
- Indicadores de performance

### Gestão de Pedidos
- Criação e edição de pedidos
- Rastreamento de status
- Histórico completo

### Mapa Operacional
- Visualização geográfica
- Rastreamento em tempo real
- Otimização de rotas

### Controle Financeiro
- Contas a pagar e receber
- Relatórios financeiros
- Controle de transações

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas etapas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- Desenvolvido com Manus AI

## 📞 Suporte

Para suporte, abra uma issue no repositório do GitHub.

---

**Nota:** Este projeto foi desenvolvido utilizando a plataforma Manus para desenvolvimento full-stack.

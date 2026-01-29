# SortMailBox Frontend

Interface web moderna desenvolvida em **React**, **TypeScript**, **Vite** e **Tailwind CSS** para classificação automática de emails usando Inteligência Artificial. O sistema permite enviar emails por texto ou arquivo e recebe classificação inteligente com sugestões de resposta.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server de alta performance
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Biblioteca de ícones moderna
- **Radix UI** - Componentes acessíveis e sem estilo
- **Axios** - Cliente HTTP para chamadas à API
- **React Query** - Gerenciamento de estado do servidor
- **Sonner** - Sistema de notificações toast
- **shadcn/ui** - Componentes UI baseados em Radix UI

## 📋 Pré-requisitos

- **Node.js** 18+ e npm
- **Backend SortMailBox** em execução (http://localhost:8000)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd SortMailBox-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure a URL da API (opcional)

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Se não configurar, o padrão será `http://localhost:8000/api/v1`.

## ▶️ Executando a Aplicação

### Modo de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

### Preview da Build

```bash
npm run preview
```

## 🏗️ Estrutura do Projeto

```
SortMailBox-frontend/
├── src/
│   ├── app/
│   │   ├── dashboard.tsx          # Página principal do Dashboard
│   │   ├── layout.tsx             # Layout raiz da aplicação
│   │   └── globals.css            # Estilos globais
│   ├── components/
│   │   ├── dashboard.tsx         # Componente principal do Dashboard
│   │   ├── sidebar.tsx           # Barra lateral de navegação
│   │   └── ui/                   # Componentes UI reutilizáveis
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── progress.tsx
│   │       ├── skeleton.tsx
│   │       └── ...
│   ├── services/
│   │   └── api.ts                # Serviço de API
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   ├── lib/
│   │   └── utils.ts              # Funções utilitárias
│   └── main.tsx                  # Entry point da aplicação
├── public/                       # Arquivos estáticos
├── index.html                    # HTML de entrada
├── package.json                  # Dependências do projeto
├── vite.config.ts               # Configuração do Vite
├── tailwind.config.ts           # Configuração do Tailwind
├── tsconfig.json                # Configuração do TypeScript
└── README.md
```

## ✨ Funcionalidades

- ✅ **Dashboard Moderno**: Interface com sidebar e layout responsivo
- ✅ **Upload de Arquivos**: Suporte para arquivos .txt e .pdf com drag & drop
- ✅ **Digitação de Texto**: Interface para colar ou digitar conteúdo de email
- ✅ **Classificação Inteligente**: Categorização automática em Produtivo/Improdutivo
- ✅ **Nível de Confiança**: Indicador visual da precisão da classificação
- ✅ **Respostas Sugeridas**: Geração automática de respostas pela IA
- ✅ **Editor de Resposta**: Editor visual para editar respostas sugeridas
- ✅ **Integração Gmail**: Botão para abrir resposta no Gmail
- ✅ **Interface Responsiva**: Design adaptável para mobile, tablet e desktop
- ✅ **Feedback Visual**: Animações e estados de loading com skeletons
- ✅ **Notificações**: Sistema de toast para feedback ao usuário
- ✅ **Dark Mode**: Tema escuro padrão (slate/indigo)
- ✅ **Métricas**: Cards de métricas mockadas (Emails processados, Tempo economizado, Precisão)

## 🎨 Componentes Principais

### Dashboard
Componente principal que contém:
- **Sidebar**: Navegação (Dashboard, Histórico, Configurações)
- **Métricas**: 3 cards com estatísticas mockadas
- **Card de Entrada**: Drag-and-drop, campo de assunto, textarea
- **Card de Resultado**: Badge de classificação, barra de progresso, editor de resposta

### Sidebar
Barra lateral fixa com:
- Logo SortMailBox
- Itens de navegação
- Perfil de usuário

## 🔌 Integração com API

O frontend se comunica com o backend através do serviço `api.ts`:

```typescript
// Classificar por texto
await emailService.classifyText({
  content: "Conteúdo do email",
  subject: "Assunto (opcional)"
})

// Classificar por arquivo
await emailService.classifyFile(file, subject)
```

### Endpoints Utilizados

- `POST /api/v1/classify` - Classificar email por texto
- `POST /api/v1/classify/upload` - Classificar email por arquivo

## 📦 Dependências

Consulte o arquivo [DEPENDENCIES.md](./DEPENDENCIES.md) para a lista completa de dependências.

### Principais Dependências

**Produção:**
- `react` - Biblioteca principal
- `react-dom` - Renderização
- `axios` - Cliente HTTP
- `lucide-react` - Ícones
- `tailwind-merge` - Utilitário CSS
- `clsx` - Combinação de classes
- `sonner` - Notificações

**Desenvolvimento:**
- `vite` - Build tool
- `typescript` - Tipagem estática
- `tailwindcss` - Framework CSS
- `@vitejs/plugin-react` - Plugin React

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 📱 Dispositivos móveis (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1440px+)

## 🛠️ Desenvolvimento

### Adicionar Novo Componente

1. Crie o arquivo em `src/components/`
2. Exporte o componente
3. Importe e use onde necessário

### Adicionar Nova Rota

O projeto pode ser expandido com React Router para incluir rotas adicionais.

### Estilização

- Use Tailwind CSS para estilos
- Componentes UI em `src/components/ui/`
- Estilos globais em `src/app/globals.css`
- Tema dark mode configurado por padrão

## 🐛 Troubleshooting

### Erro de CORS

Certifique-se de que o backend está configurado para aceitar requisições do frontend. Verifique a variável `CORS_ORIGINS` no backend.

### API não encontrada

Verifique se:
1. O backend está rodando em http://localhost:8000
2. A variável `VITE_API_URL` no `.env` está configurada corretamente
3. Não há erros no console do navegador (F12)

### Dependências faltando

Se encontrar erros de dependências não encontradas:

```bash
npm install
```

### Erro de tipos TypeScript

Execute:

```bash
npm run build
```

Para verificar erros de tipo.

## 📦 Deploy

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

### Vercel

1. Conecte seu repositório GitHub
2. Configure o build command: `npm run build`
3. Configure o output directory: `dist`
4. Deploy automático

### Netlify

1. Conecte seu repositório
2. Build command: `npm run build`
3. Publish directory: `dist`

### Servidor Estático

Copie a pasta `dist/` para seu servidor web.

## 📄 Licença

Este projeto está sob a licença MIT.

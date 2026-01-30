# SortMailBox

**Classificação automática de e-mails com IA** — identifique em segundos se a mensagem exige ação ou é apenas cortesia.

---

## O que é

O **SortMailBox** analisa o conteúdo do e-mail (texto ou arquivo) e classifica em:

| Categoria      | Descrição                                              |
|----------------|--------------------------------------------------------|
| **Produtivo**  | Requer ação ou resposta (perguntas, solicitações, pedidos) |
| **Improdutivo**| Apenas cortesia (cumprimentos, agradecimentos, felicitações) |

Além da classificação, o sistema sugere uma resposta pronta para o e-mail.

---

## Como funciona

1. **Você envia** o texto do e-mail ou faz upload de um arquivo (.txt ou .pdf).
2. **A IA analisa** o conteúdo usando classificação zero-shot (Hugging Face).
3. **O resultado** mostra a categoria, o nível de confiança e uma resposta sugerida.

Sem API key configurada, o sistema usa classificação por palavras-chave (fallback), mantendo o uso básico.

---

## Stack

| Camada    | Tecnologias |
|-----------|-------------|
| **Backend**  | Python 3.9+, FastAPI, Uvicorn, Hugging Face Inference API, Pydantic, HTTPX |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Query, React Hook Form |

---

## Estrutura do projeto

```
SortMailBox/
├── backend/          
│   ├── app/
│   │   ├── config/   
│   │   ├── controllers/
│   │   ├── services/
│   │   └── ...
│   ├── main.py
│   └── requirements.txt
├── frontend/         
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── services/
│   └── package.json
└── README.md
```

---

## Executando a aplicação localmente

Siga os passos abaixo para rodar o SortMailBox no seu computador. É necessário subir **primeiro o backend** e depois o **frontend**.

### Pré-requisitos

- **Python 3.9 ou superior** — [python.org](https://www.python.org/downloads/)
- **Node.js 18 ou superior** — [nodejs.org](https://nodejs.org/)
- **Chave da API Hugging Face** (opcional) — [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — sem ela o sistema usa classificação por palavras-chave

---

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd SortMailBox
```

---

### 2. Subir o backend (API)

Abra um terminal na pasta do projeto e execute:

**2.1. Entrar na pasta do backend**
```bash
cd backend
```

**2.2. Criar e ativar o ambiente virtual**

No **Windows (PowerShell ou CMD):**
```bash
python -m venv .venv
.venv\Scripts\activate
```

No **Linux ou macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**2.3. Instalar as dependências**
```bash
pip install -r requirements.txt
```

**2.4. Configurar variáveis de ambiente**

Copie o arquivo de exemplo e edite o `.env`:
```bash
cp .env.example .env
```

Abra o arquivo `.env` e defina pelo menos:
- `HUGGINGFACE_API_KEY=hf_sua_chave_aqui` (opcional; sem ela usa fallback)
- `CORS_ORIGINS=http://localhost:5173` (para o frontend acessar a API)

**2.5. Iniciar o servidor**
```bash
python main.py
```

O backend estará rodando em **http://localhost:8000**.  
Documentação da API: **http://localhost:8000/docs**.

**Deixe este terminal aberto** com o backend rodando.

---

### 3. Subir o frontend (interface)

Abra **outro terminal** na pasta do projeto (raiz do repositório) e execute:

**3.1. Entrar na pasta do frontend**
```bash
cd frontend
```

**3.2. Instalar as dependências**
```bash
npm install
```

**3.3. Iniciar o servidor de desenvolvimento**
```bash
npm run dev
```

O frontend estará disponível em **http://localhost:5173** (ou na porta que o Vite indicar no terminal).

---

### 4. Usar a aplicação

1. Acesse **http://localhost:5173** no navegador.
2. Digite ou cole o conteúdo de um e-mail (ou faça upload de um arquivo .txt ou .pdf).
3. Clique em **Classificar Email** e veja o resultado (Produtivo/Improdutivo) e a resposta sugerida.

**Resumo:** Backend em `http://localhost:8000` e frontend em `http://localhost:5173`. Os dois precisam estar rodando ao mesmo tempo.

---

### Variáveis de ambiente (backend)

| Variável               | Obrigatória | Descrição |
|------------------------|------------|-----------|
| `HUGGINGFACE_API_KEY`  | Não*       | Token da API Hugging Face (sem ela, usa fallback por palavras-chave) |
| `CLASSIFICATION_MODEL` | Não        | Modelo de classificação (padrão: `MoritzLaurer/deberta-v3-large-zeroshot-v2.0`) |
| `CORS_ORIGINS`         | Não        | Origens permitidas (ex.: `http://localhost:5173`) |

\*Recomendado para melhor precisão da classificação.

---

## API

| Método | Endpoint           | Descrição |
|--------|--------------------|-----------|
| `POST` | `/api/email/classify`      | Classifica e-mail a partir de JSON (`content`, `subject` opcional) |
| `POST` | `/api/email/classify/upload` | Classifica e-mail a partir de arquivo (.txt ou .pdf) |

Resposta: categoria (`Produtivo`/`Improdutivo`), confiança (0–1) e resposta sugerida.


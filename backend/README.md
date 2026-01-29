# SortMailBox Backend

API REST desenvolvida em Python/FastAPI para classificação automática de emails usando Inteligência Artificial. O sistema analisa o conteúdo de emails e os classifica como "Produtivo" (requer ação) ou "Improdutivo" (sem necessidade de ação), além de gerar respostas sugeridas automaticamente.

## 🚀 Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **Uvicorn** - Servidor ASGI de alta performance
- **Hugging Face API** - Modelos de NLP para classificação e geração de texto
- **PyPDF2** - Processamento de arquivos PDF
- **Pydantic** - Validação de dados e configurações
- **HTTPX** - Cliente HTTP assíncrono

## 📋 Pré-requisitos

- Python 3.9 ou superior
- pip (gerenciador de pacotes Python)
- Chave de API do Hugging Face (opcional, mas recomendado)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd SortMailBox-backend
```

### 2. Crie um ambiente virtual

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
HUGGINGFACE_API_KEY=sua_chave_api_aqui
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ENVIRONMENT=development
DEBUG=true
```

**Nota:** Se não fornecer a chave da API do Hugging Face, o sistema utilizará um método de classificação baseado em palavras-chave (fallback).

## ▶️ Executando a Aplicação

### Modo de Desenvolvimento

```bash
python main.py
```

A API estará disponível em: **http://localhost:8000**

### Modo de Produção

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI (Interativo):** http://localhost:8000/docs
- **ReDoc (Alternativa):** http://localhost:8000/redoc

## 🔌 Endpoints

### `POST /api/v1/classify`

Classifica um email a partir de texto.

**Request Body:**
```json
{
  "content": "Olá, gostaria de saber o status da minha solicitação #12345.",
  "subject": "Status da solicitação"
}
```

**Response:**
```json
{
  "category": "Produtivo",
  "confidence": 0.95,
  "suggested_response": "Prezado(a), agradecemos seu contato...",
  "original_content": "Olá, gostaria de saber o status...",
  "processed_at": "2024-01-15T10:30:00"
}
```

### `POST /api/v1/classify/upload`

Classifica um email a partir de arquivo (.txt ou .pdf).

**Form Data:**
- `file` (obrigatório): Arquivo do email (.txt ou .pdf)
- `subject` (opcional): Assunto do email

**Response:** Mesmo formato do endpoint `/classify`

### `GET /health`

Verifica o status da API.

**Response:**
```json
{
  "status": "healthy",
  "message": "SortMailBox API is running"
}
```

## Estrutura do Projeto

```
SortMailBox-backend/
├── app/
│   ├── __init__.py              
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py           
│   ├── controllers/
│   │   ├── __init__.py
│   │   └── email_controller.py   
│   ├── services/
│   │   ├── __init__.py
│   │   ├── email_service.py      
│   │   └── ai_service.py        
│   ├── repositories/
│   │   ├── __init__.py
│   │   └── email_repository.py   
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py            
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── file_processor.py     
│   │   └── text_processor.py     
│   └── entities/
│       ├── __init__.py
│       └── email_entity.py        
├── main.py                       
├── requirements.txt              
├── Dockerfile                    
├── .env.example                  
└── README.md                     
```

## Arquitetura

O projeto segue uma arquitetura em camadas:

```
Endpoint (Controller) → Service (Regras de Negócio) → Repository (Acesso a Dados)
```

- **Controllers:** Recebem requisições HTTP e retornam respostas
- **Services:** Contêm a lógica de negócio e orquestram as operações
- **Repositories:** Gerenciam o acesso e persistência de dados
- **Utils:** Funções auxiliares para processamento de arquivos e texto

## 🧪 Testando a API

### Usando cURL

**Classificar por texto:**
```bash
curl -X POST "http://localhost:8000/api/v1/classify" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Olá, preciso de ajuda com minha conta.",
    "subject": "Suporte"
  }'
```

**Classificar por arquivo:**
```bash
curl -X POST "http://localhost:8000/api/v1/classify/upload" \
  -F "file=@email.txt" \
  -F "subject=Assunto do email"
```

## 🐳 Docker

Para executar com Docker:

```bash
docker build -t sortmailbox-backend .
docker run -p 8000:8000 --env-file .env sortmailbox-backend
```

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---------|-----------|--------|
| `HUGGINGFACE_API_KEY` | Chave da API do Hugging Face | "" |
| `CORS_ORIGINS` | Origens permitidas para CORS | "http://localhost:3000" |
| `ENVIRONMENT` | Ambiente de execução | "development" |
| `DEBUG` | Modo debug | true |

## 📝 Notas Importantes

- O sistema funciona sem a chave da API do Hugging Face, utilizando um método de fallback baseado em palavras-chave
- Para melhor precisão, recomenda-se usar a API do Hugging Face
- Os arquivos enviados são processados em memória e não são armazenados
- O tamanho máximo recomendado de arquivo é 10MB


## 📄 Licença

Este projeto está sob a licença MIT.



# Code Lens — AI-Powered Code Review Assistant

A full-stack application that lets developers upload source code and receive structured AI-generated code reviews. Supports configurable OpenAI-compatible providers (OpenAI, LM Studio, Ollama, OpenRouter).

## Features

- **Authentication** — Register, login, logout with JWT-protected routes
- **Project Management** — Create, view, and delete code review projects
- **Code Upload** — ZIP upload, drag-and-drop files/folders, GitHub repository import
- **Code Explorer** — File tree with syntax-highlighted preview
- **AI Review Engine** — Review single files, multiple files, or entire projects
- **Review Templates** — Security, Performance, Code Quality (+ Documentation & Architecture bonus)
- **Review History** — View, search, and inspect past reviews with severity levels
- **AI Chat** — Ask questions about uploaded code with project context
- **Configurable AI Providers** — Per-user provider settings (base URL, API key, model)

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend  | NestJS, TypeORM                     |
| Database | PostgreSQL                          |
| AI       | OpenAI-compatible Chat Completions  |

## Prerequisites

- Node.js 20+
- npm
- Docker (for PostgreSQL) or a local PostgreSQL instance

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

The API runs at `http://localhost:3001/api`.

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### 4. Configure AI Provider

1. Register an account at `http://localhost:3000/register`
2. Go to **AI Settings** and add a provider:
   - **OpenAI**: `https://api.openai.com/v1` + your API key + model (e.g. `gpt-4o-mini`)
   - **LM Studio**: `http://localhost:1234/v1` + model name from LM Studio
   - **Ollama**: `http://localhost:11434/v1` + model (e.g. `llama3`)

### 5. Create a Project & Upload Code

1. Create a project from the dashboard
2. Upload code via ZIP, drag-and-drop, or GitHub URL
3. Run a review or chat with your code

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Default              | Description                |
|----------------|----------------------|----------------------------|
| `PORT`         | `3001`               | API server port            |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin     |
| `JWT_SECRET`   | —                    | JWT signing secret         |
| `DB_HOST`      | `localhost`          | PostgreSQL host            |
| `DB_PORT`      | `5432`               | PostgreSQL port            |
| `DB_USER`      | `codelens`           | Database user              |
| `DB_PASSWORD`  | `codelens`           | Database password          |
| `DB_NAME`      | `codelens`           | Database name              |
| `NODE_ENV`     | `development`        | Set `production` to disable schema sync |

### Frontend (`frontend/.env.local`)

| Variable              | Default                      | Description |
|-----------------------|------------------------------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api`  | Backend API base URL |

## Database Setup

PostgreSQL is provisioned via Docker Compose with:

- User: `codelens`
- Password: `codelens`
- Database: `codelens`
- Port: `5432`

TypeORM auto-syncs the schema in development. Tables: `users`, `projects`, `files`, `reviews`, `ai_providers`, `chat_sessions`, `chat_messages`.

## Architecture Overview

```
┌─────────────┐     REST/JWT      ┌─────────────┐     SQL      ┌────────────┐
│  Next.js    │ ◄──────────────► │   NestJS    │ ◄──────────► │ PostgreSQL │
│  Frontend   │                  │   Backend   │              │            │
└─────────────┘                  └──────┬──────┘              └────────────┘
                                        │
                                        │ OpenAI-compatible
                                        ▼
                               ┌─────────────────┐
                               │ OpenAI / LM     │
                               │ Studio / Ollama │
                               └─────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.

## API Endpoints

| Method | Endpoint                              | Description          |
|--------|---------------------------------------|----------------------|
| POST   | `/api/auth/register`                  | Register user        |
| POST   | `/api/auth/login`                     | Login                |
| GET    | `/api/auth/me`                        | Current user         |
| CRUD   | `/api/projects`                       | Project management   |
| POST   | `/api/projects/:id/files/upload/zip`  | ZIP upload           |
| POST   | `/api/projects/:id/files/upload`     | Multi-file upload    |
| POST   | `/api/projects/:id/files/import/github` | GitHub import     |
| GET    | `/api/projects/:id/files/tree`        | File tree            |
| GET    | `/api/projects/:id/files/content`     | File content         |
| POST   | `/api/projects/:id/reviews`           | Run AI review        |
| GET    | `/api/projects/:id/reviews`           | List/search reviews  |
| POST   | `/api/projects/:id/chat`              | Chat with code       |
| CRUD   | `/api/ai-providers`                   | AI provider config   |

## Project Structure

```
code-lens/
├── frontend/          # Next.js application
├── backend/           # NestJS API
├── docker-compose.yml # PostgreSQL
├── README.md
├── ARCHITECTURE.md
└── AI_USAGE.md
```

## Security Notes

- Never commit `.env` files or API keys
- JWT tokens stored in `localStorage` (suitable for assessment; use httpOnly cookies in production)
- File uploads filtered to text-based source files; size limits enforced
- GitHub import supports public repositories only

## License

MIT — see [LICENSE](./LICENSE)

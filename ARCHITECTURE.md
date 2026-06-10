# Architecture

## System Overview

Code Lens is a monorepo with a Next.js frontend and NestJS backend communicating over a REST API. PostgreSQL stores user data, projects, uploaded file contents, review results, and chat history. AI inference is delegated to user-configured OpenAI-compatible endpoints.

```
User Browser
    │
    ▼
Next.js (App Router, Client Components)
    │  axios + JWT Bearer token
    ▼
NestJS API (Global prefix: /api)
    ├── AuthModule      → JWT strategy, bcrypt passwords
    ├── ProjectsModule  → CRUD, user-scoped
    ├── FilesModule     → Upload, tree, content, GitHub import
    ├── ReviewsModule   → AI review orchestration
    ├── ChatModule      → Contextual Q&A
    └── AiProvidersModule → Per-user provider config
    │
    ├── PostgreSQL (TypeORM entities)
    └── External AI API (OpenAI-compatible /chat/completions)
```

## Frontend Architecture

### Stack

- **Next.js 16** with App Router
- **TypeScript** throughout
- **Tailwind CSS v4** for styling
- **Client-side auth** via React Context (`AuthProvider`)

### Key Design Decisions

1. **Client-side rendering for app pages** — All authenticated pages use `'use client'` for simplicity. Auth state lives in React Context with JWT in `localStorage`.

2. **Protected routes** — `ProtectedRoute` wrapper redirects unauthenticated users to `/login`.

3. **API client** — Centralized `api.ts` with axios interceptors attaching JWT tokens.

4. **Component structure**:
   - `AppShell` — Sidebar navigation layout
   - `FileTree` — Recursive tree renderer
   - `CodeViewer` — Syntax highlighting via `react-syntax-highlighter`
   - `UploadPanel` — Tabbed upload (drag-drop, ZIP, GitHub)
   - `ReviewPanel` — Template selection and review display
   - `ChatPanel` — Conversational interface

5. **Project workspace tabs** — Single project page with tabbed views (Explorer, Upload, Review, History, Chat) to keep navigation shallow.

### Routing

| Route              | Purpose                    |
|--------------------|----------------------------|
| `/`                | Redirect to dashboard/login |
| `/login`           | Authentication             |
| `/register`        | Registration               |
| `/dashboard`       | Project list               |
| `/projects/[id]`   | Project workspace          |
| `/settings`        | AI provider configuration  |

## Backend Architecture

### Stack

- **NestJS** modular architecture
- **TypeORM** with PostgreSQL
- **Passport JWT** for authentication
- **class-validator** for DTO validation

### Module Breakdown

| Module            | Responsibility                                      |
|-------------------|-----------------------------------------------------|
| `AuthModule`      | Register, login, JWT issuance, `/auth/me`         |
| `ProjectsModule`  | User-scoped project CRUD                          |
| `FilesModule`     | File ingestion, tree building, content retrieval   |
| `ReviewsModule`   | Review creation, history, search                  |
| `ChatModule`      | Session management, contextual chat               |
| `AiProvidersModule` | CRUD for user AI provider configs               |
| `AiModule`        | OpenAI-compatible API client, prompt templates    |

### File Processing Pipeline

1. **ZIP Upload** — `adm-zip` extracts entries, filters by extension and path
2. **Drag & Drop** — Multer receives files with relative paths
3. **GitHub Import** — GitHub API fetches tree recursively, downloads blobs

All paths skip `node_modules`, `.git`, build artifacts, and dotfiles. Content stored in PostgreSQL `files` table (suitable for assessment scale; object storage preferred at production scale).

### Authorization Model

- All endpoints except `/auth/register` and `/auth/login` require JWT
- Resource access scoped by `userId` — projects, files, reviews, and providers belong to the authenticated user
- JWT payload: `{ sub: userId, email }`

## Database Design

### Entity Relationship Diagram

```
users
  ├── projects (1:N)
  │     ├── files (1:N)
  │     ├── reviews (1:N)
  │     └── chat_sessions (1:N)
  │           └── chat_messages (1:N)
  └── ai_providers (1:N)
```

### Tables

**users**
- `id` (UUID), `email` (unique), `passwordHash`, `name`, `createdAt`

**projects**
- `id`, `userId` (FK), `name`, `description`, `createdAt`

**files**
- `id`, `projectId` (FK), `path`, `name`, `parentPath`, `isDirectory`, `content`, `mimeType`, `size`, `createdAt`

**reviews**
- `id`, `projectId` (FK), `title`, `template`, `targetFiles[]`, `summary`, `issues` (JSONB), `recommendations` (JSONB), `rawResponse`, `createdAt`

**ai_providers**
- `id`, `userId` (FK), `name`, `baseUrl`, `apiKey`, `modelName`, `isDefault`, `createdAt`

**chat_sessions**
- `id`, `projectId` (FK), `title`, `createdAt`

**chat_messages**
- `id`, `sessionId` (FK), `role`, `content`, `createdAt`

### Design Rationale

- **File content in DB** — Simplifies deployment for assessment; no separate blob storage needed
- **JSONB for review issues** — Flexible schema for structured AI output without rigid normalization
- **Per-user AI providers** — Supports different models/API keys without environment hardcoding

## AI Integration Flow

### Review Flow

```
1. User selects template + scope (file/files/project)
2. ReviewsService loads code context from FilesService
3. AiService builds system prompt from template
4. POST to {baseUrl}/chat/completions with code context
5. Response parsed as JSON (summary, issues, recommendations)
6. Review entity saved to database
```

### Chat Flow

```
1. User sends message (optionally continuing a session)
2. FilesService builds code context (up to 50K chars)
3. Recent chat history included (last 6 messages)
4. AiService calls chat completions API
5. User + assistant messages persisted
```

### Prompt Templates

| Template        | Focus Areas                                    |
|-----------------|------------------------------------------------|
| `security`      | Credentials, auth, injection, validation       |
| `performance`   | Slow ops, queries, rendering, caching          |
| `code_quality`  | Naming, structure, readability, DRY            |
| `documentation` | README, setup guide, API docs (bonus)          |
| `architecture`  | System overview, components, data flow (bonus) |

### Provider Abstraction

All providers use the OpenAI Chat Completions format:

```json
POST {baseUrl}/chat/completions
{
  "model": "{modelName}",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

This single interface supports OpenAI, LM Studio, Ollama, and OpenRouter without provider-specific code paths.

## Scalability Considerations

For production beyond this assessment:

- Move file storage to S3/MinIO with content-addressable paths
- Add Redis for session caching and rate limiting
- Queue AI requests (Bull/BullMQ) for long-running reviews
- Use httpOnly cookie-based JWT instead of localStorage
- Add embedding-based retrieval for large codebases instead of raw context truncation
- Enable TypeORM migrations instead of `synchronize`

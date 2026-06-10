# AI Usage Report

This document discloses how AI tools were used during the development of Code Lens, per the assessment requirements.

## AI Tools Used

| Tool    | Purpose                                           |
|---------|---------------------------------------------------|
| Cursor  | Primary development environment and AI assistant  |
| Claude  | Architecture planning, code generation, debugging |

## Prompts Used

### Project Scaffolding

- "Build a full-stack AI Code Review Assistant with Next.js frontend, NestJS backend, PostgreSQL, JWT auth, file upload, AI reviews, and chat"
- Used to generate initial project structure, entity definitions, and module layout

### Backend Implementation

- "Create NestJS modules for auth, projects, files, reviews, chat with TypeORM entities"
- "Implement OpenAI-compatible AI service with configurable providers and review prompt templates"
- "Add ZIP upload, drag-drop, and GitHub repository import with file filtering"

### Frontend Implementation

- "Build Next.js pages for login, dashboard, project workspace with file tree, code viewer, review panel, and chat"
- "Create dark-themed UI with Tailwind CSS for a code review tool"

### Documentation

- "Write README.md with setup instructions, ARCHITECTURE.md with system design, and AI_USAGE.md disclosure"

## Generated Code

The following were primarily AI-generated with human review and modification:

- **Backend entities** (`backend/src/entities/`) — TypeORM entity definitions
- **Backend modules** (`backend/src/auth/`, `projects/`, `files/`, `reviews/`, `chat/`, `ai/`, `ai-providers/`) — Services, controllers, DTOs
- **Frontend lib** (`frontend/src/lib/`) — API client, auth context, types
- **Frontend components** (`frontend/src/components/`) — UI components
- **Frontend pages** (`frontend/src/app/`) — Route pages
- **Documentation** — README.md, ARCHITECTURE.md, AI_USAGE.md
- **Infrastructure** — docker-compose.yml, .env.example files, .gitignore

## Manually Written / Heavily Modified Code

- **Review prompt templates** (`backend/src/ai/ai.service.ts`) — Crafted specific security, performance, and quality review instructions
- **File filtering logic** (`backend/src/files/files.service.ts`) — Extension lists, skip directories, size limits tuned for practical use
- **Auth flow decisions** — JWT in localStorage with ProtectedRoute pattern
- **UI tab structure** — Project workspace organization (Explorer/Upload/Review/History/Chat)
- **Error handling** — AI response JSON parsing with fallback for unstructured responses

## Engineering Decisions

### Why NestJS + PostgreSQL?

- NestJS provides modular architecture with dependency injection, aligning with production backend patterns
- PostgreSQL offers relational integrity for user-project-file relationships and JSONB for flexible review data

### Why store files in the database?

- Eliminates need for separate object storage in a 3-day assessment
- Simplifies deployment to a single database + two Node processes
- Acceptable for text files under 1MB with a 500-file cap

### Why OpenAI-compatible API only?

- Single integration point covers OpenAI, LM Studio, Ollama, and OpenRouter
- Users configure providers in the UI — no hardcoded endpoints
- `/chat/completions` is the de facto standard for local and cloud models

### Why client-side auth?

- Faster to implement correctly for an SPA-style Next.js app
- Protected routes work via context without middleware complexity
- Noted as a production improvement area (httpOnly cookies)

### Why simple context retrieval for chat/reviews?

- Concatenating file contents is sufficient for small-to-medium projects
- Embedding-based RAG would add complexity beyond assessment scope
- Context truncated at 50K–80K characters to stay within model limits

### Bonus features included

- **Documentation Generator** — `documentation` review template
- **Architecture Analysis** — `architecture` review template

These reuse the same review pipeline with different prompt templates rather than separate systems, keeping the codebase maintainable.

## Understanding Statement

All submitted code has been reviewed and understood. Key areas the author can explain in an interview:

- JWT authentication flow and user-scoped resource access
- File upload pipeline and GitHub API integration
- AI provider abstraction and prompt engineering for structured JSON output
- Database schema design and entity relationships
- Frontend state management and API integration patterns

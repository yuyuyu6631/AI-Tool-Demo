# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Highest Priority: Final Experience First

This project is developed with the final user-facing experience as the highest priority.

Code, documentation, tests, architecture, and historical implementation are tools for delivering the intended product experience. They must not become reasons to block a reasonable improvement to the final user-visible result.

When the intended final experience, existing code, existing documentation, and existing tests conflict:

1. Prioritize the intended final user-facing experience.
2. Change the implementation to match that experience.
3. Update tests when they encode outdated behavior.
4. Update documentation after the implementation reflects the intended experience.
5. If the current code structure blocks the target experience, refactor within the smallest safe scope.
6. If the target experience is unclear, clarify or define a verifiable effect before implementation.

Read `doc/00-最终效果约束.md` before product, UI, feature, or documentation work. `docs/current-implementation-baseline.md` describes the current implementation; it is not a product ceiling.

## Overview
cl
Xingdianping (星点评) is an AI Tool Review & Discovery Platform - "Douban/Public Reviews for AI Agents" - helps users discover, compare, and get recommendations for AI tools. It's a clean monorepo with a FastAPI backend and Next.js frontend.

## Technology Stack

- **Backend**: FastAPI 0.115+, Python 3.11+, SQLAlchemy 2.0, Alembic, Pydantic, PyMySQL, Redis
- **Frontend**: Next.js 15.2+, React 19, TypeScript 5.8+, Tailwind CSS 4.1+, Vitest, React Testing Library
- **Database**: MySQL 8.4 (Docker), Redis 7.4 (Docker)
- **Infrastructure**: Docker Compose for local development

## Common Commands

### One-click Development Startup (Recommended)
```bash
npm start                    # Start local dev stack (API + Web)
npm run stop                 # Stop the local dev stack
npm run restart              # Restart the local dev stack
npm run start:legacy         # Legacy path: python start.py
```

### Frontend Development
```bash
npm run dev              # Start frontend dev server only, auto-picking the next free port if 3000 is busy
npm run build:web        # Build frontend for production
npm run lint:web         # Run ESLint
npm run test:web         # Run Vitest unit tests
npm run test:web:watch   # Run tests in watch mode
```

### Backend Development
```bash
# From apps/api directory
pytest                   # Run all pytest tests
pytest tests/test_file.py  # Run single test file
alembic upgrade head    # Run database migrations
```

### Data Import Scripts
```bash
npm run organize:aitool         # Organize AI tool assets
npm run validate:aitool:preview # Validate preview imports
npm run import:aitool:preview   # Import preview data
npm run import:aitool:all       # Import all AI tool data
```

## Project Structure

```
apps/
├─ api/                    # FastAPI backend
│  ├─ app/api/routes/      # API endpoints (auth, catalog, recommend, crawl)
│  ├─ app/core/            # Configuration
│  ├─ app/db/              # Database connection
│  ├─ app/models/          # SQLAlchemy ORM models
│  ├─ app/schemas/         # Pydantic schemas
│  ├─ app/services/        # Business logic layer
│  ├─ app/scripts/         # Data import/organization scripts
│  ├─ tests/               # pytest API tests
│  └─ alembic/             # Database migrations
└─ web/                    # Next.js frontend
   ├─ app/                 # Next.js App Router entry
   ├─ public/              # Static assets
   ├─ src/app/components/  # Reusable React components
   ├─ src/app/pages/       # Page components
   ├─ src/app/**/__tests__ # Unit tests (per-component/per-page)
   ├─ src/compat/          # Compatibility layer
   ├─ src/data/            # Fallback/static data
   └─ src/styles/          # Global CSS/theme

packages/
└─ contracts/              # Shared TypeScript types (frontend/backend)

infra/
├─ docker/                 # Docker Compose configuration
└─ sql/                    # Database initialization scripts

doc/                       # Product documentation (Chinese)
goal/                     # Product vision & roadmap
archive/drawer/           # Legacy archived code - NOT part of active runtime
```

## Architecture

### Backend Architecture
- **Clean分层**: Routes (API layer) → Services (business logic) → Models (data layer)
- **ORM**: SQLAlchemy 2.0 declarative base with async support
- **Authentication**: Session-based authentication with cookies, bcrypt password hashing
- **AI Integration**: Multiple provider support (OpenAI-compatible, Anthropic-compatible, custom, stub)
- **Caching**: Redis for caching AI tool data and recommendations

### Frontend Architecture
- **Next.js App Router** with React Server Components
- **Styling**: Tailwind CSS v4 with PostCSS
- **Type Sharing**: Shared TypeScript contracts via packages/contracts to ensure type consistency with backend
- **Testing**: Vitest unit tests for pages/components, Playwright for E2E

### Key Files

- `apps/api/app/main.py` - Backend entry point, FastAPI app creation
- `apps/api/app/core/config.py` - Backend configuration
- `apps/api/app/models/models.py` - All SQLAlchemy models defined here
- `apps/web/app/layout.tsx` - Root layout
- `dev.ps1` / `dev-stop.ps1` - Standard local dev startup and stop scripts
- `start.py` - Legacy startup script kept only for compatibility
- `infra/docker/docker-compose.yml` - Local development services (MySQL, Redis)

## Important Archiving Policy

This project actively cleans up the runtime path:
- **Active runtime only includes**: `apps/api` and `apps/web`
- **Legacy/demo code** is moved to `archive/drawer/` and does NOT participate in build/run/test
- **Do not modify** or reference archived code in new development - it's kept only for reference
- This keeps the working tree clean and avoids confusion

## Documentation and Baseline Policy

- Product and UI work starts from the intended final effect, then checks code and docs for implementation details.
- `doc/00-最终效果约束.md` is the highest product-effect constraint for AI development.
- `docs/current-implementation-baseline.md` is an automatically generated snapshot of current routes, APIs, models, and tests.
- If docs and code disagree about the current implementation, inspect code and refresh docs.
- If current implementation and target effect disagree, implement the target effect and then update docs/tests to match.
- Do not treat old docs, old tests, or current code shape as hard limits on product improvement.

## Configuration

- **Environment**: `.env` file auto-created from `.env.example` on first run
- **AI Credentials**: Can be provided via a *user-created* `秘钥.txt` file (not committed to git) - start script auto-parses:
  - First line: model name
  - Auto-detects base URLs and API keys from the file content
- **Ports**: Start script automatically finds available ports if 8000/3000 are in use
- **CORS**: Backend configured to allow CORS from `localhost:3000` for development

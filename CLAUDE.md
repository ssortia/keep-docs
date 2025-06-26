# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Правила работы. ВАЖНО. ВСЕДА ПОЛЬЗУЙСЯ ИМИ.
- Кратко описывай все изменения, которые предлагаешь внести
- Запоминай в какой папке ты сейчас находишься
- Пиши комментарии ТОЛЬКО в тех местах, где они ОЧЕНЬ СИЛЬНО необходимы. И пиши их на РУССКОМ языке

## Project Architecture

This is a full-stack monorepo template featuring:

### Structure
- **Monorepo**: Managed with Turborepo and npm workspaces
- **Backend**: AdonisJS 6 with TypeScript (apps/server)
- **Frontend**: Next.js 15 with React 19 (apps/client)
- **Database**: PostgreSQL with Lucid ORM
- **Authentication**: JWT + OAuth (GitHub) support

### Backend (AdonisJS)
**Core Components:**
- **Controllers**: Handle HTTP requests (`app/controllers/`)
- **Models**: Lucid ORM models with decorators (`app/models/`)
- **Services**: Business logic layer (`app/services/`)
- **Repositories**: Data access abstraction (`app/repositories/`)
- **Middleware**: Request/response processing (`app/middleware/`)
- **Validators**: Input validation with VineJS (`app/validators/`)

**Key Features:**
- Role-based permission system (User → Role → Permissions)
- OAuth integration with GitHub
- Email verification system
- Audit logging for all actions
- System monitoring endpoints
- Auto-generated Swagger documentation

**Database Schema:**
- Users (with roles, OAuth, email verification)
- Roles and Permissions (many-to-many)
- Access Tokens (JWT)
- Audit Logs (comprehensive tracking)

### Frontend (Next.js)
**Structure:**
- **App Router**: Modern Next.js routing (`app/`)
- **Components**: Reusable UI components with Ant Design
- **Hooks**: Custom React hooks for API integration
- **Services**: API client and HTTP utilities
- **Schemas**: Zod validation schemas
- **Types**: TypeScript type definitions

**Key Features:**
- Admin panel with user/role/permission management
- Authentication flows (login, register, OAuth)
- Audit log viewer
- System monitoring dashboard
- Dark/light theme support
- Form handling with react-hook-form + Zod

### Integration
- **API Communication**: RESTful JSON API between client/server
- **Authentication**: JWT tokens with automatic refresh
- **Permissions**: Frontend route protection based on user roles
- **Real-time**: Admin dashboard with system status monitoring

## Commands
- **Build**: `npm run build` (all apps) or `cd apps/[app] && npm run build` (specific app)
- **Lint**: `npm run lint` or `cd apps/server && npm run lint`
- **Format**: `cd apps/server && npm run format`
- **Type Check**: `cd apps/server && npm run typecheck`
- **Dev**: `npm run dev` (all apps) or `cd apps/[app] && npm run dev` (specific app)
- **Test**: `cd apps/server && npm run test`
- **Single Test**: `cd apps/server && node ace test tests/path/to/test.ts`

## Code Style Guidelines
- **Server (AdonisJS)**:
  - Follow AdonisJS conventions with decorators for models
  - Use imports from `@adonisjs/*` namespaces
  - Error handling follows AdonisJS exceptions system
  - For import paths, use the `#` alias system defined in package.json
  - Type definitions should use TypeScript's `declare` syntax
  
- **Client (Next.js)**:
  - Use Next.js conventions with React 19 syntax
  - Use strict TypeScript mode for type safety
  - Import aliases start with `@/` pointing to root

This is a monorepo with AdonisJS (backend) and Next.js (frontend) managed with Turborepo.
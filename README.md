# AdonisJS + Next.js Template

A full-stack template featuring **AdonisJS** (backend) and **Next.js** (frontend) with authentication, role-based permissions, and user management. Built with TypeScript and managed as a monorepo using Turborepo.

## 🚀 Features

### Backend (AdonisJS)
- **Authentication & Authorization**: JWT-based auth with email verification
- **Role-Based Access Control (RBAC)**: Users, roles, and permissions system
- **User Management**: Complete CRUD operations with role assignment
- **Email Verification**: Email-based account verification workflow
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Database**: PostgreSQL with Lucid ORM migrations and seeders
- **Validation**: Request validation using VineJS
- **Testing**: Japa test framework with API client support

### Frontend (Next.js)
- **React 19**: Latest React with modern features
- **TypeScript**: Strict type safety throughout
- **Ant Design**: Beautiful and comprehensive UI components
- **Form Management**: React Hook Form with Zod validation
- **Theme Support**: Dark/light theme with system preference detection
- **Responsive Design**: Mobile-friendly UI components
- **Authentication UI**: Login, register, and email verification pages

### DevOps & Development
- **Docker**: Multi-service development environment
- **Turborepo**: Monorepo management with optimized builds
- **ESLint + Prettier**: Code formatting and linting
- **Hot Reload**: Development servers with HMR support
- **PostgreSQL**: Containerized database with health checks

## 📁 Project Structure

```
adonisjs-nextjs-template/
├── apps/
│   ├── client/          # Next.js frontend
│   │   ├── app/         # App Router pages and components
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── services/    # API service layer
│   │   └── types/       # TypeScript type definitions
│   └── server/          # AdonisJS backend
│       ├── app/         # Application logic
│       │   ├── controllers/  # HTTP request handlers
│       │   ├── middleware/   # Request middleware
│       │   ├── models/       # Database models
│       │   ├── services/     # Business logic services
│       │   └── validators/   # Request validation
│       ├── config/      # Configuration files
│       ├── database/    # Migrations and seeders
│       └── start/       # Application bootstrap
├── docker-compose.yaml  # Development environment
├── turbo.json          # Turborepo configuration
└── package.json        # Workspace dependencies
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 22+ and npm
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone adonisjs-nextjs-template>
cd adonisjs-nextjs-template
```

### 2. Environment Setup
Create environment files for the server:

```bash
# Copy example env file (you'll need to create this based on start/env.ts)
cp apps/server/.env.example apps/server/.env
```

Configure your environment variables.

### 3. Development with Docker
```bash
# Start all services (PostgreSQL, Server, Client, Swagger UI)
docker compose up

# Or run in background
docker compose up -d
```

Services will be available at:
- **Frontend**: http://localhost:3030
- **Backend API**: http://localhost:3333
- **Swagger Documentation**: http://localhost:8080
- **PostgreSQL**: localhost:5440


# Run migrations and seeders
```bash
docker compose exec server node ace migration:run
docker compose exec server node ace db:seed
```

### 4. Local Development (Alternative)
```bash
# Install dependencies
npm install

# Start PostgreSQL only
docker compose up postgres -d

# Run migrations and seeders
cd apps/server
npm run build
node ace migration:run
node ace db:seed

# Start development servers
npm run dev
```

### 5. Запуск тестов
```bash
docker compose -f docker-compose.yaml -f docker-compose.test.yaml up --exit-code-from server_test
```

## 📚 Available Scripts

### Root Level
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all applications
- `npm run lint` - Lint all workspaces
- `npm run test` - Run tests across all apps
- `npm run ace` - Access AdonisJS CLI commands

### Server (AdonisJS)
```bash
cd apps/server

# Development
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
node ace migration:run     # Run migrations
node ace migration:rollback # Rollback migrations
node ace db:seed          # Run database seeders

# Code Quality
npm run lint         # ESLint check
npm run format       # Prettier format
npm run typecheck    # TypeScript check
npm run test         # Run tests
```

### Client (Next.js)
```bash
cd apps/client

# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # ESLint check
npm run format       # Prettier format
```

## 🔧 API Endpoints

Visit http://localhost:8080 for complete API documentation via Swagger UI.

## 🔒 Authentication & Permissions

The template includes a complete RBAC system:

### User Roles
- **Admin**: Full system access
- **User**: Basic user permissions
- **Moderator**: Limited administrative access

### Permissions
- User management (create, read, update, delete)
- Role management (create, read, update, delete)  
- Permission management (create, read, update, delete)

### Middleware Protection
- `auth`: Require authentication
- `role`: Require specific role
- `permission`: Require specific permission
- `blocked_user`: Block access for disabled users

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run server tests only
cd apps/server && npm run test

# Run specific test file
cd apps/server && node ace test tests/functional/auth.spec.ts
```

### Models
- **User**: User accounts with authentication
- **Role**: User roles for access control
- **Permission**: Granular permissions system
- **AccessToken**: JWT token management

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the [AdonisJS Documentation](https://docs.adonisjs.com)
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Open an issue in this repository

---

**Built with ❤️ using AdonisJS, Next.js, and modern web technologies.**
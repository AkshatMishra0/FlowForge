# FlowForge Development Guide

**Last Updated:** February 28, 2026  
**Version:** 1.0.0

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Architecture Overview](#architecture-overview)
4. [API Development](#api-development)
5. [Frontend Development](#frontend-development)
6. [Testing Guidelines](#testing-guidelines)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/flowforge.git
cd flowforge

# Install dependencies
make install
# or
npm install

# Setup environment
make setup
# or manually copy .env.example to .env and configure

# Setup database
make migrate
make seed

# Start development servers
make dev
```

### Environment Configuration

Copy `.env.example` to `.env` and configure the following required variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flowforge?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
```

See [.env.example](.env.example) for all available configuration options.

---

## Development Workflow

### Starting Services

```bash
# Start all services
make dev

# Or start individually
make backend-dev    # Backend API (Port 4000)
make web-dev        # Frontend (Port 3000)
make worker-dev     # Background worker
```

### Database Operations

```bash
# Create a new migration
cd apps/backend
npx prisma migrate dev --name your_migration_name

# Reset database
make migrate-reset

# Seed database
make seed

# Open Prisma Studio
make db-studio
```

### Code Quality

```bash
# Lint code
make lint

# Format code
make format

# Type check
make type-check

# Run all checks
make check
```

---

## Architecture Overview

### Project Structure

```
flowforge/
├── apps/
│   ├── backend/       # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── business/      # Business management
│   │   │   ├── lead/          # CRM/Lead management
│   │   │   ├── invoice/       # Invoicing
│   │   │   ├── booking/       # Booking system
│   │   │   ├── whatsapp/      # WhatsApp integration
│   │   │   ├── payment/       # Payment processing
│   │   │   ├── reports/       # Reporting & analytics
│   │   │   ├── health/        # Health checks
│   │   │   └── common/        # Shared utilities
│   │   └── prisma/
│   │       └── schema.prisma  # Database schema
│   ├── web/           # Next.js frontend
│   │   └── src/
│   │       ├── app/           # App router pages
│   │       ├── components/    # React components
│   │       ├── hooks/         # Custom hooks
│   │       └── lib/           # Utilities
│   └── worker/        # Background job processor
└── packages/          # Shared packages (if any)
```

### Tech Stack

**Backend:**
- NestJS - Framework
- Prisma - ORM
- PostgreSQL - Database
- Redis - Caching & sessions
- JWT - Authentication
- BullMQ - Job queue

**Frontend:**
- Next.js 14 - Framework
- React 18 - UI library
- TailwindCSS - Styling
- React Query - Data fetching

**DevOps:**
- Docker - Containerization
- Turborepo - Monorepo management
- PM2 - Process management

---

## API Development

### Creating a New Module

1. Generate module structure:
```bash
cd apps/backend
nest g module feature-name
nest g controller feature-name
nest g service feature-name
```

2. Create DTOs in `feature-name/dto/`:
```typescript
// create-feature.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

3. Implement service logic
4. Add controller endpoints with decorators
5. Register module in `app.module.ts`

### Authorization

Use guards and decorators for access control:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Role } from '../common/guards/roles.guard';
import { Permission } from '../common/guards/permissions.guard';

@Controller('protected')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ProtectedController {
  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permission.READ_LEADS)
  findAll() {
    // Only accessible by ADMIN or MANAGER with READ_LEADS permission
  }
}
```

### API Documentation

Use Swagger decorators:

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Features')
@Controller('features')
export class FeatureController {
  @Get()
  @ApiOperation({ summary: 'Get all features' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    // implementation
  }
}
```

Access Swagger docs at: `http://localhost:4000/api/docs`

---

## Frontend Development

### Creating Components

```typescript
// components/ui/feature.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FeatureProps {
  title: string;
  description?: string;
  className?: string;
}

export function Feature({ title, description, className }: FeatureProps) {
  return (
    <div className={cn('p-4 border rounded-lg', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}
```

### Custom Hooks

Available custom hooks in `src/hooks/`:

- `useAsync` - Handle async operations
- `useDebounce` - Debounce values
- `useLocalStorage` - Persist data locally
- `useMediaQuery` - Responsive breakpoints

Example:
```typescript
import { useAsync } from '@/hooks/useAsync';

function MyComponent() {
  const { data, loading, error, execute } = useAsync(fetchData);

  React.useEffect(() => {
    execute();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data}</div>;
}
```

### API Calls

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchLeads() {
  const response = await fetch(`${API_URL}/api/lead`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leads');
  }

  return response.json();
}
```

---

## Testing Guidelines

### Backend Unit Tests

```typescript
// feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureService } from './feature.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FeatureService', () => {
  let service: FeatureService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: PrismaService,
          useValue: {
            feature: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a feature', async () => {
    const dto = { name: 'Test Feature' };
    jest.spyOn(prisma.feature, 'create').mockResolvedValue(dto as any);

    const result = await service.create(dto);
    expect(result).toEqual(dto);
    expect(prisma.feature.create).toHaveBeenCalledWith({ data: dto });
  });
});
```

### Running Tests

```bash
# All tests
make test

# Watch mode
make test-watch

# Coverage
make test-cov

# Specific module
cd apps/backend
npm run test -- feature.service.spec.ts
```

---

## Deployment

### Production Build

```bash
# Build all applications
make prod-build

# Or individually
cd apps/backend && npm run build
cd apps/web && npm run build
cd apps/worker && npm run build
```

### Docker Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment Variables

Ensure all production environment variables are set:

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` and `NEXTAUTH_SECRET`
- Configure production database URL
- Enable rate limiting
- Set up error monitoring (Sentry)
- Configure CORS properly

---

## Troubleshooting

### Common Issues

**Database connection failures:**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Regenerate Prisma client
cd apps/backend && npx prisma generate
```

**Redis connection errors:**
```bash
# Check Redis is running
# Verify REDIS_URL in .env
redis-cli ping  # Should return PONG
```

**Port already in use:**
```bash
# Change PORT in .env
# Or kill process using the port (Windows):
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
make clean-all
make install
```

### Debug Mode

Enable debug logging:
```env
DEBUG=true
VERBOSE_LOGGING=true
LOG_LEVEL=debug
```

### Health Checks

Check application health:
```bash
# Basic health
curl http://localhost:4000/health

# Detailed health (includes services)
curl http://localhost:4000/health/detailed

# Health history
curl http://localhost:4000/health/history
```

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-org/flowforge/issues)
- Email: support@flowforge.com

---

**Happy Coding! 🚀**

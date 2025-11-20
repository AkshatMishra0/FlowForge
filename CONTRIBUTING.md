# Contributing to FlowForge

Thank you for your interest in contributing to FlowForge! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/AkshatMishra0/FlowForge/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing [Issues](https://github.com/AkshatMishra0/FlowForge/issues) for similar suggestions
2. Create a new issue with:
   - Clear feature description
   - Use case / problem it solves
   - Proposed implementation (if any)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable/function names
- Add comments for complex logic
- Format code with Prettier

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]
[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(invoice): add PDF export functionality
fix(auth): resolve token expiration issue
docs(api): update WhatsApp endpoint documentation
```

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

### Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## 🏗️ Project Structure

```
flowforge/
├── apps/
│   ├── backend/     # NestJS API
│   ├── web/         # Next.js frontend
│   └── worker/      # BullMQ workers
├── packages/        # Shared packages (future)
└── docs/           # Documentation
```

### Adding New Features

#### Backend (NestJS)

1. Create module in `apps/backend/src/`
2. Add controller, service, and DTOs
3. Update `app.module.ts`
4. Add API tests
5. Update Swagger docs

#### Frontend (Next.js)

1. Create page in `apps/web/src/app/`
2. Add components in `src/components/`
3. Update API client if needed
4. Add UI tests

#### Worker

1. Create worker in `apps/worker/src/workers/`
2. Register in `src/index.ts`
3. Add job processor tests

## 🧪 Testing Locally

```bash
# Install dependencies
npm install

# Set up environment
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env.local

# Start database
docker-compose up -d

# Run migrations
cd apps/backend && npm run db:migrate

# Start all services
npm run dev
```

## 📚 Documentation

- Update relevant `.md` files
- Add JSDoc comments to functions
- Update API.md for API changes
- Update INSTALLATION.md for setup changes

## ✅ Pull Request Checklist

Before submitting:

- [ ] Code follows project style
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] TypeScript compiles without errors
- [ ] Linter passes
- [ ] Feature tested locally

## 🔒 Security

- Never commit sensitive data (API keys, passwords)
- Use environment variables
- Report security issues privately to maintainers

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Questions?

Feel free to open a discussion or reach out to maintainers!

---

Thank you for contributing to FlowForge! 🚀

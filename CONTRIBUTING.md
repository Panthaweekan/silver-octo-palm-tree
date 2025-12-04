# Contributing to FitJourney

Thank you for your interest in contributing to FitJourney! 🏋️

## Development Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fitjourney.git
   cd fitjourney
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start development**
   ```bash
   docker-compose up -d  # Start databases
   npm run dev           # Start all services
   ```

## Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

## Commit Convention

We use conventional commits:

```
feat: add food scanning feature
fix: resolve calorie calculation bug
docs: update API documentation
style: format code with prettier
refactor: restructure workout service
test: add unit tests for meals API
chore: update dependencies
```

## Pull Request Process

1. Create a feature branch from `develop`
2. Write clear, concise commit messages
3. Add tests for new features
4. Update documentation if needed
5. Ensure all tests pass
6. Submit PR with description

## Code Style

- **TypeScript/JavaScript**: ESLint + Prettier
- **Python**: Black + Pylint
- **Max line length**: 100 characters
- **Use TypeScript** for all new frontend code

## Testing

```bash
# Run all tests
npm run test

# Run specific tests
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## Questions?

Open an issue or reach out to the maintainers.

---

Thank you for contributing! 🙏

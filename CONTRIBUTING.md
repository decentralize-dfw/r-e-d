# Contributing to C2W2 Virtual Runway

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/r-e-d.git
   cd r-e-d
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Type Check**
   ```bash
   npm run type-check
   ```

## Code Standards

### TypeScript

- Use strict type checking
- Avoid `any` types
- Document public APIs with JSDoc
- Use meaningful variable names

### Code Style

- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- Trailing commas in multiline objects/arrays

### File Organization

```
src/
├── core/          # Core application logic
├── managers/      # Feature managers
├── config/        # Configuration
├── types/         # Type definitions
├── styles/        # CSS files
└── utils/         # Utility functions
```

### Naming Conventions

- **Classes**: PascalCase (`SceneManager`)
- **Functions**: camelCase (`loadModel`)
- **Constants**: UPPER_SNAKE_CASE (`APP_CONFIG`)
- **Files**: PascalCase for classes, camelCase for utilities
- **Types**: PascalCase (`SceneConfig`)

## Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(scene): add new interior camera position
fix(physics): correct collision detection bounds
docs(readme): update installation instructions
```

## Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. **Type check and build**
   ```bash
   npm run type-check
   npm run build
   ```

4. **Push and create PR**
   ```bash
   git push origin feat/your-feature-name
   ```

5. **PR Description should include:**
   - What changed
   - Why it changed
   - How to test
   - Screenshots (for UI changes)

## Adding New Features

### Adding a Scene

1. Add scene configuration to `src/config/app.config.ts`
2. Implement scene logic in `src/managers/SequenceManager.ts`
3. Add HTML content panels to `index.html`
4. Test all transitions

### Adding a Manager

1. Create file in `src/managers/`
2. Follow existing manager patterns
3. Add to `Application.ts` initialization
4. Document public methods
5. Add TypeScript types

### Adding UI Components

1. Add HTML structure to `index.html`
2. Add styles to `src/styles/main.css`
3. Add interaction logic to `UIManager.ts`
4. Test responsive behavior

## Testing

Currently, the project uses manual testing. For contributions:

1. Test on desktop (Chrome, Firefox, Safari)
2. Test on mobile (iOS Safari, Android Chrome)
3. Test VR (if applicable)
4. Check console for errors
5. Verify type checking passes
6. Ensure build succeeds

## Performance Guidelines

- Keep bundle sizes small
- Lazy load heavy assets
- Dispose of unused resources
- Use code splitting appropriately
- Monitor memory usage

## Documentation

- Update README.md for user-facing changes
- Update JSDoc for API changes
- Update DEPLOYMENT.md for deployment changes
- Add inline comments for complex logic

## Questions?

- Open an issue for bugs
- Start a discussion for features
- Check existing issues/PRs first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

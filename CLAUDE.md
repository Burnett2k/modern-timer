# Modern Timer - Claude Context

## Environment

- **Node.js Version**: 20.19.0 (defined in `.nvmrc`)
- **Package Manager**: npm

## Key Commands

- `npm run lint` - Must pass with zero warnings before commits
- `npm run build` - Must succeed before commits
- `npm run dev` - Development server
- `npm test` - Unit tests (29 tests)
- `npm run test:visual` - Visual regression tests
- `npm run test:coverage` - Test coverage report

## Project Standards

- Zero tolerance for ESLint errors/warnings
- All TypeScript errors must be resolved
- Use functional components with hooks
- Implement `useCallback` for functions in `useEffect` dependencies
- Update `changelog.md` following established format before commits

## File Structure

```
src/
├── components/          # Reusable UI components
├── utils/              # Business logic and services
├── workers/            # Background processing
└── types/              # TypeScript type definitions
```

## Testing Requirements

- Manual testing scenarios must be documented in changelog
- Unit tests for utility functions
- Integration tests for service classes

## Before Committing

1. Run `npm run lint` (zero warnings required)
2. Run `npm run build` (must succeed)
3. Update `changelog.md` with proper format
4. Test functionality end-to-end

## IMPORTANT

Code will always be committed by the human. Do not attempt to run any kind of git add or git commit commands on your own.

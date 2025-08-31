# Contributing Guidelines

## Project Standards

This document outlines the coding standards and practices for the Modern Timer project.

## Changelog Standards

### Format Requirements

The changelog must follow the established format consistently:

#### Date/Time Headers
```markdown
## YYYY-MM-DD HH:MM
```
- Use 24-hour time format
- Increment time by 30-45 minutes for logical development sessions
- Use actual development dates when possible

#### Section Structure
Each entry must have:
1. **Feature section** (3-5 bullet points maximum)
2. **Testing section** (3-4 validation points)

#### Section Naming Conventions
- Use descriptive, action-oriented titles
- Examples: "State Persistence and localStorage", "Keyboard Shortcuts Implementation"
- Avoid generic titles like "Phase 1 Completion" or "Various Updates"

#### Bullet Point Style
- Start with action verbs: "Added", "Implemented", "Fixed", "Created"
- Be specific and concise (1 line preferred, 2 lines maximum)
- Focus on **what** was implemented, not **how**
- Avoid implementation details in changelog (save for architecture docs)

#### Example Entry
```markdown
## 2025-08-30 17:15

### Keyboard Shortcuts Implementation
- Added F key for start/pause toggle functionality
- Implemented E key for instant session goal editing
- Added T key for instant timer duration editing
- Included R key for reset (preserves Cmd+R browser refresh)
- Smart input detection: shortcuts ignored when typing in text fields

### Testing
- Verified all keyboard shortcuts work in different timer states
- Confirmed shortcuts don't interfere when typing in input fields
- Tested Cmd+R still works for browser refresh while R key resets timer
- Validated F key toggles between start/pause correctly
```

## Code Quality Standards

### ESLint and TypeScript
- **Zero tolerance policy**: No ESLint errors or warnings in production code
- All TypeScript errors must be resolved before commits
- Run `npm run lint` and `npm run build` before any changelog updates

### React Patterns
- Use functional components with hooks
- Implement `useCallback` for functions passed to `useEffect` dependencies
- Prefer controlled components over uncontrolled
- Use TypeScript interfaces for all component props

### File Organization
```
src/
├── components/          # Reusable UI components
├── utils/              # Business logic and services  
├── workers/            # Background processing
└── types/              # TypeScript type definitions
```

## Documentation Standards

### Architecture Documentation
- Major architectural decisions must be documented in `ARCHITECTURE.md`
- Include learning explanations for complex React patterns
- Document all service integrations and browser APIs used

### Code Comments
- Comments should explain **why**, not **what**
- Use JSDoc for public API functions
- Avoid obvious comments like `// Set state to true`

## Git Workflow

### Commit Messages
Follow conventional commit format:
```
type(scope): description

feat(timer): add keyboard shortcuts for timer control
fix(sound): resolve audio context suspended state
docs(changelog): update with latest features
```

### Before Committing
1. Run `npm run lint` (must pass with zero warnings)
2. Run `npm run build` (must succeed)
3. Update `changelog.md` following format standards
4. Test functionality end-to-end

## Testing Requirements

### Manual Testing
Every changelog entry must include:
- Specific test scenarios that were executed
- Edge cases that were validated
- Cross-browser/session testing where applicable

### Automated Testing
- Unit tests for utility functions
- Integration tests for service classes
- Component testing for complex interactions

## Performance Standards

### React Optimization
- Use `useCallback` for stable function references
- Implement proper `useEffect` dependencies
- Avoid unnecessary re-renders through proper state design

### Bundle Size
- Monitor build output for size increases
- Lazy load components when beneficial
- Tree-shake unused dependencies

## Browser Compatibility

### Target Support
- Modern browsers with ES2020 support
- Web Audio API support
- Service Worker support
- localStorage availability

### Graceful Degradation
- Audio features should degrade gracefully
- localStorage failures must not break functionality
- Service Worker unavailability should fall back to main thread

## Review Checklist

Before updating changelog or committing code:

- [ ] Code passes ESLint with zero warnings
- [ ] TypeScript compiles without errors
- [ ] Manual testing completed and documented
- [ ] Changelog follows established format
- [ ] Architecture docs updated if needed
- [ ] Performance impact considered
- [ ] Browser compatibility maintained

## Enforcement

These standards are enforced through:
1. **Manual review** - All changes reviewed for standard compliance
2. **Automated checks** - ESLint and TypeScript in CI/CD
3. **Documentation consistency** - Regular format verification

Deviations from these standards must be discussed and approved before implementation.
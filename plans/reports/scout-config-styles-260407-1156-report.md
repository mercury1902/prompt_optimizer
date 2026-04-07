# Scout Report: Configuration Files and Styles Analysis

**Date:** 2026-04-07
**Project:** claudekit-chatbot-astro
**Report Type:** Configuration & Styles Analysis

---

## 1. Package.json - Dependencies and Scripts

### Purpose
Main project manifest defining dependencies, scripts, and Node.js requirements.

### Key Configuration
- **Node Engine:** >=22.12.0 (modern Node.js requirement)
- **Module Type:** ES Modules ("type": "module")
- **Version:** 0.0.1

### Scripts
| Script | Command | Purpose |
|--------|---------|---------|
| dev | astro dev | Development server |
| build | astro build | Production build |
| preview | astro preview | Preview production build |
| test | vitest run | Run tests once |
| test:watch | vitest | Watch mode testing |
| test:coverage | vitest run --coverage | Coverage report |

### Dependencies (19 packages)
**Core Framework:**
- astro ^6.1.3 - Main framework
- @astrojs/react ^5.0.2 - React integration
- @astrojs/node ^10.0.4 - Node.js adapter for SSR
- @astrojs/check ^0.9.8 - Type checking

**UI/Styling:**
- tailwindcss ^4.2.2 - CSS framework (v4!)
- @tailwindcss/vite ^4.2.2 - Vite plugin for Tailwind
- framer-motion ^12.38.0 - Animation library
- lucide-react ^1.7.0 - Icon library
- clsx ^2.1.1, tailwind-merge ^3.5.0 - Utility class handling

**React Ecosystem:**
- react ^19.2.4, react-dom ^19.2.4, @types/react ^19.2.14 - React v19
- cmdk ^1.1.1 - Command palette component
- sonner ^2.0.7 - Toast notifications
- react-markdown ^10.1.0, react-syntax-highlighter ^16.1.1 - Markdown rendering
- remark-gfm ^4.0.1 - GitHub-flavored markdown

**Database:**
- postgres ^3.4.9 - PostgreSQL client
- typescript ^5.9.3

### Dev Dependencies (11 packages)
- **Testing:** vitest ^4.1.2, @vitest/coverage-v8 ^4.1.2, @testing-library/*, happy-dom ^20.8.9, msw ^2.13.0
- **ORM:** drizzle-orm ^0.30.10, drizzle-kit ^0.20.14, drizzle-zod ^0.5.1
- **Types:** @types/react-syntax-highlighter ^15.5.13

### Notes
- Tailwind v4 (latest) - uses new CSS-first configuration
- React v19 (very recent)
- Testing stack is complete with Vitest + Testing Library

---

## 2. Astro Config (astro.config.mjs)

### Purpose
Astro framework configuration for build, SSR, and Vite integration.

### Output Mode
- **Output:** server (SSR mode, not static)
- **Adapter:** @astrojs/node in standalone mode (self-contained Node.js server)

### Integrations
- @astrojs/react - React component support

### Vite Configuration
**Plugins:**
- @tailwindcss/vite - Tailwind CSS processing

**Path Aliases:**
| Alias | Path |
|-------|------|
| @lib | /src/lib |
| @components | /src/components |
| @middleware | /src/middleware |

**SSR Config:**
- noExternal: ["@tailwindcss/vite"] - Force bundling of Tailwind Vite plugin

**Build Config:**
- rollupOptions.external: [] - No external dependencies excluded from bundle

---

## 3. TypeScript Config (tsconfig.json)

### Purpose
TypeScript compiler configuration extending Astro strict preset.

### Base Configuration
- **Extends:** astro/tsconfigs/strict - Strict type checking enabled

### Include/Exclude
- **Include:** .astro/types.d.ts, all files (**/*)
- **Exclude:** dist (build output)

### Compiler Options
| Option | Value | Purpose |
|--------|-------|---------|
| jsx | react-jsx | React JSX transform |
| jsxImportSource | react | React JSX source |
| baseUrl | . | Project base directory |
| paths | @/* -> ./src/* | Import path alias |

---

## 4. Vitest Config (vitest.config.ts)

### Purpose
Test runner configuration for unit and integration testing.

### Test Environment
- **Environment:** happy-dom - Fast DOM implementation (lighter than JSDOM)
- **Globals:** true - Enables global test APIs (describe, it, expect)

### Setup
- **Setup Files:** ./tests/setup.ts - Global test setup file

### Coverage
- **Provider:** @vitest/coverage-v8
- **Exclude:** tests/api/**/*.test.ts - API tests excluded from coverage

### ESBuild
- jsxInject: undefined - Disables Istanbul instrumentation for import.meta.env

---

## 5. Global Styles (src/styles/global.css)

### Purpose
Main stylesheet implementing Glassmorphism 2.0 premium design system.

### CSS Architecture
Uses Tailwind CSS v4 with @import "tailwindcss" directive.

### CSS Variables (Design Tokens)

**Glass Depth Layers:**
| Variable | Value | Usage |
|----------|-------|-------|
| --glass-depth-1 | rgba(255,255,255,0.03) | Subtle |
| --glass-depth-2 | rgba(255,255,255,0.06) | Standard cards |
| --glass-depth-3 | rgba(255,255,255,0.10) | Elevated |
| --glass-depth-4 | rgba(255,255,255,0.15) | Highlights |
| --glass-depth-5 | rgba(255,255,255,0.20) | Max emphasis |

**Border Opacity Scale:**
- --glass-border-1 through --glass-border-4 (5%% to 25%% opacity)

**Blur Levels:**
- --blur-xs: 4px, --blur-sm: 8px, --blur-md: 16px, --blur-lg: 24px, --blur-xl: 40px

**Brand Colors:**
| Variable | Hex | Usage |
|----------|-----|-------|
| --brand-50 | #fef3e2 | Lightest |
| --brand-100 | #fde5bf | Light |
| --brand-200 | #fbc959 | Mid-light |
| --brand-300 | #f5a623 | Primary brand |
| --brand-400 | #e08e1a | Dark |
| --brand-500 | #c77812 | Darkest |

**Gradients:**
- --gradient-mesh-1: 3-point radial gradient (orange/purple/blue)
- --gradient-border: 3-color animated border

**Animation Durations:**
- --duration-fast: 150ms, --duration-normal: 300ms, --duration-slow: 500ms

### Component Classes

**Glass Cards:**
- .glass-card - Base glassmorphism card with hover effects
- .glass-card-depth-{1-4} - Depth variants with different blur/backdrop

**Animated Elements:**
- .animated-border - Rotating hue border gradient (4s loop)
- .mesh-gradient - Animated mesh background (20s loop)
- .pulse-glow - Pulsing brand-colored glow (2s loop)

**Buttons:**
- .glass-button - Standard glass button
- .glass-button-primary - Brand-accented variant

**Glow Effects:**
- .glow-brand - Brand glow (20px spread)
- .glow-brand-subtle - Subtle glow (40px spread)

**Utilities:**
- .text-gradient - Purple-to-orange gradient text
- .glass-focus - Accessible focus ring

### Browser Styling
**Scrollbar:**
- Custom dark scrollbar with 8px width
- Semi-transparent thumb (15%% -> 25%% on hover)

**Selection:**
- Brand-colored selection background (rgba(245,166,35,0.3))

**Toast Override:**
- [data-sonner-toast] - Customizes sonner toast with glassmorphism

---

## 6. Security Middleware (src/middleware/security-headers-with-cors-and-input-validation.ts)

### Purpose
Security middleware stub (Phase 4 implementation pending).

### Current State
STUB IMPLEMENTATION - Placeholder functions, not full security logic.

### Interfaces
SecurityConfig { maxInputLength: number; allowedOrigins: string[]; requireAuth: boolean; }

### Functions
| Function | Status | Description |
|----------|--------|-------------|
| withSecurity | Stub | Higher-order wrapper (pass-through) |
| validateInput | Partial | Basic empty string check only |
| getCORSHeaders | Hardcoded | Returns wildcard CORS headers |
| getSecurityHeaders | Hardcoded | Basic security headers |
| handleCORS | Stub | Returns null (no-op) |

### Security Headers (Current)
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block

### CORS Headers (Current)
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization

### Security Gaps
- No input length validation (parameter ignored)
- No origin validation (allows wildcard)
- No authentication checks
- No rate limiting
- No CSRF protection
- Missing CSP, HSTS headers

---

## 7. Environment Variables (.env.example)

### Purpose
Template for required and optional environment variables.

### Required Configuration

**Database:**
| Variable | Example | Purpose |
|----------|---------|---------|
| DATABASE_URL | postgresql://... | PostgreSQL connection string |
| | sqlite://./data/chat.db | SQLite alternative for local dev |

**Firepass AI API (REQUIRED):**
| Variable | Default | Purpose |
|----------|---------|---------|
| PUBLIC_FIREPASS_API_KEY | - | API key for chat functionality |
| PUBLIC_FIREPASS_MODEL | accounts/fireworks/routers/kimi-k2p5-turbo | Model identifier |
| PUBLIC_FIREPASS_BASE_URL | https://api.fireworks.ai/inference/v1 | API endpoint |

### Optional Configuration

**Session Management:**
| Variable | Default | Purpose |
|----------|---------|---------|
| MAX_SESSIONS | 100 | Max concurrent sessions |
| MESSAGE_PAGE_SIZE | 50 | Pagination size |

**Feature Flags:**
| Variable | Default | Purpose |
|----------|---------|---------|
| ENABLE_TOOLS | true | Enable tool/function calling |
| ENABLE_STREAMING | true | Enable SSE streaming responses |

### Notes
- PUBLIC_ prefix exposes variables to client-side
- API keys are public (for frontend Firepass usage)

---

## Summary: Key Technical Decisions

| Aspect | Choice | Notes |
|--------|--------|-------|
| Framework | Astro 6.x | SSR mode with Node adapter |
| Styling | Tailwind v4 | CSS-first config, latest features |
| UI Library | React 19 | Latest version with Astro |
| Animation | Framer Motion | Industry standard |
| Database | PostgreSQL | postgres driver (lightweight) |
| ORM | Drizzle | Type-safe, lightweight |
| Testing | Vitest + happy-dom | Fast alternative to Jest |
| Icons | Lucide React | Consistent icon set |
| Notifications | Sonner | Toast notifications |

---

## Unresolved Questions

1. Security middleware stub needs full implementation per comment
2. No Content Security Policy (CSP) headers defined yet
3. Rate limiting not configured
4. Authentication system not visible in config files
5. Database schema not examined in this scout session

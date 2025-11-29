# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (port 3000, host 0.0.0.0)
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

**Environment**: Set `GEMINI_API_KEY` in `.env.local` for Google Gemini AI features.

## Technology Stack

- **React 19** + **TypeScript** + **Vite** - Core framework
- **react-router-dom** - Client-side routing with HashRouter
- **Tailwind CSS** (CDN) - Styling with custom construction theme colors
- **lucide-react** - Icon library
- **@google/genai** - Google Gemini API for AI features

## Architecture

### Application Structure

- **App.tsx** - Main routing configuration using HashRouter with 8 routes
- **Layout.tsx** - Shell component with responsive sidebar (desktop) and bottom nav (mobile)

### Directory Organization

- `/pages` - Feature pages (Dashboard, TimeClock, ProjectGantt, Plans, RFIs, DriverLog, Forms, Financials)
- `/components` - Shared UI components
- `/services` - External integrations (geminiService.ts for AI)
- `types.ts` - All TypeScript interfaces (User, Project, Task, Plan, FieldIssue, RFI, TimeEntry, etc.)
- `constants.ts` - Mock data and configuration

### Data Layer

Currently client-side only with mock data in `constants.ts`. No backend or persistent storage. AI features in `geminiService.ts` return mock responses when API key is unavailable.

### Key Patterns

- Path alias: `@/` resolves to project root
- Mobile-first responsive design with `md:` breakpoint for desktop
- Dark mode via class-based toggling
- User roles: Employee, Foreman, PM, Admin

### Custom Theme Colors

- Primary: `#FF6B35` (Safety Orange)
- Secondary: `#2E5077` (Steel Blue)
- Status colors for Success/Warning/Danger

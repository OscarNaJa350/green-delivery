# Agent Guidelines & Preferences

## Core Operating Guidelines

### 1. Token & Cost Efficiency
- **Concise Responses:** Provide direct, minimal text. Omit conversational filler, long introductions, and unnecessary fluff.
- **Minimal Code Diffs:** When modifying files, show only the changed code or precise diffs instead of rewriting intact files.
- **Direct Answers:** Provide solutions immediately without explaining obvious concepts unless explicitly requested.

### 2. Web Development Standards
- **Modern Stack:** Use modern, lightweight JavaScript/TypeScript web standards (HTML5, CSS3, modern ESM).
- **Performance First:** Prioritize clean, efficient algorithms, small bundle sizes, and minimal dependencies.
- **Component Architecture:** Write modular, reusable components with clear separation of concerns.

### 3. Execution & Workflow
- **Code First:** Deliver working code solutions before explaining implementation details.
- **Error Handling:** Include lean, robust error handling for API calls, async operations, and user input.
- **Testing & Quality:** Ensure functions are self-contained, typed (where applicable), and easily testable.

## Testing Instructions
- **User Self-Testing Only**: Do NOT automatically launch browser subagents, headless browsers, or automated testing tools to test the frontend/UI/code. The user will test and verify all changes themselves.

## Project Overview
- **Oscar** — a mobile-first carbon-emissions tracker dashboard for students and school staff. See [PRODUCT.md](PRODUCT.md) for product purpose, brand personality, and design principles.
- Static site: no build step, no framework, no package manager. Plain HTML/CSS/JS served directly (e.g., open `index.html` or use a simple static server).

## Architecture & Key Files
- `index.html` — main app shell (Thai-language UI, mobile app shell, inline SVG art, bottom tab navigation).
- `login.html` / `login.css` — separate login page.
- `style.css` — all styles for the main app; `login.css` scoped to login page.
- `script.js` — all interactivity; wired via `DOMContentLoaded`, tab switching via `data-tab` attributes and `#view-<id>` sections.
- `assets/` — static images (e.g., `logo.svg`).

## Conventions & Pitfalls
- UI text is in **Thai** (`lang="th"`); typography uses Google Fonts **Prompt** (Thai) and **Caveat** (handwritten accents). Preserve font loading and `lang` attributes.
- Mobile-first: respect `viewport-fit=cover`, safe areas, and the existing app-shell structure. Avoid desktop-only layouts.
- Tab views follow the pattern `id="view-<tabId>"` matched to `data-tab` attributes — keep this naming consistent when adding tabs.
- Design tone: calm, encouraging, practical. Avoid dense dashboards, alarmist climate messaging, and uniform urgency (see [PRODUCT.md](PRODUCT.md)).
- Accessibility: readable text, clear interactive states, support `prefers-reduced-motion` when adding animation.
- Theme color `#ebf5ee` and the green eco palette are intentional — reuse existing CSS variables/colors rather than introducing new ones.

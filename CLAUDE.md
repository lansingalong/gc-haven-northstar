# gc-haven-northstar — Claude Code context

## Design system — Quill Web UI Kit

**Source of truth: `DESIGN_SYSTEM.md` + `src/tokens/variables.css`**

Always read `DESIGN_SYSTEM.md` before building or styling any component.

### Token file: `src/tokens/variables.css`

Key tokens:
- Font: `--font-family-base: 'Roboto', system-ui, sans-serif` (weights 400, 500)
- Font sizes: `--font-size-xs: 11px`, `--font-size-sm: 13px`, `--font-size-md: 14px`
- Warning: `--color-warning: #ed6c02`, `--color-warning-light: #fff4e5`
- Error: `--color-error: #d32f2f`, `--color-error-light: #fdecea`
- Border radius: `--radius-sm: 4px`, `--radius-full: 100px`
- Transitions: `--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)`

### Rules
- Never hardcode hex values — always use a token from `variables.css`
- Font: Roboto 400/500 only — no bold 700 in UI components
- No Tailwind, no inline style color blocks
- CSS Modules only (`*.module.css`)

## Stack

- React 19 + TypeScript + Vite
- CSS Modules (`.module.css`)
- MUI icons via `@mui/icons-material`
- Dev server: `npm run dev` → localhost:8085
- Deploy: `npm run deploy` → gh-pages branch → https://lansingalong.github.io/gc-haven-northstar/

## Key files

| File | Purpose |
|------|---------|
| `src/features/Haven/HavenWindow.tsx` | Main floating Haven AI window |
| `src/features/Haven/SukiWindow.tsx` | Suki ambient recording panel |
| `src/features/Haven/HavenPanel.module.css` | Chat area + alert styles |
| `src/features/Haven/mockReplies.ts` | All mock AI responses |
| `src/tokens/variables.css` | CSS custom properties (Quill design system) |
| `guidingcare-design-system.html` | GuidingCare UI reference |
| `DESIGN_SYSTEM.md` | Quill Web UI Kit rules |

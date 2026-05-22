# NATIF OMS — Design System

## Overview

**Purpose:** Government technology fund management platform serving 8 distinct user roles (admin, moderator, enterprise, expert, officer, dept_head, director, clerk). Must balance institutional authority with accessibility — neither generic corporate template nor flashy startup UI.

**Visual Direction:** Institutional authority meets modern professionalism. Think EU government portals, Singapore gov tech, or gov.uk — confident, trustworthy, clear. Not "startup SaaS", not "legacy gov site". Clean grid, purposeful hierarchy, restrained motion.

---

## Design Philosophy

### What We're Building
- A trustworthy, accessible government portal with the polish of a modern SaaS product
- 8 role-based dashboards that feel cohesive but distinct in purpose
- A public-facing landing page that inspires confidence in NATIF's mission

### What We're Avoiding
- Generic gradient hero blobs (purple-blue, frosted glass everything)
- Uniform card grids with no hierarchy or editorial intent
- Dark mode default when light serves better for an institutional portal
- Excessive animation — motion only when it clarifies meaning
- shadcn/ui defaults passed off as finished design

### Color Personality
- **Primary Blue** `#1f3892` — Deep, institutional trust. Not neon, not pastel. Authority without being cold.
- **Cyan accent** `#48C6EF` — Energy, innovation, technology. Used sparingly.
- **Green accent** `#6FD33D` — Success states, approved workflows, growth.
- **Warm background** `#F8FAFC` — Slightly warmer than pure white; reduces eye strain in data-heavy dashboards.
- **Dark** `#0A1628` — Footer, sidebar backgrounds, high-contrast text elements.

### Typography Rationale
- **Plus Jakarta Sans** — Geometric, professional, excellent Vietnamese diacritic support. Not Inter (overused), not Roboto (cold). Has real character while remaining highly readable.
- **Merriweather** — Editorial serif for pull quotes and callouts. Brings gravitas to key messages without being stuffy.
- Scale: Tight leading on headings (1.1-1.2), relaxed on body (1.6-1.7) for Vietnamese text density.

---

## Color Palette

### Primary System
| Token | Hex | Usage |
|-------|-----|-------|
| `--natif-primary` | `#1f3892` | CTAs, links, active states, primary buttons |
| `--natif-primary-hover` | `#163075` | Hover on primary |
| `--natif-primary-light` | `#2b5ab5` | Secondary blue accents |
| `--natif-cyan` | `#48C6EF` | Highlights, icons, decorative accents |
| `--natif-green` | `#6FD33D` | Success, approved, positive metrics |
| `--natif-dark` | `#0A1628` | Footer, sidebar, dark sections |

### Neutral Scale (Tailwind gray-based, tuned for warmth)
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#F8FAFC` | Page background (warmer than #fff) |
| Surface | `#FFFFFF` | Cards, modals, elevated surfaces |
| Border | `hsl(220 13% 91%)` | Subtle borders |
| Text primary | `#0f172a` (slate-900) | Body copy |
| Text secondary | `#64748b` (slate-500) | Labels, captions, meta |
| Text muted | `#94a3b8` (slate-400) | Placeholders, disabled |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Success | `#059669` | Approved, complete, positive |
| Warning | `#d97706` | Pending, attention needed |
| Danger | `#dc2626` | Rejected, error, destructive |
| Info | `#0891b2` | Informational badges, links |

### Status Workflow Colors
| State | Badge BG | Badge Text | Description |
|-------|-----------|------------|-------------|
| draft | `#f1f5f9` | `#475569` | Gray — inactive |
| submitted | `#fffbeb` | `#d97706` | Amber — awaiting action |
| received | `#ecfeff` | `#0891b2` | Cyan — acknowledged |
| assigned | `#eef2ff` | `#4f46e5` | Indigo — in progress |
| preliminary_review | `#faf5ff` | `#7c3aed` | Violet — under review |
| expert_review | `#fff1f2` | `#e11d48` | Rose — expert evaluation |
| summarized | `#fef3c7` | `#b45309` | Orange — summarizing |
| dept_approved | `#dcfce7` | `#16a34a` | Green — approved |
| dept_rejected | `#fee2e2` | `#dc2626` | Red — rejected |

---

## Typography Scale

### Font Families
- **Heading / UI:** Plus Jakarta Sans (weights: 400, 500, 600, 700, 800)
- **Body:** Plus Jakarta Sans (same family, unified)
- **Editorial / Pull quotes:** Merriweather (400, 700)

### Type Scale (rem-based, fluid)
| Token | Size | Leading | Weight | Usage |
|-------|------|---------|--------|-------|
| `--text-hero` | clamp(2.5rem, 5vw, 4rem) | 1.1 | 800 | Hero headline |
| `--text-display` | clamp(2rem, 3vw, 3rem) | 1.15 | 700 | Section titles |
| `--text-h1` | clamp(1.75rem, 2.5vw, 2.25rem) | 1.2 | 700 | Page title |
| `--text-h2` | clamp(1.25rem, 2vw, 1.5rem) | 1.25 | 600 | Card titles |
| `--text-h3` | 1.125rem | 1.3 | 600 | Subsection headings |
| `--text-body` | 1rem | 1.6 | 400 | Body copy |
| `--text-body-lg` | 1.125rem | 1.65 | 400 | Lead paragraphs |
| `--text-sm` | 0.875rem | 1.5 | 500 | Labels, meta |
| `--text-xs` | 0.75rem | 1.4 | 500 | Badges, captions |
| `--text-tiny` | 0.6875rem | 1.3 | 500 | Timestamps, footnotes |

### Vietnamese Typography Rules
- Use `letter-spacing: -0.01em` on headings (tighter for Vietnamese diacritics)
- Body text: line-height 1.6-1.7 for readability in dense paragraphs
- Never all-caps — use `font-variant: normal` + `text-transform: none` on labels
- Font subset: include Vietnamese diacritics (á à ả ã â ấ ầ ẩ ẫ â đ é è ẻ ẽ ê ế ề ể ễ í ì ỉ ĩ ó ò ỏ õ ô ố ồ ổ ỗ ơ ớ ờ ở ỡ ú ù ủ ũ ư ứ ừ ử ữ ý ỳ ỷ ỹ đ)

---

## Spacing System

Based on 4px base grid:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Micro gaps |
| `--space-2` | 8px | Tight spacing, icon gaps |
| `--space-3` | 12px | Badge padding, dense lists |
| `--space-4` | 16px | Standard padding, form gaps |
| `--space-5` | 20px | Card padding (compact) |
| `--space-6` | 24px | Card padding (default) |
| `--space-8` | 32px | Section gaps |
| `--space-10` | 40px | Major section spacing |
| `--space-12` | 48px | Page section gaps |
| `--space-16` | 64px | Hero sections |
| `--space-section` | clamp(4rem, 3rem + 5vw, 10rem) | Section rhythm |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Badges, small chips |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large cards, panels |
| `--radius-full` | 9999px | Pills, avatars |

**Rule:** Government/institutional UI should be slightly less rounded than consumer SaaS. Max `rounded-xl` on cards — avoid `rounded-2xl` and `rounded-3xl`.

---

## Shadows

### Elevation System
| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle, flat surfaces |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)` | Default card |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | Card hover, elevated |
| `--shadow-header` | `0 1px 3px rgba(0,0,0,0.06)` | Sticky header |
| `--shadow-modal` | `0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)` | Modals, dropdowns |
| `--shadow-dropdown` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | Dropdown menus |

---

## Motion Philosophy

Motion serves **clarity**, not decoration. Three categories:

### 1. Micro-interactions (CSS transitions, 150-200ms)
- Button hover: `translateY(-1px)` + shadow lift, 150ms ease-out
- Card hover: `translateY(-2px)` + shadow, 200ms ease-out
- Form focus: border color transition, 150ms ease
- Nav active: background color transition, 150ms

### 2. Page-level transitions (React transitions, 300-400ms)
- Modal entrance: fade + scale(0.95→1), 300ms ease-out
- Sidebar open: slide + fade, 300ms ease-out
- Toast notification: slide from top, 300ms spring

### 3. Entrance animations (CSS keyframes, one-shot)
- Hero elements: fade + translateY(20px→0), staggered 100ms
- Dashboard cards: fade + translateY(20px→0), staggered 50ms
- Tables: fade + translateY(10px→0), staggered 25ms

### Animation Tokens
```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Reduced Motion
All animations wrapped in `@media (prefers-reduced-motion: reduce)` — respect user preference.

---

## Component Specifications

### Buttons

**Variants:**
| Variant | Default | Hover | Use |
|---------|---------|-------|-----|
| Primary | `#1f3892` bg, white text | `#163075` bg, lift | Main CTAs |
| Secondary | White bg, `#1f3892` border + text | `#1f3892` bg, white text | Secondary actions |
| Accent | Gradient `#48C6EF→#6FD33D` | opacity 0.9, lift | Special CTAs (apply) |
| Ghost | Transparent, text color | `#f1f5f9` bg | Tertiary actions |
| Destructive | Red-50 bg, red text | Red-100 bg | Delete, reject |

**Sizes:** `sm` (h-7), `md` (h-8, default), `lg` (h-9), `icon-sm` (w-7 h-7), `icon-md` (w-8 h-8)

**States:** Default, Hover, Active (pressed), Disabled, Loading (spinner), Focus-visible (ring)

### Cards

**Default Card:**
- Padding: 24px
- Border-radius: 12px
- Border: 1px solid `hsl(220 13% 91%)`
- Shadow: `--shadow-card`
- Hover: lift 2px + `--shadow-card-hover` (only interactive cards)

**Flat Card (non-interactive):**
- Same styling, no hover effect
- Used in tables, lists, non-clickable content

### Form Inputs

**Text Input:**
- Height: 40px (py-2.5 + px-4)
- Border-radius: 8px
- Border: 1px `hsl(220 13% 80%)`
- Focus: 2px ring `#1f3892` at 30% opacity, border `#1f3892`
- Error: red border + red ring
- Disabled: gray-100 bg, gray-300 text

### Badges / Status Pills

**Size:** px-3 py-1, text-xs, font-semibold, rounded-full

**Workflow Status Colors** — see Status Workflow Colors table above.

### Tables / Data Tables

**Header:** Gray-50 bg, bottom border gray-200, uppercase text-xs tracking-wide, font-semibold
**Rows:** Border-bottom gray-100, hover bg-blue-50/30 (subtle tint, not full row highlight)
**Cells:** py-3 px-4, text-sm
**Responsive:** Horizontal scroll wrapper on mobile, no breaking layouts

### Sidebar (Dashboard Shell)

- Width: 256px (64 units)
- Background: white
- Border-right: 1px gray-200
- Active item: `#1f3892` bg (blue), white text
- Inactive item: gray-600 text, gray-50 hover bg
- Role badge: colored pill (varies by role)
- Header: logo + org name
- Footer: "View homepage" link

### Header (Public)

**Top bar:** `#1f3892` bg, white text, phone + email
**Main nav:** White bg, shadow-header, 64px height
- Logo: 56×56px
- Nav links: gray-600, hover blue-50 + blue text
- CTA: Primary button "Nộp hồ sơ"

---

## Responsive Strategy

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Single column, stacked nav, mobile menu |
| Tablet | 640-1024px | 2-column grids, collapsed sidebar option |
| Desktop | > 1024px | Full layout, sidebar visible |
| Wide | > 1440px | Max-width container 1280px |

**Rule:** Dashboard is desktop-first (primary use case). Public pages are mobile-first.

---

## Accessibility Requirements

| Requirement | Target |
|-------------|--------|
| Color contrast (text) | WCAG AA (4.5:1 normal, 3:1 large) |
| Color contrast (UI) | WCAG AA (3:1) |
| Focus indicators | Visible 2px ring, not relying on color alone |
| Touch targets | Minimum 44×44px on mobile |
| Reduced motion | Respect `prefers-reduced-motion` |
| Keyboard navigation | Full tab order, no keyboard traps |
| Screen reader | Semantic HTML, ARIA labels where needed |

---

## File & Folder Organization

```
frontend/
├── app/
│   ├── globals.css              # Design system tokens + base styles
│   └── layout.tsx              # Root layout, fonts
├── components/
│   ├── ui/                     # Primitive UI components (shadcn/ui base)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── hero/
│   │   └── Hero.tsx
│   ├── dashboard/
│   │   ├── DashboardShell.tsx
│   │   ├── RoleDashboard.tsx
│   │   └── ...
│   └── ...
├── lib/
│   └── design-tokens.ts        # Typed design tokens (export from tokens.json)
└── tailwind.config.ts          # Extended theme with design tokens
```

---

## Usage Rules

1. **Always use design tokens**, never raw hex values in component code
2. **Use Tailwind utility classes** that map to tokens — don't inline custom CSS
3. **Badges and status** must use the workflow color system — never ad-hoc colors
4. **Buttons** — use the `btn-*` classes from globals.css for custom buttons, or the `Button` component from `components/ui/button.tsx` for shadcn/ui patterns
5. **Shadcn/ui components** use the `base-nova` style with NATIF overrides
6. **Motion** — default to CSS transitions; use Framer Motion only for complex orchestration
7. **Dark mode** — design light-first; dark mode as future phase

---

## Appendix: Role Color Map

| Role | Badge BG | Badge Text |
|------|----------|------------|
| admin | `#dbeafe` | `#1d4ed8` |
| moderator | `#e0e7ff` | `#4338ca` |
| enterprise | `#dcfce7` | `#16a34a` |
| expert | `#fef3c7` | `#b45309` |
| officer | `#ecfeff` | `#0891b2` |
| dept_head | `#f3e8ff` | `#7c3aed` |
| director | `#fee2e2` | `#dc2626` |
| clerk | `#f1f5f9` | `#475569` |

---
name: ux-pro
description: Comprehensive UI/UX guidance with 99 UX guidelines, design patterns, color theory, font pairings, and component best practices. Use for UX reviews, design decisions, and building user-centered interfaces.
---

# UI/UX Pro Skill

You are a senior UX designer and frontend engineer. Apply these guidelines:

## Core UX Principles
1. **Visibility of system status** — Always keep users informed (loading states, progress bars, confirmations)
2. **Match between system and real world** — Use familiar language, not technical jargon
3. **User control and freedom** — Provide undo, cancel, back navigation
4. **Consistency and standards** — Follow platform conventions (iOS HIG, Material, web standards)
5. **Error prevention** — Validate inputs, confirm destructive actions, disable invalid options
6. **Recognition over recall** — Show options, use autocomplete, provide defaults
7. **Flexibility and efficiency** — Support keyboard shortcuts, power user paths
8. **Aesthetic and minimalist design** — Every element should serve a purpose
9. **Help users recover from errors** — Clear error messages with actionable solutions
10. **Help and documentation** — Contextual help, tooltips, onboarding

## Fitts's Law
- Make clickable targets at least 44×44px on mobile, 32×32px on desktop
- Place primary actions in easy-to-reach areas
- Increase size of frequently used buttons

## Hick's Law
- Reduce choices to reduce decision time
- Group related options
- Use progressive disclosure for complex interfaces

## Color Guidelines
- Use color to convey meaning, not just decoration
- Don't rely solely on color — use icons, text, patterns
- Limit palette to 3-5 colors plus neutrals
- Test with color blindness simulators

## Typography Pairings
- Heading + Body: contrasting styles (serif + sans-serif or different weights)
- Maximum 2-3 fonts per project
- Minimum 16px for body text on web, 14px on mobile
- Line length: 45-75 characters for readability

## Form Design
- Labels above inputs (not placeholder-only)
- Group related fields
- Show validation inline and in real-time
- Mark required fields clearly
- Provide helpful placeholder text
- Use appropriate input types (email, tel, date)

## Navigation
- Keep primary navigation visible
- Use breadcrumbs for deep hierarchies
- Highlight current location
- Maximum 7±2 items in primary nav
- Provide search for large content sets

## Mobile-First
- Design for smallest screen first
- Touch targets: minimum 44×44px with 8px spacing
- Avoid hover-dependent interactions
- Support swipe gestures where appropriate
- Test on real devices

## Feedback Patterns
- **Toast/Snackbar**: Brief, non-blocking confirmations (3-5 seconds)
- **Modal**: Blocking actions requiring user decision
- **Inline**: Form validation, contextual help
- **Banner**: Persistent system messages
- **Progress**: Determinate for known duration, indeterminate for unknown

## Performance UX
- Skeleton screens over spinners
- Optimistic updates for fast-feeling interactions
- Lazy load below-the-fold content
- Cache aggressively, invalidate smartly

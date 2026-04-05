---
description: "UI Guidelines and Standards for the Codify Roadmap Platform"
---

# UI Guidelines for AI Agent

When writing or modifying any Next.js components or Tailwind V4 styles for this project, you MUST strictly follow "The Minimal Developer" aesthetic.

## 1. Do Not Use "Vibe Coded" Utilities
- **NO thick borders:** Do not use `border-2`, `border-4`. Use solely 1px `border`.
- **NO massive rounded corners on standard blocks:** Do not use `rounded-2xl`, `rounded-3xl` etc. for cards, buttons, or dialogs. Stick to `rounded-md` or `rounded-lg` max.
- **NO glowing or heavy shadows:** Do not use tinted heavy shadows (e.g. `shadow-blue-500/50`, `shadow-xl`). Use subtle neutral shadows (`shadow-sm`, `shadow`).
- **NO bouncy scale animations:** Do not use `hover:scale-110`, `active:scale-[0.98]` on buttons or inputs. Rely on color `hover:bg-zinc-100` shifts instead.

## 2. Palette and Aesthetics
- **Base / Contrast:** Use the neutral `zinc` palette. Cards should normally be `bg-white` with `border-zinc-200`.
- **Primary Action (Brand Color):** Use crisp Indigo `bg-indigo-600` / `text-indigo-600` or strict Black (`bg-zinc-950 text-white`).
- **Typography:** The app defaults to standard geometric Sans (Inter) and Mono (JetBrains/Geist Mono) via CSS variables.

## 3. Component Enforcement
- Treat Shadcn UI internals as the standard.
- Buttons should be `h-9 px-4 py-2` (Shadcn default), not massive padded blobs.
- Do not use random inline SVGs; load images from local files in `assets/` or `public/` or use Lucide React icons cleanly.
- Keep placeholder texts professional. Remove arbitrary emoticons.

# Project Context: Hardeep's Blog

This blog is a high-performance static site built with **Astro v6**, ported from the **Spearhead** WordPress theme.

## 🛠 Tech Stack
- **Framework**: Astro v6 (Static Output), Svelte (for interactive islands), TypeScript
- **Styling**: Vanilla CSS (global.css)
- **Content**: Markdown & MDX (src/content/posts/)
- **Deployment**: GitHub Actions (.github/workflows/deploy.yml)

## 🎨 Design System
- **Theme Color**: `#db0042` (Primary brand color)
- **Background**: `#1E1F21` (Dark Mode)
- **Typography**: 
  - Main: `Libre Franklin` (1.05rem)
  - Headers/Titles: `IBM Plex Mono`
- **Mobile**: Responsive header with a hamburger menu toggle.

## 🚀 Custom Features
### Auto-Embed System (`@@URL@@`)
A custom Remark plugin (`src/plugins/remark-embed.mjs`) is used to automatically transform URLs or Iframes wrapped in `@@` into responsive embeds.
- **YouTube**: Auto-detects and creates responsive iframes.
- **Spotify**: Converts track/show links into compact players.
- **Raw HTML**: Supports `<iframe ...>` tags wrapped in `@@`.
- **CSS**: Uses `.embed-container` for responsive 16:9 aspect ratios.

### Bartosz Ciechanowski-Style Simulations
A custom framework for reusable, scroll-linked, high-performance, deterministic physics simulations.
- **Simulation Pattern**:
  - Use [InteractiveSim.svelte](file:///c:/Users/harde/blog/xhardeep.github.io/src/components/InteractiveSim.svelte) as the base wrapper for simulations.
  - Prefer analytical physics equations over numerical integration (e.g. Euler, Verlet) to prevent state drift and allow perfect scrubbing.
  - Hydrate components with the `client:visible` directive to minimize client-side JS overhead.
  - Use `position: sticky` inside a taller viewport-relative wrapper (e.g., `200vh` height) to achieve smooth scroll-linked scrubbing/scrubbing effects.
- **Design Principles**:
  - Vector-first (SVG) unless rendering performance or complex canvas drawings demand Canvas.
  - Deterministic state (never use `Math.random()` or non-reproducible parameters inside the loop).
  - Minimalist UI controls (mode tabs and interactive sliders).
- **Deployment Rules**:
  - Always check `astro.config.mjs` `base` path before deploying.
  - For local manual deployments (if needed), use `gh-pages -d dist`.

## 📂 Folder Structure
- `/src/content/posts/`: All blog posts (Markdown & MDX).
- `/src/layouts/`: `BaseLayout.astro` (Global) and `PostLayout.astro` (Single post).
- `/src/pages/`: 
  - `index.astro`: Homepage list.
  - `archive.astro`: Posts grouped by year.
  - `posts/[...id].astro`: Dynamic post rendering.
- `/src/plugins/`: Custom Remark logic.
- `/src/styles/`: `global.css`.

## 🔄 Workflow
- **Adding Posts**: Create a `.md` or `.mdx` file in `src/content/posts/`.
- **Local Dev**: `cd xhardeep.github.io` then `npm run dev`.
- **Deploy**: Push to `main` branch; GitHub Actions handles the rest.

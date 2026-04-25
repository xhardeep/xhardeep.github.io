# Project Context: Hardeep's Blog

This blog is a high-performance static site built with **Astro v6**, ported from the **Spearhead** WordPress theme.

## 🛠 Tech Stack
- **Framework**: Astro v6 (Static Output)
- **Styling**: Vanilla CSS (global.css)
- **Content**: Markdown (src/content/posts/)
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

## 📂 Folder Structure
- `/src/content/posts/`: All blog posts (Markdown).
- `/src/layouts/`: `BaseLayout.astro` (Global) and `PostLayout.astro` (Single post).
- `/src/pages/`: 
  - `index.astro`: Homepage list.
  - `archive.astro`: Posts grouped by year.
  - `posts/[...id].astro`: Dynamic post rendering.
- `/src/plugins/`: Custom Remark logic.
- `/src/styles/`: `global.css`.

## 🔄 Workflow
- **Adding Posts**: Create a `.md` file in `src/content/posts/`.
- **Local Dev**: `cd xhardeep.github.io` then `npm run dev`.
- **Deploy**: Push to `main` branch; GitHub Actions handles the rest.

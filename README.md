# 🌲 The Bryce Zone

> Personal portfolio and digital field journal of **Bryce Graham** — Software Craftsman and Wilderness Photographer. Built with modern **Svelte 5 (Runes)**, **TypeScript**, and **Vite**.

---

## ✨ Features

- **📸 Wilderness Photography Gallery**: Live integration with the Flickr API showcasing high-resolution nature and landscape photography. Features a responsive CSS grid, native `IntersectionObserver` infinite scrolling, and a custom zero-dependency lightbox viewer with full keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape`), zoom toggle, and interactive thumbnail filmstrip.
- **📚 Curated Reading Shelf**: An expansive visual library highlighting 38+ influential books across computer science, speculative fiction, natural history, and philosophy, complete with original cover artwork, memorable excerpts, and Goodreads references.
- **🛠️ Engineering Toolbox**: A structured catalog of technical proficiencies, development stacks, cloud infrastructure, databases, and workflow systems.
- **🎓 Career & Academic Journey**: An interactive chronological timeline detailing professional software engineering roles and computer science education.
- **💬 Literary Quotes Widget**: Embedded Goodreads quote widget celebrating literature and philosophical reflections.
- **🧭 Responsive Field Guide Navigation**: Bespoke collapsible side-navigation drawer providing swift, accessible navigation across mobile, tablet, and desktop viewports.
- **🌲 Field Journal Aesthetic**: Nature-inspired visual discipline utilizing deep woodland obsidian (`#0d1710`), shadowy evergreen tones, frosted dark-glass surfaces, and warm golden lichen accents (`#d49a46`) paired with Roman Cinzel display and Lora serif typography.

---

## 🚀 Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | [Svelte 5](https://svelte.dev/) | Built with modern Svelte runes (`$state`, `$derived`, `$effect`) for fine-grained reactivity |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety across components, models, and Flickr data |
| **Build Tool** | [Vite 7](https://vitejs.dev/) | Ultra-fast HMR and optimized asset bundling via `@sveltejs/vite-plugin-svelte` |
| **Routing** | Custom Svelte Router | Zero-dependency reactive client-side history router (`src/lib/router.svelte.ts`) |
| **UI & Layout** | Bespoke Modern CSS | Pure modular CSS, flexbox/grid architectures, and glassmorphic elevations without bloated frameworks |

---

## 📂 Project Structure

```text
the-bryce-zone/
├── public/
│   ├── images/
│   │   ├── BookCovers/      # 38+ cover artworks for curated library
│   │   └── LinkImages/      # Social graphics (GitHub, LinkedIn)
│   └── page-data/           # Static metadata & route definitions
├── src/
│   ├── components/
│   │   ├── Book.svelte                 # Book card with cover, excerpt & links
│   │   ├── FlickrLightbox.svelte       # Lightweight modal image viewer
│   │   ├── GoodreadsQuotesWidget.svelte # Embedded literary quotes
│   │   ├── Header.svelte               # Minimal field-journal top bar
│   │   ├── Layout.svelte               # Application shell & drawer wrapper
│   │   ├── Lightbox.svelte             # Fullscreen keyboard-driven photo viewer
│   │   └── SideNav.svelte              # Accessible responsive navigation drawer
│   ├── data/
│   │   └── BookInfo.ts                 # Structured literature catalog & quotes
│   ├── lib/
│   │   └── router.svelte.ts            # Svelte 5 reactive client-side router
│   ├── pages/
│   │   ├── EducationExperience.svelte  # Career timeline & education
│   │   ├── FavoriteBooks.svelte        # Reading shelf view
│   │   ├── Home.svelte                 # Hero introduction & journal entry
│   │   ├── Photography.svelte          # Infinite-scroll Flickr photo gallery
│   │   └── Toolbox.svelte              # Technical competencies & developer stack
│   ├── App.svelte                      # Root component & route dispatcher
│   ├── index.css                       # Global styles, variables & typography
│   └── main.ts                         # Application entrypoint
├── index.html                          # HTML shell with Google Fonts & SEO tags
├── package.json                        # Dependencies & build scripts
├── tsconfig.json                       # TypeScript compiler configuration
└── vite.config.ts                      # Vite build & server configuration
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`, `pnpm`, or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/the-bryce-zone.git
   cd the-bryce-zone
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

### Production Build

To generate an optimized production bundle:

```bash
npm run build
```

To preview the built production artifacts locally:

```bash
npm run preview
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

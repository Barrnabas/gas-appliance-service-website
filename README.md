# Gas Appliance Service Website

A modern, high-performance website for gas appliance servicing built with [Astro](https://astro.build/).

## Features
- **Fast Content Delivery:** Statically generated for maximum performance using Astro.
- **Internationalization (i18n):** Multi-language capabilities out-of-the-box (see `src/i18n`).
- **Interactive Maps:** Integrated with Leaflet for location services and contact maps.
- **Modern UI:** Responsive design using structured components, styled with SCSS and [Astro Icon](https://www.astroicon.dev/) (Lucide).
- **Automated Testing:** Unit testing configured and structured with Vitest.

## 🚀 Project Structure

This Astro project has the following directories and main files:

```text
/
├── public/                # Static assets (images, fonts, etc.)
├── src/
│   ├── components/        # Reusable UI components (Navbar, Footer, etc.)
│   ├── i18n/              # Translations and language setup utilities
│   ├── layouts/           # Global page layouts wrapping components
│   ├── lib/               # Custom logic, libraries, stores, etc.
│   ├── pages/             # Route files (index, about, services, contact, legal)
│   └── styles/            # Global SCSS stylesheets
├── astro.config.mjs       # Astro configuration
├── package.json           # Dependencies and scripts
└── vitest.config.ts       # Test configuration
```

## 🧞 Commands

All commands are run from the root of the project from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs all project dependencies                |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run test`            | Runs Vitest test suites                          |

## 🛠 Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **Styling:** [SCSS/Sass](https://sass-lang.com/)
- **Icons:** [Astro Icon](https://www.astroicon.dev/) with [@iconify-json/lucide](https://icones.js.org/collection/lucide)
- **Maps:** [Leaflet](https://leafletjs.com/)
- **Fonts:** [@fontsource/inter](https://fontsource.org/fonts/inter)
- **Testing:** [Vitest](https://vitest.dev/)

# servd documentation site

A fully-prerendered, bilingual (English / 中文) documentation site for `servd`,
built with SvelteKit 2 + Svelte 5 + Tailwind CSS v4 and emitted as pure static
HTML by `@sveltejs/adapter-static`. Every page (docs, use cases, blog, landing)
is rendered to real HTML at build time for SEO; there is no server at runtime.

This is an **independent sub-project**: it has its own `package.json` and
`pnpm-lock.yaml` and must not add dependencies or scripts to the repository
root `package.json` (the npm launcher package asserts an exact root manifest).

## Requirements

- Node.js >= 18 (20+ recommended)
- pnpm 10 (`corepack enable` or `npm i -g pnpm`)

All commands run from the repository root using `--dir website`, or from this
directory directly.

## Develop

```bash
pnpm --dir website install
pnpm --dir website dev        # http://localhost:5173
```

## Build / preview / check

```bash
pnpm --dir website build      # prerender everything into website/build
pnpm --dir website preview    # serve the production build locally
pnpm --dir website check      # svelte-kit sync + svelte-check (types)
```

The build crawls from `/` plus the explicit entries in `svelte.config.js`
(`sitemap.xml`, `robots.txt`, `rss.xml`) and writes one directory-style
`index.html` per route under `website/build`.

## Content

Markdown lives in `src/content/{en,zh}/{docs,use-cases,blog}/*.md`. English and
Chinese slugs must stay in parity — the language switcher cross-links every
page, so a missing translation would produce a 404 during the prerender crawl.

Frontmatter by kind:

| Kind       | Fields                                                            |
| ---------- | ----------------------------------------------------------------- |
| docs       | `title, description, group (start\|guides\|reference), order`      |
| use-cases  | `title, description, summary, order, tags[]`                       |
| blog       | `title, description, date (YYYY-MM-DD), tags[], readingTime, author, draft` |

Body content starts at `##` (the `title` becomes the `<h1>`). Internal links are
written **without** a language prefix (e.g. `[CLI](/docs/cli/)`); the renderer
rewrites them to the current locale and base path at build time. Quote any
frontmatter value that contains `": "` (a colon followed by a space).

Code fences must use a language bundled in `src/lib/content/markdown.ts`
(`SHIKI_LANGS`); anything else falls back to plain text rather than failing.

## Environment

| Variable          | Effect                                                            |
| ----------------- | ----------------------------------------------------------------- |
| `BASE_PATH`       | URL prefix for a sub-path deployment (e.g. `/repo` on GH Pages).   |
| `PUBLIC_SITE_URL` | Absolute origin used for canonical / hreflang / OG / sitemap URLs. |
| `PUBLIC_GITHUB_URL` | Repository URL used in JSON-LD publisher.                        |

Defaults: `BASE_PATH=""`, `PUBLIC_SITE_URL="https://servd.qingyu31.dev"`.

## Social image

`static/og.png` (1200x630) is generated deterministically — no image model —
by a small Pillow script. Regenerate after brand changes:

```bash
pip install pillow
python3 website/scripts/gen-og.py
```

## Dogfood: serve the site with servd itself

The prerendered output is directory-style static HTML (each route is an
`index.html`), so it needs no SPA fallback. From the repository root:

```bash
go run ./cmd/servd --static=website/build --port=4321
# then open http://localhost:4321/
```

## Deployment

The default target is **GitHub Pages** via `.github/workflows/site.yml`, which
on push to `main` runs `pnpm --dir website install --frozen-lockfile &&
pnpm --dir website build` and publishes `website/build` with
`actions/deploy-pages`. For a project site it injects
`BASE_PATH=/<repo>` and a matching `PUBLIC_SITE_URL`; override either with the
repository variables `BASE_PATH` / `SITE_URL` (e.g. set `SITE_URL` for a custom
domain and `BASE_PATH` to `""` when serving from a domain root).

Because the output is plain static files, the same `website/build` directory
also deploys to Cloudflare Pages, Vercel, Netlify, or any static host — or to
`servd` itself (see above).

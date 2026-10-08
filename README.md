# Cycle Five Syndicate — website

The marketing site for **Cycle Five Syndicate**, built with
[Zola](https://www.getzola.org/) (Rust static site generator) and deployed to
Cloudflare Pages. Replaces the previous Backdrop CMS site at `cyclefive.xyz`.

## Stack

- **Zola 0.22.1** — static site generator (Tera templates + built-in libsass).
- No external theme. Custom templates in `templates/`, custom styles in `sass/`.
- No JS framework. The build is `zola build` plus
  [serve-the-source](https://github.com/cycle-five/serve-the-source), which
  writes each page's Markdown source beside its HTML for agents (`npm run build`
  runs both). Fonts: Inter + JetBrains Mono via Google Fonts (with system
  fallbacks).

## Layout

```
.
├── config.toml            # Zola config + [extra] site data (links, email, year)
├── content/
│   ├── _index.md          # Home (renders templates/index.html)
│   ├── about.md           # About
│   └── contact.md         # Contact
├── templates/
│   ├── base.html          # Shell: header, nav, footer, <head>, skip-link
│   ├── index.html         # Home: hero + products + community
│   ├── page.html          # Generic prose page (About)
│   └── contact.html       # Contact page with email + community cards
├── sass/
│   └── main.scss          # Design system → compiled to /main.css
├── static/
│   ├── favicon.svg        # Wordmark glyph (gradient "5")
│   └── img/
│       ├── crack-tunes.jpg  # Crack Tunes logo (from old site)
│       └── anya-og.png      # Anya AI image (from old site, also the OG image)
├── functions/
│   └── _middleware.js     # Pages Function: Accept: text/markdown → index.md
├── package.json           # `npm run build` = zola build + serve-the-source
├── .claude/launch.json    # Local dev-server config (zola serve on :1111)
├── .gitignore             # ignores public/ and .zola-cache/
├── LICENSE                # MIT
└── README.md
```

## Design

- **Palette:** ink (`#14161c`) on warm-white, with an electric-violet →
  teal accent gradient (`#7c5cff → #00c2a8`). Full dark-mode variant via
  `prefers-color-scheme`.
- **Type:** Inter for UI/body, JetBrains Mono for the wordmark and eyebrow
  labels (a nod to the terminal/Rust identity).
- **Wordmark:** a gradient rounded-square mark with a stylized "5" (the "Five"),
  reused as the SVG favicon.
- Responsive (CSS grid, `clamp()` fluid type), accessible (skip link, semantic
  landmarks, visible focus rings, `prefers-reduced-motion`), and fast (one CSS
  file, lazy-loaded images, no JS).

## Local development

Requires Zola **0.22.1** (`brew install zola` / `pacman -S zola` /
[other methods](https://www.getzola.org/documentation/getting-started/installation/)).

```sh
zola serve     # live-reload dev server at http://127.0.0.1:1111
zola build     # HTML only, into ./public
npm run build  # what Pages runs: zola build, then the Markdown for agents
zola check     # validate internal links & markup
```

## Deploy — Cloudflare Pages

Connect this repo to Cloudflare Pages (Workers & Pages → Create → Pages →
Connect to Git) with:

| Setting             | Value           |
| ------------------- | --------------- |
| Framework preset    | None            |
| Build command       | `npm run build` |
| Build output dir    | `public`        |
| Root directory      | `/`             |

**The build command must be `npm run build`, not `zola build`.** Plain
`zola build` deploys a site that looks fine, but it writes no `index.md` files,
so `functions/_middleware.js` has nothing to serve and agents asking for
`text/markdown` silently get HTML. Check after a deploy:
`curl -sI -H 'Accept: text/markdown' https://cyclefive.xyz/about/` should say
`content-type: text/markdown`.

**Pin the Zola version** — Cloudflare's default Zola is older. Add an
environment variable (Settings → Environment variables, Production **and**
Preview):

```
ZOLA_VERSION = 0.22.1
```

Cloudflare Pages serves over HTTPS automatically and redirects HTTP→HTTPS for
free — no extra config.

## DNS / custom domains

> Context: the old host got the cert and DNS wrong, which is what got the domain
> rejected. Specifically — the apex `cyclefive.xyz` was served under a
> **wildcard** cert (`*.cyclefive.xyz`), and a wildcard does **not** cover the
> apex; `www.cyclefive.xyz` had **no DNS record** at all; and plain HTTP never
> redirected to HTTPS. Cloudflare Pages fixes all three.

In the Pages project → **Custom domains**, add:

1. **`cyclefive.xyz`** (apex) — the canonical domain.
2. **`www.cyclefive.xyz`** — set up as a **redirect to the apex** (recommended
   canonical: bare `cyclefive.xyz`). Pages will create the CNAME/redirect for
   you; pick one canonical host and 301 the other to it so you don't split SEO
   or cookies.
3. **`cyclefive.org`** (second domain you own) — add as a custom domain and
   **redirect it to the canonical `cyclefive.xyz`**.

For each domain, **let Cloudflare issue the certificate**. Cloudflare's
Universal SSL covers the apex (the wildcard problem goes away), and `www` now
has a real record, so both `https://cyclefive.xyz` and `https://www.cyclefive.xyz`
resolve and serve valid certs. HTTP→HTTPS redirect is automatic.

If the domains' nameservers aren't already on Cloudflare, move them to
Cloudflare (or add the CNAME records Pages shows you) so it can manage the
records and certs.

### Redirect setup

The cleanest way to do apex-vs-www and the `.org` redirect on Cloudflare is a
**Bulk Redirect** or a **Redirect Rule** (Rules → Redirect Rules):

- `www.cyclefive.xyz/*` → `https://cyclefive.xyz/$1` (301)
- `cyclefive.org/*` and `www.cyclefive.org/*` → `https://cyclefive.xyz/$1` (301)

## ⚠️ Placeholders to confirm before launch

- **Contact email** — `hello@cyclefive.xyz` in `config.toml` (`[extra].email`)
  is a **placeholder**. Replace it with a real, monitored inbox (the old site
  had no contact info at all, so there's nothing to inherit).
- **Medium** — the old site linked an auto-generated handle
  (`@reserved_honeydew_guineapig_87`), which has been **dropped**. No real
  Medium URL was discoverable, so Medium is currently **omitted** from the site.
  If you have a real Medium profile, add it to `[extra]` in `config.toml` and
  surface it in the footer/community/contact sections.
- **Community links** were pulled live from the old site and are wired in:
  Discord `https://discord.gg/b6KVpfH9CF`, Telegram `https://t.me/cracktunes`.
  Confirm the Discord invite hasn't expired (invite links can be set to expire).

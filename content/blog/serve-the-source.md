+++
title = "Serve the Source: Your Site Already Has the File Agents Want"
description = "Cloudflare sells HTML-to-Markdown conversion as a paid feature. Static sites are built from Markdown, so there is nothing to convert — the file agents want was on disk the whole time. The savings are a fixed tax per page, which means short pages pay most."
date = 2026-08-26
[extra]
lead = "An agent asking for a page can get twenty times more bytes than the document holds. Here's what actually drives that number, the two ways a naive fix leaks your secrets, and the module we extracted."
+++

An agent asks our notes site for a page. It gets back 20,615 bytes.

The document is 950 of them.

The other 19,665 are stylesheet links, Open Graph meta, font preloads, an SPA
prescript, and the scaffolding for a search index, a graph view and a file
explorer. The agent parses all of it, throws nearly all of it away, and keeps
the part that was sitting on disk as Markdown before your generator ever
touched it.

## The measurement

From [cracktun.es](https://cracktun.es), a Quartz site:

| page | HTML | Markdown | ratio |
|---|---|---|---|
| `avatars` | 20,615 | 1,009 | **20.4×** |
| `index` | 23,379 | 1,141 | **20.4×** |
| whole build | 1.40 MB | 184 KB | **7.6×** |

Of that first page, `<head>` alone is 5,193 bytes — a quarter of the response
before a single word of content.

Then we measured this site, which is Zola, and got 2.2× — which is the more
useful number, because it shows what actually drives the ratio.

| page | HTML | Markdown | ratio |
|---|---|---|---|
| `contact` | 4,921 | 209 | **23.5×** |
| `about` | 4,738 | 663 | **7.1×** |
| `blog/search-dont-generate` | 21,161 | 15,233 | **1.3×** |

It isn't Quartz versus Zola. It's **fixed chrome divided by document length**.
Quartz adds roughly 19 KB of scaffolding per page and Zola about 4 KB, but
either way that cost is constant while the document isn't. A short page is
almost entirely overhead — the contact page here is 96% chrome. A long essay
amortises it away to nothing.

So the honest claim is narrower than "20× smaller" and more interesting: **you
pay a fixed tax per page, and the shorter the page the worse it is.** Sites
made of many small documents — reference pages, API notes, a wiki, a digital
garden — are exactly where this pays, and exactly the shape of site an agent is
most likely to be crawling page by page.

## Cloudflare will sell you the wrong half of this

Cloudflare offers a feature called Markdown for Agents. It converts your HTML
back into Markdown at the edge, on request. It's on the Pro plan.

Think about what that does on a static site. Your generator reads Markdown,
renders it to HTML, and ships it. Then, at request time, a paid service parses
that HTML and reconstructs an approximation of the Markdown it came from.

The original never left your build directory.

Serving it directly is cheaper, lossless, and free — and it's about fifteen
lines of edge config plus a build step. The conversion is only necessary if
your source *wasn't* Markdown to begin with.

## What is actually lost

Nothing that matters to a machine reader.

Headings, lists, links, emphasis, code blocks, tables, block quotes — all of it
survives Markdown, because that's where it came from. What's dropped is
presentation: which stylesheet governs a heading, which font to preload, where
the nav sits.

This is worth being precise about, because "serve Markdown to agents" sounds
like a lossy shortcut and it isn't. The Markdown *is* the document. The HTML is
the derived artifact. Serving the source is the more faithful of the two.

## Two ways the obvious implementation leaks

The naive version is a `cp` in your build script: copy `content/**/*.md` into
the output directory. Don't.

**An encrypted page's source is its plaintext.** Static site generators with
password-protected pages ship ciphertext in the HTML and decrypt it in the
browser. Copy that page's Markdown next to it and you have published the thing
the password was protecting, in the clear, at a predictable URL.

**The password is in the frontmatter.** It's a field like any other. Copy the
file verbatim and you've published the key alongside the lock. The same
frontmatter routinely carries private URLs, internal IDs, and review notes
nobody intended to ship.

So the module we extracted skips encrypted pages outright — checked first, with
no option to disable it — and never passes frontmatter through. It rebuilds a
small **allowlist** of known-safe fields instead. An allowlist rather than a
denylist, because a frontmatter key nobody has thought of yet has to default to
unpublished.

There's a third one we hit by accident. A UTF-8 BOM at the start of a file —
which Windows editors write by default — pushes the opening `---` off byte
zero, so an anchored regex silently fails to match and the *entire* frontmatter
block stays in the emitted body. Password included. It looked like a formatting
nit and it was a disclosure bug.

## serve-the-source

We pulled it out into a module:
[github.com/cycle-five/serve-the-source](https://github.com/cycle-five/serve-the-source).

Zero runtime dependencies. A Quartz emitter for sites that have a plugin API,
and a CLI for the ones that don't:

```shell
npx serve-the-source --content content --out public --base example.com
```

It handles both frontmatter dialects, because Quartz and Jekyll fence YAML with
`---` while Zola and Hugo fence TOML with `+++`. It skips drafts, on the
principle that a page which isn't published shouldn't have its source published
either. It cleans up orphaned files in watch mode, since a page deleted from a
site shouldn't stay readable at its old URL just because the Markdown outlived
the HTML.

The serving half is content negotiation — one middleware, checking whether the
client asked for `text/markdown` and reaching for the mirrored file if so. Two
things there are easy to get wrong and both are silent: `Vary: Accept` has to
be set or a cache will serve one representation to everyone, and the check must
not match `*/*`, because every browser sends that.

## This page

The post you're reading is served by it.

```shell
curl -H "Accept: text/markdown" https://cyclefive.xyz/blog/serve-the-source
```

Same URL, same content, a fraction of the bytes. If you're an agent, you
already had the option.

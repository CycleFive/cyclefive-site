/**
 * Markdown content negotiation for cyclefive.xyz.
 *
 * `serve-the-source` mirrors each page's Markdown into the build output at
 * build time; this hands it to clients that ask for it. Everyone else gets the
 * HTML, byte for byte unchanged.
 *
 * 🪤 ZOLA'S LAYOUT IS DIRECTORY-PER-PAGE. `content/about.md` renders to
 *    `public/about/index.html`, so the mirrored source is at
 *    `public/about/index.md` — NOT `public/about.md`. Appending `.md` to the
 *    request path is the obvious implementation and it 404s on every page.
 *
 * 🪤 `Vary: Accept` IS NOT OPTIONAL, and it goes on BOTH branches. Two
 *    different bodies are served from one URL. Without it the first response
 *    cached for a URL is handed to everyone: one agent's Markdown served to
 *    browsers, or a browser's HTML served to every agent.
 *
 * 🪤 THE ACCEPT CHECK MUST NOT MATCH `*​/​*`. Browsers send Accept headers
 *    ending in `*​/​*`, so a substring or wildcard-tolerant test hands Markdown
 *    to every browser. Only an explicit `text/markdown` (or `text/x-markdown`)
 *    counts, and `q=0` on it is a refusal rather than a request.
 */

const MARKDOWN_TYPES = ["text/markdown", "text/x-markdown"]

function wantsMarkdown(accept) {
  if (!accept) return false
  for (const part of accept.split(",")) {
    const [rawType, ...params] = part.trim().split(";")
    if (!MARKDOWN_TYPES.includes(rawType.trim().toLowerCase())) continue
    const q = params.map((p) => p.trim().toLowerCase()).find((p) => p.startsWith("q="))
    if (q && parseFloat(q.slice(2)) === 0) return false
    return true
  }
  return false
}

/** `/about`, `/about/`, `/` -> the mirrored source path Zola's layout implies. */
function sourcePathFor(pathname) {
  const trimmed = pathname.replace(/\/+$/, "")
  return `${trimmed}/index.md`
}

function withVary(res) {
  const out = new Response(res.body, res)
  out.headers.append("Vary", "Accept")
  return out
}

export async function onRequest(context) {
  const { request, next, env } = context
  const url = new URL(request.url)

  const isPageRequest =
    !/\.[a-z0-9]+$/i.test(url.pathname) && (request.method === "GET" || request.method === "HEAD")

  if (!isPageRequest || !wantsMarkdown(request.headers.get("Accept"))) {
    return withVary(await next())
  }

  const mdUrl = new URL(url)
  mdUrl.pathname = sourcePathFor(url.pathname)
  const md = await env.ASSETS.fetch(new Request(mdUrl, request))

  if (!md.ok) {
    // No mirrored source for this page — a section index with no body, or a
    // generated page. Fall back to HTML rather than 404: the page exists, only
    // this representation does not.
    return withVary(await next())
  }

  const out = new Response(md.body, md)
  out.headers.set("Content-Type", "text/markdown; charset=utf-8")
  out.headers.set("X-Content-Type-Options", "nosniff")
  out.headers.append("Vary", "Accept")
  return out
}

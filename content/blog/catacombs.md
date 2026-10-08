+++
title = "RuneCast's Login Is Now a Library You Can Use: catacombs"
description = "RuneCast's Discord login now runs on catacombs, an MIT-licensed Rust crate that began as the game's own login code. Version 0.2.0 is on crates.io, and moving a live game onto it logged nobody out."
date = 2026-10-08
[extra]
lead = "Where the crate came from, what it does for any axum service, and how a contract suite let us swap a live game's login without anyone noticing."
+++

Every time you open RuneCast in Discord, the game first asks Discord who you
are. Starting with backend v0.42.0, that conversation runs on
[catacombs](https://github.com/cycle-five/catacombs), an open-source Rust crate
that began life as RuneCast's own login code.

It's MIT-licensed. [Version 0.2.0](https://crates.io/crates/catacombs) went up
on crates.io on October 6, and it now signs people in to two of our projects:
RuneCast, and the CrackTunes web dashboard.

## Where it came from

I wrote RuneCast's Discord login myself: the OAuth code exchange, a signed
session, refresh tokens encrypted at rest, and a check of who had bought
premium. It was ironically perhaps the most time-consuming piece of the original
RuneCast code to get working. I recognized, as I was building it, that I had a
module that was useful more generally than to RuneCast and that, while required
for the game to function, had almost nothing whatsoever to do with the actual
playing of RuneCast. Any Discord app that wants to know who its users are needs
the same routes and the same careful token handling.

RuneCast itself was playable and released on Discord right around Christmas of
last year, and by January I had already pulled out the part of the code that
RuneCast used for OAuth, got it working, and put it up on GitHub as an
open-source module.

I am fundamentally a believer in open source and so I try to build in public and
release under a permissive open-source license, and where that isn't done or
isn't possible, I still try to carve out useful tools or modules that get built
along the way and release those under MIT and/or Apache.
[sleevenote](https://github.com/cycle-five/sleevenote), which resolves music
links for CrackTunes without an API key, came out the same way. So did
[serve-the-source](https://github.com/cycle-five/serve-the-source), from our
websites' build.

What brought catacombs back to life was CrackTunes, whose new web dashboard
needed "Log in with Discord" for an ordinary website. That became catacombs
0.1.0 on September 30, the same day CrackTunes v0.15.0 shipped the dashboard on
top of it. It took until just this week to finally get catacombs onto crates.io
and integrate it properly with RuneCast. CrackTunes, still on 0.1, moves to 0.2
next.

## What catacombs does

catacombs adds "Log in with Discord" to a Rust web service built on
[axum](https://github.com/tokio-rs/axum). Your handlers ask for an
`AuthenticatedUser` and never touch a token:

```rust
async fn hello(user: AuthenticatedUser) -> String {
    format!("Hello, {}!", user.username)
}
```

It covers both ways people sign in with Discord:

- **Discord Activities and single-page apps** post the authorization code they
  already have to `/auth/exchange` and get a session token back. That's
  RuneCast.
- **Ordinary websites** send people to `/auth/login`. catacombs redirects them
  to Discord, checks the `state` that comes back, sets an HttpOnly session
  cookie, and returns them to the page they started on. That's the CrackTunes
  dashboard.

Around that:

- **Refresh tokens are encrypted at rest** (AES-256-GCM) before storage ever
  sees them.
- **Premium through Discord.** Set a SKU, and every login reconciles the user's
  entitlements. Premium granted some other way (by hand, or a payment elsewhere)
  is never taken away by Discord.
- **Your database, or ours.** Out of the box it keeps users in PostgreSQL
  through SQLx, or in memory. Since 0.2, an app with its own users table
  implements one five-method `Storage` trait instead, and catacombs works on top
  of it.
- **Your metrics.** An `AuthObserver` hears about every login attempt: who, how
  long it took, and why it failed.
- **rustls or OpenSSL**, your choice, behind feature flags.

## Coming home without logging anyone out

Swapping out a game's login is easy to get wrong in ways nobody notices until
players can't get in. So the switch had one rule: nobody gets logged out, and
nothing about the login changes unless we wrote it down first.

**First, pin what RuneCast does today.** Before touching the login, we wrote a
contract suite of dozens of tests that drives every login route through
RuneCast's real server against a stand-in Discord. That stand-in records
everything sent to it. The tests check status codes, the exact fields of each
response, what gets stored, that refresh tokens are encrypted, and that a
session signed by the old code is still accepted by the new one. They all passed
against the old login, and then against catacombs. Only one file of tests was
allowed to change: the list of deliberate differences.

**Then, plug catacombs into RuneCast's own tables.** catacombs 0.2 lets an app
bring its own storage. RuneCast's adapter is a couple hundred lines over the
tables players' accounts already live in. No database migration, same session
format, same token encryption. Rolling back is redeploying the previous version.

**Then, delete.** RuneCast's login handlers went from over a thousand lines to
roughly half that, and the game's source shrank by several hundred lines
overall.

The tests also caught things on both sides:

- **RuneCast had been reporting Discord outages as bad logins.** The old code
  meant to answer 502 when Discord was unreachable, but it recognized a network
  failure by searching the error message for words like "timeout". The HTTP
  library never puts those words there, so every outage became a 401. catacombs
  looks at the kind of error instead.
- **catacombs answered 500 for a stored token it couldn't decrypt.** RuneCast
  answered 401, which tells the client to log in again. catacombs now does the
  same.
- **The two disagreed about premium.** catacombs still counted entitlements
  Discord had marked as consumed, and RuneCast's old code could clear premium
  that had been granted by hand. Both now follow one policy. Every premium
  account in production today comes from a Discord purchase, so aligning them
  changed nobody's status.

Each of those is now fixed, in catacombs 0.2.0 or in RuneCast. That's the payoff
of extracting a library: the second user finds what the first one never would.

## What you'll notice as a player

Almost nothing, which was the point. You stay logged in across the update, your
stats and premium are where you left them, and the game opens the same way.

Two small things change behind the scenes:

- The avatar we store for you now asks Discord for a full-size image, and
  animated avatars are stored as animated GIFs. If yours is animated, it
  animates on your RuneCast profile after your next login.
- If Discord itself is having a bad day while you log in, our server now says so
  (a 502) instead of blaming your login. Our dashboards can finally tell a
  Discord outage from a real login problem.

## Use it

If you're building a Discord Activity, a bot dashboard, or any Rust site that
should let people sign in with Discord:

```toml
[dependencies]
catacombs = "0.2"
```

- Crate: [crates.io/crates/catacombs](https://crates.io/crates/catacombs)
- Docs: [docs.rs/catacombs](https://docs.rs/catacombs)
- Source, issues and the changelog:
  [github.com/cycle-five/catacombs](https://github.com/cycle-five/catacombs)

It has two users in production, [RuneCast](https://runeca.st) and the
[CrackTunes](https://cracktun.es) dashboard, one for each login flow. If you
make it a third, or it doesn't fit your app, open an issue. That's exactly the
feedback a young library needs.

## Notes

The exact figures behind the rounded ones, as of RuneCast backend v0.42.0:

- Contract suite: 55 tests (sessions 14, login 19, token refresh and revocation
  14, deliberate changes 8).
- Storage adapter: 193 lines.
- Login handlers: 1,525 lines before the switch, 763 after.
- Backend source overall: 1,159 lines removed, 572 added.

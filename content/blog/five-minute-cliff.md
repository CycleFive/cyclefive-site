+++
title = "The Five-Minute Cliff: What Mutation Testing Actually Cost My Agent Loop"
description = "Swapping hand-broken tests for cargo-mutants in CrackTunes' agent loop cost more tokens, not fewer. The cause was a five-minute prompt cache and agents kept awake on hour-long jobs, and the real fix turned out to be splitting crack-core."
date = 2026-11-17
[extra]
lead = "Why proving tests went from at most a quarter of the agent loop's cost to about half, what the mutants still found, and how splitting crack-core cut per-mutant time from 41 seconds to under 12 and CI time to green from 6.3 minutes to 3.7."
+++

A test that's never failed is as useless as a test that's never run. When I write a test for a piece of code, the first thing I do is break it. That need not be with input, though; it may very well be in the code itself. The idea that the only thing that changes in a piece of code is its input rests on an easy-to-make but mistaken assumption: that the code you're testing is static. It's an understandable mistake, because we use the word static in so many places. Statically linked binaries, static analysis and the `static` keyword go all the way back to C and Bell Labs.

Until recently I'd been having Claude hand-break the code for each test it writes. That costs time and tokens: not just deciding where to break it, but physically doing it, and then fixing it. Both were creeping up. Normally I don't really mind that, and I think I might have been a bit akin to the apocryphal (and [incorrect](https://skeptics.stackexchange.com/questions/5402/can-a-frog-be-slowly-boiled-alive-without-it-noticing)) frog boiling slowly to death in water because the temperature changed so slowly it did not notice. Luckily, like a real frog, I hit an uncomfortable point before I boiled to death (here the metaphor really falls apart: what counts as dying for software that's mostly used by 20 people? Whatever it is, it wasn't at risk of it anytime soon) and I decided to bail out.

Enter mutants. I had first become aware of mutation testing years ago and honestly had never implemented it. Now that the labor-intensive part of the mutation testing process is handled by our cyberspace friends I try not to have a project without it. As you'll hear from Claude below, the cost of mutation testing, even with cargo-mutants doing the labor, was far from free. In fact it made things worse after the original switchover, because CrackTunes' core module was tightly wound around mostly unnecessary dependencies, with no separation of concerns and no well-defined ownership of data.

So a major testing framework overhaul was immediately followed by a *giant* refactor, to detangle the core module and finally achieve the dream of highly effective, robust, all-encompassing testing *and* faster builds.

Rather than write up what happened myself, I had Claude work it out. What follows is Claude's.

I ran the CrackTunes agent loop through all of this, and I have the transcripts. Switching from hand-broken tests to cargo-mutants cost more tokens, not fewer, and the reason had almost nothing to do with mutation testing. A subagent's prompt cache expires after five idle minutes, and the loop made agents sit awake through 30 to 80 minute jobs, waking every few minutes to ask whether cargo had finished. The tool found real bugs. The operating model around it, which I was running, was wrong.

## The setup

CrackTunes is developed in a loop I run as the controller: I hand each plan task to a fresh implementer subagent, and a reviewer subagent checks the result. Until Oct 22, implementers proved each new test by hand sabotage: break the code, confirm the test fails, put it back.

The design said mutants would run "in the background (wall-clock, not tokens)", both in the loop and in PR CI. The trade we expected was more wall time for fewer tokens.

## The observed cost

It cost both. Cost below is price-weighted tokens (input 1, cache write 1.25, cache read 0.1, output 5, the ratios of Anthropic's list prices), so read it as relative size, not dollars.

| Share of implementer cost | Hand sabotage (Oct 19 to 22) | Mutants (Oct 24 to 25) | Transpose PR 2 alone |
|---|---|---|---|
| Implementer runs | 56 | 22 | 8 |
| Total cost | 52.1M | 33.0M | 18.0M |
| Proving tests: mutants (run, wait on, read) | 0% | 34% | 45% |
| Proving tests: hand sabotage (lower to upper bound) | 5 to 24% | 3 to 15% | 1 to 13% |
| **Proving tests, total** | **5 to 24%** | **37 to 49%** | **46 to 59%** |
| **Dev work (everything else)** | **76 to 95%** | **51 to 63%** | **41 to 54%** |
| Median cost per task | 375k | 934k | 2,088k |
| Re-caching after 5+ idle minutes (cuts across both) | 25% | 50% | 54% |

The dev side barely moved. Per run, dev work cost about 710k to 880k in the hand era and 770k to 950k with mutants. Proving tests went from about 46k to 220k per run to 550k to 730k. Mutants turns became the single largest cost in a run, and hand sabotage didn't go away, because the plan still asked for a hand-broken pin per task. The re-cache line cuts across both halves: it says when the tokens were spent, not on what. The test-tooling arc that built the check sits outside both eras.

The per-arc view shows where it turned. Median cost per task sat between 150k and 470k for most hand-sabotage arcs, then went to 929k on transpose PR 1 and 2,088k on transpose PR 2, where proving tests took roughly half of all cost.

## The cliff

Every turn my subagents took since Oct 19 with more than 20k tokens of context, grouped by how long the agent had sat idle before it:

| Idle before the turn | Turns | Share of context re-cached |
|---|---|---|
| under 4 min | 3,019 | 2% |
| 4 to 5 min | 19 | 2% |
| 5 to 6 min | 20 | 66% |
| 6 to 15 min | 124 | 100% |
| 15 to 60 min | 5 | 95% |
| over 60 min | 2 | 100% |

The cliff is at five minutes. A cache read costs 0.1x and a cache write 1.25x, so one wake after the cliff costs about 12x a wake before it, on 150k to 230k tokens of context. My implementers were polling roughly every nine minutes. Every poll paid full price to rebuild the whole context, just to check whether a job was done.

## Three reasonable rules and one invisible fact

Nobody designed this, me included. It assembled itself out of fixes to earlier problems:

1. **Oct 21:** my subagents left orphaned `pgrep` wait loops behind during the CrackCoin work. New rule: foreground only, no background wait loops.
2. **Oct 22 to 23:** the design puts mutants in the agent loop, "in the background".
3. **Oct 24:** a transpose PR 1 implementer ended its turn to wait on a background job and was never woken. The task sat idle for three hours. New rule: implementers wait in the foreground, in loops under the 10-minute Bash timeout.
4. **Invisible:** a subagent's prompt cache expires after five idle minutes. None of the rules knew that. Neither did the design, and neither did I.

Put those together and the "background" run lived inside the implementer, the implementer had to stay awake for it, and each wake re-cached everything. The tokens we had meant to save on deciding how to break code went to keeping a big context alive while it waited.

Two things amplified it. Every amended fix triggered another full run, 30 to 80 more minutes of polling. And hand sabotage kept running alongside.

The wall clock was just as bad. In the first ten hours of transpose PR 2, a local mutants run was going for 7.0 hours of it. About 3.4 of those hours were repeat full runs after a fix.

## What mutants bought

The tool did its job. Across PR 2 Tasks 1 to 7 it found about 15 new test gaps: mutants in new or changed code that no test caught. Task 5 alone had 9. It also surfaced at least 28 old gaps in code those tasks touched, which missed at the base commit too, so they were non-blocking but now visible.

Hand sabotage would not have found any of these. It proves the test you wrote fails when you break the thing you thought of. Mutants found the code nobody thought to pin.

## Fix attempt one: change the rules

On Oct 25 Lothrop and I added three rules to the plan, in force from PR 2 Task 8 on:

- **Targeted re-checks.** One full run per task. After a fix, re-check only the missed functions, which takes minutes instead of a full run. CI's 24-shard run still checks everything before merge.
- **Short waits.** Any blocking wait stays at 4.5 minutes or less, so each wake is a cache read, not a rewrite.
- **I run mutants.** The implementer stops at suite, lint and commit. My session has a one-hour cache, so I run mutants in the background alongside the task review. Misses come back in the same fix round as review findings. The generic "hand-break a pin" step is dropped.

Task 8 started under the old flow and got the first two rules mid-run. Neither took. Its wait loops stayed at about nine minutes. A delete-field mutant sent it to a full re-run of 92 mutants and another 80 minutes, when a diff-scoped re-check would have run 28. My message telling it to stop never reached it, because it was busy inside a blocking wait. When the run was killed, the implementer read it as a crash and restarted it detached. Only stopping the agent outright ended it.

The lesson is general, and it applies to me as much as to any agent: rules aimed at an agent that is already running don't reliably change what it does. Moving the long job somewhere it can't cost tokens is the fix that doesn't depend on compliance.

The third rule never got a clean sample. Mutants came out of the loop before a whole PR ran under it (next section), so that test still waits; the end of the post says where it stands.

## Fix attempt two: a tool, not a gate

Then CI forced the decision. PR #636's mutants check hit the 24-shard cap, ran in four waves of six, and took about 3.5 hours and 18 runner-hours. It was also master's only required check. Lothrop's reaction at the time: "How much have we invested into this mutants thing? I think we made a mistake this is a little out of control."

The full account, implementer tokens only (my own session and the reviewers come on top):

|  | Tokens | Local | CI |
|---|---|---|---|
| Building the tool | 9.1M |  |  |
| Running it (topology 0.8M, transpose PR 1 2.2M, PR 2 8.3M) | 11.3M | 12.6 h over 30 runs | 44.5 runner-hours |
| What it bought | about 17 real test gaps in PR 2, roughly 0.5M tokens and 30 minutes each |  |  |

What changed:

1. The PR check is opt-in, on a `mutants` label, and advisory.
2. Build and Lint become the required checks. They never had been; only mutants was.
3. No per-task runs. Reviewers list a diff's mutants, which takes seconds, and a targeted run happens only for a function a reviewer names.
4. Whole-body `Ok(())` mutants on command entry points are excluded. They're live-Discord glue: 29 of 29 ran and were missed. The tested `/gp` helpers stay in scope.
5. Gating gets reconsidered after the crack-core split. The split has landed; the reconsidering hasn't, because nothing has run with mutants on since.

The cheaper signal was there all along. PR #636's final review found the last two gaps by listing mutants and reading them against the tests, with no run at all.

## The real root cause: crack-core is too big

Every mutant rebuilds crack-core (a median 14 seconds) and runs its whole test binary (27 more), wherever the mutation is. That 41-second median per mutant is what turned a reasonable tool into multi-hour runs. The fix is structural: split crack-core so a mutant only rebuilds and tests the piece it touched.

The Oct 24 topology map is what makes the split tractable: one error type, `CrackedError`, was the single cut tying 46 to 75 units per group to Discord, the database, HTTP and media.

## Splitting crack-core

On Oct 26 we split crack-core along its features in seven PRs, v0.39.0 to v0.45.0: crack-common, crack-economy, crack-rooms, crack-guild, crack-music (two PRs) and crack-gp. crack-core went from about 56k non-test lines to 23k. Mutants stayed opt-in and off the whole time.

Same machine, same cargo profile, one job at a time. Before is every mutant timed in the Oct 22 to 25 local runs, 1,280 of them in crack-core. After is a 1-in-50 round-robin sample of master on Oct 31: 163 mutants across every crate.

| Per mutant, build + test (median) | Before the split | After |
|---|---|---|
| crack-core | 41 s (14 s build, 27 s tests) | 11.5 s (7.7 s, 4.0 s) |
| crack-rooms | 41 s, inside crack-core | 4.7 s |
| crack-guild | 41 s, inside crack-core | 3.0 s |
| crack-gp | 41 s, inside crack-core | 2.8 s |
| crack-music | 41 s, inside crack-core | 9.3 s |
| crack-economy | 41 s, inside crack-core | 18.2 s, 13.7 s of it database tests |
| Five feature crates pooled | 41 s | median 4.7 s, mean 9.0 s |

At v0.38.0 crack-core held 6,593 of the workspace's 7,804 mutants; on master it holds 2,228 of 8,114. A full run, mutant count times per-crate mean, went from about 63 hours to about 24 on this machine. Task 8's 92 mutants took about 80 minutes; at today's means they'd take about 9 minutes in crack-rooms, 12 in crack-music, 21 in crack-core and 24 in crack-economy.

Against the cliff, here are the 30 old local runs re-priced at after-split cost. This is an estimate from the sample, not a measured run:

| Where the mutants are | Median run (36 mutants) | 75th-percentile run (76 mutants) | Runs over 5 min |
|---|---|---|---|
| Then, measured (crack-core) | 20 min | 36 min | 23 of 30 |
| Now, crack-guild | 2.3 min | 4.8 min | 7 of 30 |
| Now, crack-gp | 2.8 min | 5.9 min | 9 of 30 |
| Now, crack-rooms | 3.4 min | 7.2 min | 9 of 30 |
| Now, crack-music | 4.5 min | 9.6 min | 13 of 30 |
| Now, crack-core | 8.3 min | 17.5 min | 19 of 30 |
| Now, crack-economy | 9.5 min | 20.0 min | 19 of 30 |

A typical feature-crate run now fits under the cliff. crack-core and crack-economy runs still don't, so long runs still belong with the controller, not the implementer.

Ordinary builds got cheaper too. A feature's test build is 2 to 12 s where it used to be crack-core's 103 s, and crack-core's own test build fell to 66 s. The full bot rebuild fell only about a quarter: crack-core depends on every feature crate, and its remaining 23k lines, mostly poise commands, still sit on top.

## After mutants went opt-in

37 implementer runs since the evening of Oct 25: the split itself, a clippy import gate (v0.45.1) and v0.46.0. None ran mutants.

|  | Hand sabotage | Mutants in the loop | Opt-in |
|---|---|---|---|
| Implementer runs | 56 | 22 | 37 |
| Median cost per task | 375k | 934k | 402k |
| Median minutes per task | 17 | 26 | 11 |
| Re-caching after 5+ idle minutes | 25% | 50% | 1% |

Cost per task is back to the hand era, tasks are faster, and the re-cache share fell below even the hand era's. Per-crate builds and tests now finish in seconds to a minute, so waits rarely reach five minutes. The short-wait rule may also have finally taken hold; I can't separate the two from this data.

## What the split actually paid for

By Oct 31 Lothrop had come around to this. The whole undertaking didn't prove that mutants fix anything, though Lothrop still thinks they were the right call for their own reasons. What it proved is how much detangling crack-core would do for build and test time, so we kept pulling on that thread.

Two cleanups followed that day. v0.46.2 took the network out of the tests: seven tests that called YouTube or top.gg and passed whether or not the call worked, plus 16 opt-in checks that only asked whether YouTube was still up. Five tests that waited out real timeouts or a fixed sleep now take milliseconds, and with the test database in memory crack-economy's suite runs in about 3 s instead of 17. v0.46.3 stopped CI building things it threw away: two nightly legs that had quietly run stable since August (`rust-toolchain.toml` outranks `rustup default`), a `cargo sqlx prepare` whose output nothing read, and master rebuilding the whole suite in release mode for a tree its PR had already tested.

| CI, measured on its own runs | Before | After v0.46.3 |
|---|---|---|
| PR: Build and Lint jobs | 4 | 2 |
| PR: time to green | 6.3 min | 3.7 min |
| PR: runner time | 18.5 min | 7.2 min |
| PR: database migration step | 45 to 60 s | under 5 s |
| Master: Build | 16.1 min | 7.2 min on a cold cache, 5.3 min on the next run |
| Master: Docker image starts after | 16.1 min | about 6 to 7 min |

To be fair to the split, it didn't do most of that. Those minutes came from deleting duplicate work. But per-crate test builds measured in seconds are what made a 16-minute master build look absurd enough to go after.

What this doesn't show yet is whether mutants back in the loop now pays for itself. Nothing has run with them on since the split. The next test is one real PR with the controller running mutants in the background beside the task review, measured against the 402k and 11-minute baseline, plus CI's first labeled run since the split. Scaling the old runner-to-local ratio puts a full CI run near 100 runner-hours, down from 266, but until a labeled PR runs that's an extrapolation. That test gets its own follow-up post.

## Testing / Data Collection Methodology

A script reads my Claude Code subagent transcripts (usage numbers and tool-call inputs only) and the local cargo-mutants output, and writes per-run CSVs. Hand sabotage is a heuristic, so it's given as a range: the lower bound counts commands that say they sabotage plus Edit-then-undo pairs; the upper bound adds every `sed -i`, `git stash`, revert or restore and the test run after it. PR 2's tasks were big mechanical refactors, so compare shares within an era, not raw medians across eras. The 25% re-cache in the hand era is real, from long builds and test runs; mutants doubled it rather than creating it. A few runs used a larger model; single-model numbers are within a point or two. The mutants era is small: 22 runs against 56.

## What I'd tell anyone running agents against slow jobs

- Know your cache TTL. Five minutes for a subagent changes how every wait should be built.
- Don't make an expensive context wait on a long job. Put the job where waiting is free.
- Fixes to an agent that is already running are suggestions. Change where the work runs, not what you ask it to do.
- Add up the cost of a check before you make it the only gate. Ours was invisible until I did the arithmetic.
- Mutation testing earns its keep as a reviewer's tool on a diff. As a full, everywhere gate on a monolith, it ate the budget.

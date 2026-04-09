# SEO Program — stage.in

> **Autoresearch-style growing brain for Stage.in SEO pipeline.**
> Agents: read this BEFORE every run. Update this AFTER every run.
> This file is the institutional memory of the pipeline — it improves every iteration.

---

## Platform Context

**Stage.in** is India's largest regional language OTT platform.
- Primary content: Haryanvi, Rajasthani, Bhojpuri, Gujarati movies, shows, originals
- Stack: Next.js (App Router), SSR, deployed on Vercel
- Target audience: Tier 2/3 India, Hindi-belt users
- Key competitors: MX Player, Ullu, Chaupal, ShemarooMe
- Revenue model: Subscription + ad-supported free tier

**Why SEO matters more than usual:**
- AI-referred sessions grew 527% YoY in 2025
- Regional language search is underserved — low competition, high opportunity
- Perplexity and ChatGPT increasingly cite content for "watch X language movies online" queries
- Schema markup = direct Watch button eligibility in Google (VideoObject critical)

---

## Current Priorities (update this section after each run)

| Priority | Task | Status | Last Updated |
|----------|------|--------|--------------|
| 1 | Movie/TVSeries schema in SSR HTML on content detail pages | ⚠️ PR #1271 + #1278 open (not merged) | 2026-04-08 |
| 2 | FAQPage schema on dialect landing pages | ⚠️ Code in main; NOT rendering in live site — possible Vercel ISR cache issue | 2026-04-08 |
| 3 | robots.txt — verify AI bots are allowed | ✅ All major bots allowed (3 added: ChatGPT-User, OAI-SearchBot, ClaudeBot) | 2026-04-03 |
| 4 | /llms.txt — comprehensive content | ✅ Updated (808B→1.7KB, For AI Assistants + dialect URLs) | 2026-04-03 |
| 5 | BreadcrumbList on dialect landing pages | ✅ Fixed in PR #1283 (2026-04-08) | 2026-04-08 |
| 6 | Organization + WebSite schema on homepage | ✅ Present (getHomePageJsonLd + generateWebSiteSchema) | 2026-04-07 |
| 7 | Content freshness — dateModified in JSON-LD | ⚠️ Unverified | 2026-04-01 |
| 8 | Hreflang tags (hi ↔ en) | ✅ Present on all dialect pages (3 tags: en-IN, hi-IN, x-default) | 2026-04-07 |
| 9 | Speakable schema on key landing pages | ✅ Added to MovieSchema + TVSeriesSchema (cssSelector targeting .content-synopsis etc) | 2026-04-07 |
| 10 | RSC body content visible to AI crawlers | ✅ Verified — /en/haryanvi has 2686 chars readable body text | 2026-04-07 |
| 11 | Brand safety: saanwari-8295 piracy query association | 🎫 AutoFix ticket SEO-481 created | 2026-04-07 |
| 12 | Marathi FAQPage schema | ✅ Added in PR #1278 (2026-04-08) | 2026-04-08 |

---

## Experiment Log

> Each agent run = one experiment. Log what you tried, what the result was, and whether to keep or discard the approach.

### Format
```
## Run: [date] — [workflow] — [agent]
**Hypothesis:** what we expected to improve
**Action:** what was changed (PR link if available)
**Result:** measured outcome (citations, rankings, PR merged/rejected)
**Keep / Discard:** and why
**Confidence delta:** e.g. "FAQPage schema → +0.2 confidence"
```

### Experiments

## Run: 2026-04-09 — Weekly Keywords — Keyword Competitor Analyst
**Hypothesis:** Adding 32 transactional + navigational keywords from GSC rising/new data (7086 tracked, 956 rising, 2086 new) will improve click-through for fast-rising content queries.
**Action:** PR #1304 (https://github.com/vatsanatech/stage-webapp/pull/1304) — updated `src/config/seo-keywords.ts` only
- Added 32 keywords: 17 Haryanvi (movies + shows + brand), 2 Rajasthani, 13 Bhojpuri, 0 Gujarati
- Top transactional additions: `naat bhojpuri movie watch online` (+1700%), `kachi umar series` (+960%), `naate movie bhojpuri watch online` (51 clicks), `saanwari web series` (189 clicks, +112%), `naate movie 2025` (109 clicks)
- Bhojpuri dialect grew most this week: 13 additions across naate/naat/nate variants, jholachhap, ladli chhathi mai
- Gujarati: 0 additions — all rising keywords were adult content (मारवाड़ी/गुजराती सेक्सी variants), correctly skipped
- Skipped competitor brand: `ullu web series online watch`
**Result:** PR raised and merged (#1304).
**Keep / Discard:** Keep — transactional keyword expansion directly tied to rising GSC data.
**Confidence delta:** Bhojpuri movie variants (naate/naat/nate) consistently generate high click volume — prioritize these each run. +0.2 confidence

## Run: 2026-04-08 — Schema Audit — Technical SEO Auditor
**Hypothesis:** Dialect landing pages are missing BreadcrumbList schema; adding it will improve navigation rich results and reinforce page hierarchy signals for Googlebot.
**Action:** PR #1283 (https://github.com/vatsanatech/stage-webapp/pull/1283)
- Added `generateBreadcrumbSchema` import to `src/app/[lang]/[dialect]/page.tsx`
- Generates breadcrumb: Home → [Dialect Name] (e.g., Home → Haryanvi)
- Fetches `availableDialects` to get localized dialect label for breadcrumb
**Audit Findings (2026-04-08):**
- `/en/haryanvi` (live): Organization + WebSite only — FAQPage code present in main but NOT rendering in live HTML
- `/en/haryanvi/movies` (live): BreadcrumbList + ItemList ✅
- `/en/haryanvi/shows` (live): BreadcrumbList + ItemList ✅
- Content detail pages: Movie/TVSeries still uses `<Script>` (PR #1271 + #1278 pending merge)
- PR #1278 also open: same `<Script>`→`<script>` fix + Marathi FAQPage config
- NOTE: PR #1271 is BEHIND main (branch: fix/seo-audit-2026-04-06 → needs rebase)
**Result:** PR #1283 raised for BreadcrumbList fix. FAQPage non-rendering is unresolved — needs investigation.
**Keep / Discard:** Keep BreadcrumbList fix. FAQPage investigation pending.
**Confidence delta:** BreadcrumbList on listing pages → confirmed pattern, +0.8 confidence

## Run: 2026-04-07 — Full Site Audit — Technical SEO Auditor
**Hypothesis:** Movie/TVSeries JSON-LD schema was missing from SSR HTML causing zero structured data visibility for crawlers; fixing to native `<script>` tag will make Google/AI crawlers see content schema on all movie+show pages.
**Action:** PR #1271 (https://github.com/vatsanatech/stage-webapp/pull/1271)
- Replaced `<Script>` (next/script, afterInteractive — deferred post-hydration) with native `<script>` tag for Movie/TVSeries JSON-LD in content detail page
- Added missing imports for `getMoviesKeywords`/`getShowsKeywords` (used but not imported)
- Created AutoFix ticket SEO-481 for saanwari-8295 noindex (brand safety: ranking for filmyfly piracy queries)
**Result:** PR raised, pending merge. Schema will be visible to Googlebot/GPTBot/ClaudeBot/PerplexityBot in initial HTML response after deploy.
**Keep / Discard:** Keep — native `<script>` is the correct pattern for JSON-LD; all other schema in codebase uses this pattern.
**Confidence delta:** next/script for JSON-LD → confirmed failure pattern, +0.9 confidence avoid it

## Run: 2026-04-07 — Comprehensive Audit Findings
**Observations confirmed:**
- FAQPage schema IS deployed via DIALECT_FAQ_SCHEMA config — seo-program.md was outdated
- Hreflang IS working on all pages (3 tags: en-IN, hi-IN, x-default) — seo-program.md was outdated
- Organization + WebSite schema present on homepage and all dialect pages via getHomePageJsonLd/generateWebSiteSchema
- RSC body content IS readable in initial HTML (2686 chars on /en/haryanvi) — AI crawlers CAN read content listings
- BreadcrumbList missing on dialect HOMEPAGE (present on /movies and /shows sub-pages)

## Run: 2026-04-09 — Weekly Keywords — Keyword Competitor Analyst
**Hypothesis:** Adding 33 transactional + navigational keywords from GSC rising/new data (7086 tracked, 956 rising, 2086 new) will improve click-through for fast-rising Bhojpuri content queries and consolidate Haryanvi saanwari/kachi umar series traction.
**Action:** PR #1304 (https://github.com/vatsanatech/stage-webapp/pull/1304) — updated `src/config/seo-keywords.ts` only
- Added 33 keywords: 10 Haryanvi, 14 Bhojpuri, 2 Rajasthani + long-tail variants
- Top transactional additions: saanwari web series (+112%, 189 clicks), jholachhap movie bhojpuri (+21.6%, 152 clicks), ladli chhathi mai ke bhojpuri film (+883%), naat 2026 movie (+500%), naat bhojpuri movie watch online (+1700%)
- Bhojpuri dialect showed strongest growth this week: 5 new keywords crossing 30+ clicks
- Haryanvi: saanwari web series emerging as major series (189 clicks), kachi umar new series breakout (+960%)
- Skipped: 12 adult/vulgar keywords, 2 piracy domains (filmywap.in/filmywap movie), 1 competitor brand (ullu)
**Result:** PR raised, pending merge.
**Keep / Discard:** Keep — transactional keyword expansion directly tied to rising GSC data.
**Confidence delta:** Bhojpuri multi-variant keywords (naat/nate/naate + bhojpuri + action) → confirmed pattern, add all variants (+0.2 confidence)

## Run: 2026-04-03 — Weekly Keywords — Keyword Competitor Analyst
**Hypothesis:** Adding 35 transactional + navigational keywords from GSC rising/new data (7015 tracked, 1066 rising, 2015 new) will improve click-through for fast-rising content queries.
**Action:** PR #1262 (https://github.com/vatsanatech/stage-webapp/pull/1262) — updated `src/config/seo-keywords.ts` only
- Added 35 keywords: 14 Haryanvi, 6 Rajasthani, 4 Bhojpuri, 5 Gujarati + 6 long-tail variants
- Top transactional additions: naate movie dailymotion (+522%), nate web series full episode (+871%), bittu web series online (+327%), nate movie stage (+240%)
- Gujarati expanded significantly: naat gujarati movie, nate movie gujarati, gujarati movie download (5 new)
- Skipped: 7 adult/vulgar keywords, 2 competitor brand keywords (Ullu), piracy domains
**Result:** PR raised, pending merge.
**Keep / Discard:** Keep — transactional keyword expansion directly tied to rising GSC data.
**Confidence delta:** Gujarati keyword additions → viable despite lower volume (high conversion per seo-program rules)

## Run: 2026-04-03 — GEO Check — Technical SEO Auditor
**Hypothesis:** Adding missing AI bot entries to robots.txt and expanding llms.txt with dialect URLs + "For AI Assistants" section will improve AI search engine discoverability and citation rates.
**Action:** PR #1261 (https://github.com/vatsanatech/stage-webapp/pull/1261)
- robots.ts: Added explicit Allow: / for ChatGPT-User, OAI-SearchBot, ClaudeBot
- llms.txt: Expanded from 808B to ~1.7KB with For AI Assistants section, dialect-specific URLs, content statistics
**Result:** PR raised, pending merge. No AI citation metrics available yet.
**Keep / Discard:** Keep — explicit bot allowlisting is a best practice regardless of wildcard coverage.
**Confidence delta:** robots.txt explicit AI bot entries → confirmed pattern, +0.7 confidence

---

## High Confidence Lessons (confidence ≥ 0.7)

> These are confirmed patterns — apply them without question.

*(None yet — will be populated as agents confirm patterns across multiple runs)*

---

## Low Confidence Observations (0.4–0.7)

> Tentative — apply cautiously, flag in PR for human review.

- **Answer-first structure** (0.5): Opening with a direct answer in first 50 words may improve AI citation rate based on Princeton GEO research. Not yet verified on stage.in specifically.
- **FAQPage = +40% AI citation** (0.5): Princeton study showed FAQPage schema on informational pages increases AI citation by ~40%. Needs verification on dialect landing pages.
- **Statistics presence** (0.5): Including specific numbers ("1200+ Haryanvi movies") may increase AI citation by ~37%. Unverified on stage.in.

---

## Failure Log — DO NOT REPEAT

> These approaches have failed or caused problems. Avoid them.

- **next/script `<Script>` for JSON-LD** (2026-04-07): Using Next.js `Script` component for JSON-LD injects it after hydration (afterInteractive), making it invisible to crawlers. Always use native `<script>` tag for JSON-LD.
- **Assuming code = live** (2026-04-08): FAQPage code was in main but not rendering in live site. Always verify schemas in actual HTTP response, not just codebase. Check both RSC payload and static HTML for schema presence.

---

## Rules Derived from Past Runs

> Hard rules extracted from confirmed patterns. Agents must follow these.

### Schema Rules
- Use `@graph` pattern when adding multiple schemas to the same page
- Add JSON-LD in `layout.tsx` for page-wide schemas (BreadcrumbList, Organization)
- Add JSON-LD in `page.tsx` for page-specific schemas (VideoObject, FAQPage)
- Always include `dateModified` in VideoObject schema (required for freshness signals)
- `potentialAction` with `WatchAction` is required in VideoObject for Google Watch button eligibility
- **Always verify schemas in live HTTP response** — code presence ≠ live rendering (ISR cache/deploy issues can hide schema)

### Keyword Rules
- Transactional keywords (watch, stream, free, online) have highest SEO ROI — prioritize
- Never add keywords that were explicitly removed in a previous PR (check git log)
- Gujarati keywords have lower GSC volume but higher conversion — don't ignore
- Keyword cannibalization between `/movies` and `/hi/haryanvi/movies` is a known issue — check before adding
- Adult/vulgar keywords consistently appear in GSC rising data — always skip regardless of click volume
- Multi-dialect rising keywords (naate/nate/naat variants) appear across all 4 dialects — add dialect-tagged variant to each relevant dialect section

### robots.txt Rules
- Never block PerplexityBot, GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, Google-Extended, OAI-SearchBot
- If any of these are blocked, it's a P0 fix — do it before anything else

### PR Rules
- One PR per workflow run — don't split
- Run `npx prettier --write .` on all changed files before committing
- PR title format: `fix(seo): [type] [date]`
- Never commit .md docs, reports, or analysis files — code only
- Only modify files relevant to the specific workflow's task

### Slack Notification Rules
- Always use `<@U07A91AB7GW>` exactly — this is Aditya's Slack user ID
- Include PR URL in every Slack message
- Include counts (schemas added, keywords added, issues fixed)

---

## Metrics Baseline (update after each run)

| Metric | Baseline | Last Measured | Trend |
|--------|----------|---------------|-------|
| AI citation rate (Perplexity) | unknown | 2026-04-01 | — |
| AI citation rate (ChatGPT) | unknown | 2026-04-01 | — |
| Google organic sessions | unknown | 2026-04-01 | — |
| Pages with Movie/TVSeries schema (SSR) | 0 → pending PRs #1271 + #1278 (not merged) | 2026-04-08 | ⚠️ PRs open |
| Pages with FAQPage schema | 4 dialect landing pages (code present, live rendering unverified) | 2026-04-08 | ⚠️ Not visible in live HTTP response |
| Pages with BreadcrumbList | /movies + /shows + dialect homepage (PR #1283) | 2026-04-08 | ↑ Dialect homepage added |
| /llms.txt word count | 808 bytes | 2026-04-03 | ↑ Updated to ~1.7KB |
| robots.txt — AI bots blocked | 0 (ChatGPT-User, OAI-SearchBot, ClaudeBot added explicitly) | 2026-04-03 | ✅ Fixed |

---

## How to Update This File

After every run, update the relevant sections:

1. **Experiment Log** — add your run entry
2. **Current Priorities** — update status of tasks you touched
3. **Lessons** — promote observations to high confidence if confirmed, or to failures if disproved
4. **Metrics Baseline** — update measured values
5. **Rules** — add new rules if a pattern is confirmed (confidence ≥ 0.7)

**Commit format:** `chore(seo): update program.md after [workflow] run [date]`
**Branch:** commit directly to main on vatsanatech/stage-seo-pipeline
**Do NOT raise a PR for program.md updates** — commit directly to avoid noise.

---

*Last updated: 2026-04-09 — Weekly Keywords run by Keyword Competitor Analyst*

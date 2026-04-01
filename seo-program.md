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
| 1 | VideoObject schema on all /watch/* pages | ❌ Missing | 2026-04-01 |
| 2 | FAQPage schema on all 4 dialect landing pages | ❌ Missing | 2026-04-01 |
| 3 | robots.txt — verify AI bots are allowed | ⚠️ Unverified | 2026-04-01 |
| 4 | /llms.txt — comprehensive content | ⚠️ Exists but basic | 2026-04-01 |
| 5 | BreadcrumbList on all pages | ❌ Missing | 2026-04-01 |
| 6 | Organization + WebSite schema on homepage | ❌ Missing | 2026-04-01 |
| 7 | Content freshness — dateModified in JSON-LD | ⚠️ Unverified | 2026-04-01 |
| 8 | Hreflang tags (hi ↔ en) | ❌ Missing | 2026-04-01 |
| 9 | Speakable schema on key landing pages | ❌ Missing | 2026-04-01 |

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

*(No runs yet — first entry will be logged by the next agent run)*

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

*(None yet — agents add entries here when something goes wrong)*

---

## Rules Derived from Past Runs

> Hard rules extracted from confirmed patterns. Agents must follow these.

### Schema Rules
- Use `@graph` pattern when adding multiple schemas to the same page
- Add JSON-LD in `layout.tsx` for page-wide schemas (BreadcrumbList, Organization)
- Add JSON-LD in `page.tsx` for page-specific schemas (VideoObject, FAQPage)
- Always include `dateModified` in VideoObject schema (required for freshness signals)
- `potentialAction` with `WatchAction` is required in VideoObject for Google Watch button eligibility

### Keyword Rules
- Transactional keywords (watch, stream, free, online) have highest SEO ROI — prioritize
- Never add keywords that were explicitly removed in a previous PR (check git log)
- Gujarati keywords have lower GSC volume but higher conversion — don't ignore
- Keyword cannibalization between `/movies` and `/hi/haryanvi/movies` is a known issue — check before adding

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
| Pages with VideoObject schema | 0 | 2026-04-01 | — |
| Pages with FAQPage schema | 0 | 2026-04-01 | — |
| Pages with BreadcrumbList | 0 | 2026-04-01 | — |
| /llms.txt word count | unknown | 2026-04-01 | — |
| robots.txt — AI bots blocked | unknown | 2026-04-01 | — |

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

*Last updated: 2026-04-01 — Initial bootstrap*

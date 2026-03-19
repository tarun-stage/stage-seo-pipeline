# Stage SEO Pipeline

Fully autonomous SEO optimization pipeline for [Stage.in](https://stage.in) — detects issues, analyzes competitors, auto-fixes code, and tracks ROI. Zero paid SEO APIs required.

## Why Use This?

- **Fully automated** — Detect → Analyze → Fix → Track runs on a schedule with no manual intervention
- **Zero paid APIs** — Uses Google Search Console (free), CommonCrawl (free), and DuckDuckGo SERP scraping instead of expensive SEO tools like Ahrefs or SEMrush
- **Indian dialect awareness** — Built-in detection for Haryanvi, Rajasthani, Bhojpuri, and Gujarati keyword variations
- **OTT competitor tracking** — Hardcoded benchmarking against MX Player, JioCinema, Zee5, SonyLIV, and Hotstar
- **Safe auto-fixes** — TypeScript validation before every fix, automatic GitHub PRs (never pushes to main), stale PR cleanup
- **AI search ready** — Generates `llms.txt` for AI crawlers, FAQ schemas, and GEO/AEO scoring
- **ROI measurement** — Before/after GSC metrics comparison with Slack alerts on significant changes
- **Slack alerts** — Real-time notifications for keyword drops, CTR lifts, and pipeline status

## Architecture

```
Detect (site-crawler, gsc-keyword-tracker)
  → Analyze (competitor-gap-analyzer, backlink-analyzer, internal-link-graph)
    → Fix (auto-fix-pipeline)
      → Track (impact-tracker)
```

## Packages

| Package | Description |
|---------|-------------|
| `site-crawler` | Playwright-based site crawler, Core Web Vitals, image SEO, mobile usability, JS rendering, duplicate content, sitemap validation |
| `gsc-keyword-tracker` | Google Search Console keyword tracking, dialect detection, trend analysis, Slack alerts, SerpBear sync |
| `internal-link-graph` | Internal link graph analysis with PageRank/HITS algorithms, orphan page detection, link suggestions |
| `backlink-analyzer` | CommonCrawl backlink analysis, competitor backlink gap, link opportunity finder |
| `competitor-gap-analyzer` | SERP tracking, content gap detection, brand mention monitoring |
| `auto-fix-pipeline` | Auto-fix with TypeScript validation, GitHub PR creation, GEO/link deployers, scheduler |
| `seo-pipeline-db` | Shared SQLite database schema (8 tables) and repository layer |
| `impact-tracker` | Before/after GSC metrics comparison, ROI scoring, Slack reports |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9 (uses npm workspaces)
- **Playwright browsers** (installed automatically by site-crawler)

### Install

```bash
git clone https://github.com/tarunsahnan/stage-seo-pipeline.git
cd stage-seo-pipeline
npm install
```

### Build

```bash
npm run build          # builds all packages
npm run test           # runs tests across all packages
```

### Environment Variables

Create a `.env` file in the root or export these variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GSC_SITE_URL` | Yes | — | Your Google Search Console site URL (e.g. `https://stage.in`) |
| `GSC_SERVICE_ACCOUNT_KEY` | Conditional | — | Inline JSON service account key (alternative to `GSC_KEY_PATH`) |
| `GSC_KEY_PATH` | Conditional | — | Path to service account JSON key file |
| `GSC_CLIENT_ID` | Conditional | — | OAuth client ID (alternative to service account) |
| `GSC_CLIENT_SECRET` | Conditional | — | OAuth client secret |
| `GSC_REFRESH_TOKEN` | Conditional | — | OAuth refresh token |
| `GITHUB_TOKEN` | For auto-fix | — | GitHub personal access token for PR creation |
| `SLACK_WEBHOOK_URL` | No | — | Slack incoming webhook for alerts |
| `SLACK_CHANNEL` | No | `#seo-alerts` | Slack channel name |

For GSC authentication, provide **either** a service account key (recommended) **or** OAuth credentials.

### Quick Start — Run Each Stage

**1. Crawl your site (Detect)**
```bash
cd packages/site-crawler
npm run build
npm run crawl -- https://stage.in --max-pages 500 --concurrency 3
```

**2. Track keywords from GSC (Detect)**
```bash
cd packages/gsc-keyword-tracker
npm run build
npm run track             # requires GSC credentials
npm run track -- --demo   # or use demo mode with synthetic data
```

**3. Analyze internal links**
```bash
cd packages/internal-link-graph
npm run build
npm run analyze
```

**4. Analyze competitor gaps**
```bash
cd packages/competitor-gap-analyzer
npm run build
npm run analyze -- --dry-run   # test without live SERP scraping
```

**5. Analyze backlinks**
```bash
cd packages/backlink-analyzer
npm run build
npm run analyze
```

**6. Run auto-fix pipeline**
```bash
cd packages/auto-fix-pipeline
npm run build
npm run run-pipeline       # one-shot fix run
npm start                  # full scheduled pipeline (fix + GEO deploy + link deploy)
```

**7. Track impact**
```bash
cd packages/impact-tracker
npm run register -- https://stage.in/page "Fixed meta tags" 2026-03-19
npm run check-ready        # check which fixes are ready for measurement
npm run track              # measure impact (after 7+ days)
npm run report             # generate ROI summary
```

## Hosting & Deployment

This pipeline is a collection of **CLI tools** designed to run on a schedule. There is no web server to deploy — you schedule each package's commands via cron, systemd timers, or a CI/CD pipeline.

### Where to Host

| Option | Best For | Cost |
|--------|----------|------|
| **Your own VPS** (DigitalOcean, Hetzner, AWS EC2) | Full control, persistent SQLite databases, lowest latency | $5–20/mo |
| **GitHub Actions** (scheduled workflows) | Zero-infra, free for public repos, 2000 min/mo free for private | Free–$4/mo |
| **Railway / Render cron jobs** | Easy setup, managed, no server management | $5–10/mo |
| **Self-hosted server** (home lab, office server) | Maximum privacy, no cloud costs | Electricity only |

### Recommended: GitHub Actions (Simplest)

Create `.github/workflows/seo-pipeline.yml`:

```yaml
name: SEO Pipeline
on:
  schedule:
    - cron: '0 2 * * *'    # daily at 2 AM UTC
  workflow_dispatch:         # manual trigger

jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - run: cd packages/site-crawler && npm run crawl -- https://stage.in --max-pages 500
      - run: cd packages/gsc-keyword-tracker && npm run track
    env:
      GSC_SITE_URL: ${{ secrets.GSC_SITE_URL }}
      GSC_SERVICE_ACCOUNT_KEY: ${{ secrets.GSC_SERVICE_ACCOUNT_KEY }}
      SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  analyze:
    needs: detect
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - run: cd packages/internal-link-graph && npm run analyze
      - run: cd packages/competitor-gap-analyzer && npm run analyze
      - run: cd packages/backlink-analyzer && npm run analyze

  fix:
    needs: analyze
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - run: cd packages/auto-fix-pipeline && npm run run-pipeline
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Alternative: Cron on a VPS

```bash
# Add to crontab (crontab -e)

# Crawl daily at 2 AM
0 2 * * * cd /opt/stage-seo-pipeline && npm run build && cd packages/site-crawler && npm run crawl -- https://stage.in

# Track keywords every 6 hours
0 */6 * * * cd /opt/stage-seo-pipeline/packages/gsc-keyword-tracker && node dist/cli.js track

# Run auto-fix daily at 4 AM
0 4 * * * cd /opt/stage-seo-pipeline/packages/auto-fix-pipeline && node dist/pipeline/runner.js

# Weekly impact report on Mondays
0 9 * * 1 cd /opt/stage-seo-pipeline/packages/impact-tracker && npm run report
```

### Data Persistence

- **SQLite databases** (`.db` files) are created automatically per package — back them up regularly
- **Impact tracker** uses JSON files in `data/` directory
- All data files are `.gitignore`d — they stay on your host, not in the repo

## Stack

- TypeScript / Node.js (ES2022)
- Playwright (headless browser crawling)
- SQLite via sql.js (in-memory + file persistence, WAL mode)
- Google Search Console API (keyword & CTR data)
- CommonCrawl Index API (backlink discovery)
- Slack Incoming Webhooks (alerts & reports)
- GitHub API (automated PR creation)

## License

PRIVATE

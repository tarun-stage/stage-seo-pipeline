# SEO Pipeline — CLAUDE.md
# SEO CEO · Stage.in SEO Orchestrator

## About Stage.in

STAGE is India's largest regional OTT platform serving Haryanvi, Rajasthani, Bhojpuri, and Gujarati audiences. SEO drives organic discovery of 2000+ movies and web series.

## Multi-Agent Architecture

This pipeline runs 12 specialized agents in Paperclip. Each agent runs on heartbeat (no GitHub Actions required).

```
                         ┌─────────────────┐
                         │       CEO       │ ← orchestrates everything
                         └────────┬────────┘
                                  │ creates issues
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ DETECT AGENTS   │  │ FIX AGENTS      │  │ TRACK AGENTS    │
    ├─────────────────┤  ├─────────────────┤  ├─────────────────┤
    │ Technical       │  │ AutoFix Deploy  │  │ SEO Reporting   │
    │  SEO Auditor    │  │  Engineer       │  │  Compiler       │
    │                 │  │                 │  │                 │
    │ Schema          │  │ Editorial       │  │ SEO Workflow    │
    │  Optimizer      │  │  Content Writer │  │  Researcher     │
    │                 │  └─────────────────┘  └─────────────────┘
    │ Page Speed      │
    │  Optimizer      │
    │                 │
    │ Indexation      │
    │  Crawl Manager  │
    │                 │
    │ Keyword         │
    │  Competitor     │
    │  Analyst        │
    │                 │
    │ Entity SEO      │
    │  Manager        │
    │                 │
    │ Content         │
    │  Freshness      │
    │  Analyst        │
    └─────────────────┘
```

## Agent Instruction Files

Each agent reads its own CLAUDE.md from this repo:

| Agent | Instructions File |
|-------|------------------|
| CEO | `seo/agents/ceo/CLAUDE.md` |
| Technical SEO Auditor | `seo/agents/technical-auditor/CLAUDE.md` |
| Content Schema Optimizer | `seo/agents/schema-optimizer/CLAUDE.md` |
| Page Speed Optimizer | `seo/agents/page-speed/CLAUDE.md` |
| Indexation Crawl Manager | `seo/agents/indexation/CLAUDE.md` |
| AutoFix Deploy Engineer | `seo/agents/autofix/CLAUDE.md` |
| Keyword Competitor Analyst | `seo/agents/keyword-analyst/CLAUDE.md` |
| Entity SEO Manager | `seo/agents/entity-seo/CLAUDE.md` |
| Content Freshness Analyst | `seo/agents/content-freshness/CLAUDE.md` |
| SEO Reporting Compiler | `seo/agents/reporting/CLAUDE.md` |
| Editorial Content Writer | `seo/agents/content-writer/CLAUDE.md` |
| SEO Workflow Researcher | `seo/agents/seo-researcher/CLAUDE.md` |
| ASO Specialist | `aso/CLAUDE.md` |

## GSC MCP Server

The Google Search Console MCP server is available in this agent environment.

```bash
npx -y gsc-mcp-server
# or check: claude mcp list
```

**20 tools available:** site_snapshot, quick_wins, content_gaps, traffic_drops, ctr_opportunities, cannibalisation_check, content_decay, url_inspection, topic_clusters, ctr_vs_benchmarks, advanced_search_analytics, check_alerts, verify_claim, content_recommendations, generate_report, multi_site_dashboard, submit_url, submit_batch, submit_sitemap, list_sitemaps

## Heartbeat Schedule (Recommended)

| Agent | Frequency | Day/Time |
|-------|-----------|----------|
| CEO | Every 6 hours | Always |
| Technical SEO Auditor | Daily | 10 AM IST |
| Schema Optimizer | Weekly | Mon |
| Page Speed Optimizer | Weekly | Mon |
| Indexation Crawl Manager | Daily | 11 AM IST |
| AutoFix Deploy Engineer | Every 6 hours | Always |
| Keyword Competitor Analyst | Weekly | Mon |
| Entity SEO Manager | Weekly | Wed |
| Content Freshness Analyst | Weekly | Tue |
| SEO Reporting Compiler | Weekly | Mon 8 AM IST |
| Editorial Content Writer | Daily | 9 AM IST |
| SEO Workflow Researcher | Weekly | Fri |

## Issue Routing Convention

All inter-agent communication uses Paperclip issues with prefix routing:

| Prefix | Assigned To |
|--------|-------------|
| `[CEO]` | CEO agent |
| `[AutoFix]` | AutoFix Deploy Engineer |
| `[Editorial]` | Editorial Content Writer |
| `[Schema]` | Content Schema Optimizer |
| `[Technical]` | Technical SEO Auditor |
| `[Indexation]` | Indexation Crawl Manager |

## Projects in Paperclip

| Project | Purpose |
|---------|---------|
| Technical SEO Audit Pipeline | Crawl errors, redirects, robots, indexation |
| Keyword & Competitor Intelligence | Rankings, gaps, competitor analysis |
| Content & Schema Optimization | JSON-LD schemas, dialect pages, blog content |
| Auto-Fix & Deployment Pipeline | PRs, code fixes, deployments |
| Stage Webapp SEO Fixes | Tracked fixes on vatsanatech/stage-webapp |

## Environment Variables (All Agents)

- `GITHUB_TOKEN` — GitHub API + git push
- `SLACK_WEBHOOK_URL` — seo-autopilot Slack channel
- `GSC_SERVICE_ACCOUNT_KEY` — base64 GSC service account JSON
- `GSC_SITE_URL` — `sc-domain:stage.in`
- `PAGESPEED_API_KEY` — Google PageSpeed Insights API
- `BRAVE_SEARCH_API_KEY` — Brave Search API (for research)
- `GOOGLE_KG_API_KEY` — Knowledge Graph Search API
- `PAPERCLIP_API_BASE` — injected automatically at runtime
- `PAPERCLIP_API_KEY` — injected automatically at runtime

## Git Workflow

Repo at `/paperclip/stage-seo-pipeline`. Webapp at `/paperclip/stage-webapp`.

Never push directly to main. Feature branches: `feature/seo-<topic>-YYYY-MM-DD`

```bash
cd /paperclip/stage-seo-pipeline
git status && git log --oneline -5
```

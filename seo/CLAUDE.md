# SEO Pipeline — CLAUDE.md

This directory contains the SEO automation pipeline for stage.in.

## About This Project

STAGE is a regional OTT platform (Haryanvi, Rajasthani, Bhojpuri). SEO pipeline ensures stage.in ranks well for regional content keywords.

## GSC MCP Server — Available Tools

The Google Search Console MCP server is available for direct use in this agent environment.

To use it, run:
```bash
npx -y gsc-mcp-server
```

Or it may already be registered. Check with:
```bash
claude mcp list
```

**20 tools available:**

### Analysis
- `site_snapshot` — overall performance vs previous period
- `quick_wins` — keywords at positions 4-15 with high impressions
- `content_gaps` — topics with impressions but ranking beyond position 20
- `traffic_drops` — pages that lost traffic with diagnosis
- `ctr_opportunities` — pages with CTR below benchmark for position
- `cannibalisation_check` — keywords where multiple pages compete
- `content_decay` — pages with 3 consecutive months of traffic decline
- `url_inspection` — indexing status, crawl info, canonical issues
- `topic_clusters` — performance of all pages under a URL path
- `ctr_vs_benchmarks` — actual CTR vs industry averages by position
- `advanced_search_analytics` — custom queries with flexible dimensions

### Monitoring
- `check_alerts` — position drops, CTR collapses, pages disappeared
- `verify_claim` — re-queries API to confirm numbers before presenting

### Reporting
- `content_recommendations` — cross-references quick wins, gaps, cannibalisation
- `generate_report` — full markdown performance report
- `multi_site_dashboard` — health check across all properties

### Indexing API
- `submit_url` — send URL to Google's Indexing API
- `submit_batch` — submit up to 200 URLs at once
- `submit_sitemap` — notify Google of sitemap updates
- `list_sitemaps` — see all sitemaps with error counts

## Automated Workflows (GitHub Actions → Paperclip Issues)

These run on schedule and assign tasks to this agent:

| Workflow | Schedule | What it does |
|----------|----------|--------------|
| `seo-site-audit.yml` | Daily | Full site audit, crawl issues |
| `seo-weekly-keyword-analysis.yml` | Weekly Mon | Keyword ranking analysis |
| `seo-content-keywords-refresh.yml` | Weekly | Content + keyword refresh |
| `seo-pipeline-ott-improvements.yml` | Weekly | OTT-specific improvements |
| `seo-traffic-drop-diagnosis.yml` | Weekly Mon 8AM IST | Traffic drops with WHY diagnosis (ranking/CTR/demand) |
| `seo-content-decay.yml` | Monthly 1st | Pages with 3-month consecutive decline |
| `seo-cannibalisation-check.yml` | Weekly Wed | Pages competing for same keywords |
| `seo-ctr-benchmarks.yml` | Weekly Fri | CTR vs industry benchmarks by position |
| `seo-url-indexing.yml` | On demand | Submit URLs to Google Indexing API |
| `seo-sitemap-resubmit.yml` | On sitemap change | Notify Google of sitemap updates |

## When You Get a Task

### Traffic Drop Diagnosis Task
- Review the diagnosis (Ranking Loss / CTR Collapse / Demand Decline)
- **Ranking Loss** → improve content quality, add internal links, check backlinks
- **CTR Collapse** → rewrite title tag and meta description for that page
- **Demand Decline** → update content angle or pivot to related topic with more demand

### Content Decay Task
- Pages are dying slowly — need content refresh
- Update with new information, better keywords, improved structure
- Consider consolidating with similar pages

### Cannibalisation Task
- Two pages competing for same keyword
- Either: merge them into one stronger page, or differentiate their keyword targets
- Use 301 redirect from weaker to stronger if merging

### CTR Benchmark Task
- Page has good ranking but low click rate
- Fix: rewrite title to be more compelling, update meta description
- Add numbers, questions, or power words to title

### URL Indexing Task
- Submit fixed/updated URLs immediately after changes
- Use `submit_url` MCP tool or trigger `seo-url-indexing.yml` workflow

## Git Workflow

Repo is at `/paperclip/stage-seo-pipeline`.

```bash
cd /paperclip/stage-seo-pipeline
git status
git log --oneline -5
```

**Never push to main directly.** Use feature branches: `feature/seo-update-YYYY-MM-DD`

## Environment Variables

- `GITHUB_TOKEN` — GitHub API access
- `SLACK_WEBHOOK_URL` — seo-autopilot channel
- `GSC_SERVICE_ACCOUNT_KEY` — Google Search Console service account (base64)
- `GSC_SITE_URL` — e.g. `sc-domain:stage.in`
- `PAPERCLIP_API_BASE` — Paperclip API endpoint

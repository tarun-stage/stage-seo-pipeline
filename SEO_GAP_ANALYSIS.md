# Stage SEO Pipeline — Gap Analysis & Action Plan
**Generated:** 2026-04-01  
**Source:** Full pipeline analysis + OTT SEO research  
**Status:** Session 1 done — picking up from here

---

## ✅ What's Already Done (Today's Session)

| # | What | Where | Status |
|---|------|--------|--------|
| 1 | SSR Diff Check wired | `crawler.ts` + `runner.ts` | Workflow created (PR#3, merged to main) |
| 2 | OTT Schema Type Check (`VideoObject`/`Movie`/`TVSeries`) | `checks.ts` | Workflow created |
| 3 | Hreflang check for dialect pages | `checks.ts` | Workflow created |
| 4 | Video Sitemap generator | `sitemap-generator.ts` | Workflow created |
| 5 | `seo-pipeline-ott-improvements.yml` | `.github/workflows/` | Live on main, auto-triggers on push |

**Agent:** `f1000001-0002-4000-8000-000000000001` will execute all 4 fixes via Paperclip when workflow runs.

---

## 🔴 CRITICAL GAPS (Fix First)

### GAP-1: Duplicate Paperclip Issues
**Problem:** SEO-71 to SEO-75 are 5 identical keyword issues. No dedup check in workflow.  
**File:** `.github/workflows/seo-weekly-keyword-analysis.yml`  
**Fix:** Add a pre-check before issue creation:
```yaml
- name: Check for existing issue today
  id: dedup
  run: |
    DATE=$(date +%Y-%m-%d)
    EXISTING=$(curl -s "$PAPERCLIP_API_URL/api/companies/$COMPANY_ID/issues?status=todo" \
      -H "Authorization: Bearer $PAPERCLIP_API_KEY" | \
      node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); \
      console.log(d.some(i => i.title.includes('${DATE}')) ? 'yes' : 'no')")
    echo "exists=${EXISTING}" >> $GITHUB_OUTPUT

- name: Create issue
  if: steps.dedup.outputs.exists != 'yes'
  # ... rest of step
```
**Impact:** Stops wasted agent cycles on duplicate work  
**Effort:** 30 min

---

### GAP-2: Auto-Fix Pipeline Doesn't Actually Fix Code
**Problem:** `packages/auto-fix-pipeline/src/pipeline/runner.ts` creates **patch description files** not actual code changes. This comment exists in the code:
```typescript
// The validated fix would be applied to the actual file here
// For now we commit the suggested fix as a patch file
const patchFile = `fixes/${issue.issue_type}-${issue.id}.ts`;
```
**Fix needed:**  
- Build fix templates for common issues (missing meta description → generate + insert into `generateMetadata`)  
- Deployer that actually writes to webapp files  
- Currently relies 100% on Paperclip agent doing manual work  
**Files:** `auto-fix-pipeline/src/pipeline/runner.ts`, `auto-fix-pipeline/src/deployers/`  
**Impact:** PRs will contain working code not just patch descriptions  
**Effort:** 2-3 days

---

### GAP-3: SEO-58 — GitHub Action Blocked
**Problem:** Paperclip issue "See kon kon blocked hai coz of github action" — unknown  
**Action:** Check GitHub Actions logs for blocked workflows. Likely GITHUB_TOKEN permissions issue.  
**Command to check:** `gh run list --repo vatsanatech/stage-seo-pipeline --status failure`

---

### GAP-4: No GEO (AI Search) Optimization
**Problem:** AI-referred sessions grew **527% YoY** in 2025. Pipeline has zero GEO checks.  
**Missing checks in audit:**
- `robots.txt` blocking AI bots: `PerplexityBot`, `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `Google-Extended`
- `/llms.txt` missing or too basic
- Content not answer-first structure (direct answer in first 50 words)
- Missing statistics/data points in content (+37% AI citation)
- Pages stale >90 days (3x citation loss)
- E-E-A-T signals missing

**Fix:** Add to `seo-site-audit.yml` Paperclip prompt (see GAP-8 enhanced prompt below)  
**Effort:** 1 hour for prompt update, 3-4 days for `geo-optimizer` package

---

### GAP-5: No Schema Generation (Only Validation)
**Problem:** Pipeline detects missing schemas but generates nothing.  
**What OTT needs:**

| Page Type | Required Schema | Impact |
|-----------|----------------|--------|
| `/watch/*` | `VideoObject` | Google "Watch on Stage" button |
| `/movies` | `Movie` or `ItemList` | Content type rich results |
| `/shows` | `TVSeries` | TV show rich results |
| `/` (homepage) | `Organization` + `WebSite` | Knowledge Graph entry |
| All pages | `BreadcrumbList` | Navigation rich results |
| Dialect landing pages | `FAQPage` | +40% AI citation rate |
| Key pages | `Speakable` | Voice/AI citation precision |

**New package needed:** `packages/schema-generator/` (see Week 2 below)  
**Effort:** 3-4 days

---

## 🟡 HIGH PRIORITY GAPS

### GAP-6: No Search Intent Classification in Keywords
**Problem:** All keywords treated equal. "watch haryanvi movie" (transactional) gets same weight as "what is haryanvi cinema" (informational).  
**Fix:** Add to `seo-weekly-keyword-analysis.yml` prompt:
```
Priority: transactional > commercial > navigational > informational
Classify: watch/download/stream = transactional, best/top/review = commercial
```
**File:** `.github/workflows/seo-weekly-keyword-analysis.yml`  
**Effort:** 30 min

---

### GAP-7: llms.txt Too Basic
**Problem:** Current `geo-deployer.ts` generates a minimal list of URLs. Needs rich context for AI crawlers.  
**Current output:** Just `- [title](url): description` list  
**Should include:** Platform description, content categories, languages/dialects, "For AI Assistants" section  
**File:** `packages/auto-fix-pipeline/src/deployers/geo-deployer.ts`  
**Effort:** 1 hour

---

### GAP-8: Audit Prompt Missing GEO + OTT Schema Checks
**Problem:** `seo-site-audit.yml` prompt has no schema or GEO instructions.  
**Add to audit prompt description:**
```
**Schema / Structured Data (CRITICAL for OTT):**
- Every /watch/* page MUST have VideoObject schema
- Every /movies page MUST have Movie or ItemList schema  
- Every /shows page MUST have TVSeries schema
- Homepage MUST have Organization + WebSite schema
- All pages MUST have BreadcrumbList schema
- Dialect landing pages MUST have FAQPage schema (+40% AI citation)

**GEO (AI Search Optimization):**
- robots.txt must allow: PerplexityBot, GPTBot, ChatGPT-User, ClaudeBot, Google-Extended
- /llms.txt must exist and be comprehensive
- Content must follow answer-first structure
- Pages must include statistics/data points
- Content must be updated within 90 days
```
**File:** `.github/workflows/seo-site-audit.yml`  
**Effort:** 1 hour

---

### GAP-9: No Plan-First Approach in Prompts
**Problem:** Agent jumps straight to "Fix all issues in one PR." No planning step.  
**Fix:** Add to both audit + keyword prompts:
```
### Before You Start (Plan Node)
1. Read past lessons — do NOT repeat known failures
2. Write a brief plan as a comment before starting
3. Prioritize: schema > GEO > technical > content
4. If unsure about a fix, skip it
```
**Effort:** 30 min

---

### GAP-10: No Self-Improvement Loop
**Problem:** Agent starts completely fresh every run. Repeats same mistakes. No memory between runs.  
**Fix:**
1. Add `lessons` table to `seo-pipeline-db`:
```sql
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  pattern TEXT NOT NULL,
  type TEXT NOT NULL,       -- 'success' | 'failure'
  confidence REAL DEFAULT 0.5,
  created_at TEXT NOT NULL,
  times_confirmed INTEGER DEFAULT 1
);
```
2. Auto-fix pipeline reads lessons before prioritizing fixes  
3. Impact tracker writes lessons when ROI confirmed  
4. Prompt instructs agent to write lessons after each run  

**Files:** `seo-pipeline-db/src/index.ts`, `auto-fix-pipeline/src/pipeline/runner.ts`  
**Effort:** 4 hours

---

### GAP-11: No Keyword Clustering / Cannibalization Detection
**Problem:** "haryanvi movie" + "haryanvi film" + "haryanvi movies online" treated as separate — three pages compete for same topic.  
**Fix:** Add to `gsc-keyword-tracker`:
- `analyzers/keyword-clusterer.ts` — group by shared n-grams
- `analyzers/cannibalization-detector.ts` — multiple pages ranking for same keyword  
**Effort:** 1 day

---

### GAP-12: Impact Tracker Has No GEO Metrics
**Problem:** ROI only uses traditional signals (CTR, clicks, position). No AI citation tracking.  
**Fix — Enhanced ROI formula:**
```javascript
// Current
const score = (ctrChange * 0.4) + (clicksChange * 0.3) + (positionChange * 0.3);

// Proposed
const traditional = (ctrChange * 0.4) + (clicksChange * 0.3) + (positionChange * 0.3);
const geo = (aiCitationChange * 0.3) + (aiOverviewChange * 0.3) + (richResultChange * 0.4);
const blended = (traditional * 0.6) + (geo * 0.4);
```
Also: convert `impact-tracker` from CommonJS JS → TypeScript (inconsistent with rest of pipeline)  
**File:** `packages/impact-tracker/`  
**Effort:** 1 day

---

## 🟢 NEW PACKAGES TO BUILD

### Package 1: `schema-generator` (Week 2 — Highest ROI)
```
packages/schema-generator/
├── src/
│   ├── generators/
│   │   ├── video-object.ts    # /watch/* — Google "Watch on Stage" button
│   │   ├── movie.ts           # /movies pages
│   │   ├── tv-series.ts       # /shows pages
│   │   ├── faq-page.ts        # Dialect landing pages (+40% AI citation)
│   │   ├── organization.ts    # Homepage
│   │   ├── breadcrumb.ts      # All pages
│   │   └── speakable.ts       # Key pages
│   ├── validators/
│   │   └── schema-validator.ts
│   ├── deployer.ts            # Generate code patches for webapp
│   └── cli.ts
```
**Impact:** Rich results on ALL content pages, +40% AI citation from FAQPage  
**Effort:** 3-4 days

---

### Package 2: `geo-optimizer` (Week 3)
```
packages/geo-optimizer/
├── src/
│   ├── analyzers/
│   │   ├── content-structurer.ts  # Answer-first check
│   │   ├── citation-checker.ts    # Stats/data presence check
│   │   ├── eeat-scorer.ts         # E-E-A-T signal scoring
│   │   └── freshness-monitor.ts   # Flag pages >90 days old
│   ├── robots-checker.ts          # Verify AI bots not blocked
│   └── cli.ts
```
**Impact:** AI search visibility, Perplexity/ChatGPT citations  
**Effort:** 3-4 days

---

### Package 3: `ai-visibility-tracker` (Week 4)
```
packages/ai-visibility-tracker/
├── src/
│   ├── platforms/
│   │   ├── perplexity.ts          # Citation tracking
│   │   ├── google-ai-overview.ts  # AI Overview inclusion
│   │   └── chatgpt-search.ts      # ChatGPT search citations
│   └── reporter.ts                # Slack reports
```
**Impact:** Know exactly where Stage.in appears (or doesn't) in AI search  
**Effort:** 2-3 days

---

## 🗓️ NEW WORKFLOWS TO ADD

| Workflow | Schedule | What Agent Does |
|----------|----------|----------------|
| `seo-schema-audit.yml` | Wednesday 10 AM IST | Validate + generate all OTT schemas |
| `seo-geo-check.yml` | Friday 10 AM IST | Check AI bot access, answer-first, freshness |
| `seo-freshness-check.yml` | 1st + 15th of month | Flag pages stale >90 days |
| `seo-impact-report.yml` | Monday 10 AM IST | Weekly ROI report to Slack |

**Complete weekly schedule after adding:**

| Time | Workflow |
|------|---------|
| Mon 10 AM | Site audit (technical + GEO) + Impact report |
| Alternate days | Keyword analysis |
| Wed 10 AM | Schema audit + generation |
| Fri 10 AM | GEO check (AI citations, robots.txt, freshness) |
| 1st + 15th | Freshness alerts |

---

## 📊 Current State vs Target

| Area | Today (Before) | After Session 1 | Target |
|------|---------------|-----------------|--------|
| SSR Diff Check | Dead code | Workflow queued ✅ | Done |
| OTT Schema Check | None | Workflow queued ✅ | Done |
| Hreflang Check | None | Workflow queued ✅ | Done |
| Video Sitemap | Basic | Workflow queued ✅ | Done |
| Schema Generation | ❌ | ❌ | Week 2 |
| GEO Optimization | ❌ | ❌ | Week 3 |
| AI Citation Tracking | ❌ | ❌ | Week 4 |
| Dedup Paperclip Issues | ❌ | ❌ | Quick win |
| Self-Improvement Loop | ❌ | ❌ | Week 3-4 |
| Intent Classification | ❌ | ❌ | Quick win |
| Enhanced Prompts | ❌ | ❌ | Quick win |
| llms.txt Enhanced | Basic | Basic | Quick win |
| Auto-Fix Real Code | Patch files | Patch files | Week 2-3 |

---

## ⚡ Next Session Priority Order

### Do First (Quick Wins — 2-3 hours total)
1. **GAP-1:** Fix duplicate Paperclip issues in `seo-weekly-keyword-analysis.yml`
2. **GAP-8:** Add GEO + OTT schema checks to `seo-site-audit.yml` prompt  
3. **GAP-6:** Add intent classification to keyword prompt  
4. **GAP-9:** Add plan-first + self-improvement to both prompts  
5. **GAP-7:** Enhance `llms.txt` template in `geo-deployer.ts`  

### Then Build (Week 2)
6. **GAP-5:** `packages/schema-generator/` — VideoObject, FAQPage, BreadcrumbList generators  
7. New workflow: `seo-schema-audit.yml`  

### Then Build (Week 3)
8. **GAP-4 + GAP-10:** `packages/geo-optimizer/` + `lessons` table  
9. New workflow: `seo-geo-check.yml`  
10. **GAP-12:** Enhance `impact-tracker` with GEO metrics + convert to TypeScript  

### Then Build (Week 4)
11. `packages/ai-visibility-tracker/`
12. **GAP-11:** Keyword clustering + cannibalization detection
13. **GAP-2:** Real code generation in auto-fix pipeline (hardest, most impactful)
14. New workflows: `seo-freshness-check.yml`, `seo-impact-report.yml`

---

## 💰 Expected Business Impact (After All Fixes)

| Change | Metric | Expected Impact |
|--------|--------|----------------|
| VideoObject schema | Google "Watch" rich result | CTR +20-40% on content pages |
| FAQPage schema | AI citation rate | +40% AI search visibility |
| Content structure fix | Citation rate | 2.8x higher citation rate |
| Hreflang for dialects | Regional traffic | +25-50% Hindi/regional clicks |
| Video sitemap | New content indexing | 80% faster (weeks → days) |
| AI bot unblocking | AI search presence | Currently invisible to AI search |
| GEO optimization | AI-referred sessions | Tap into 527% YoY growth channel |
| Keyword intent | Conversion rate | Revenue-focused, not just volume |
| Self-improvement | Agent quality | Compounding — better every week |

---

*Analysis based on: full pipeline code review + OTT SEO research (Netflix/Hotstar/Airtel Xstream patterns) + Twitter/X SEO expert research + Princeton GEO study*

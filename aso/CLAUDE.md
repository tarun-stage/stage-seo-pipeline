# ASO Pipeline — CLAUDE.md

This directory contains the App Store Optimization (ASO) automation pipeline for the STAGE app.

## About This Project

STAGE is a regional OTT platform targeting Haryanvi, Rajasthani, and Bhojpuri audiences in India. ASO ensures the app ranks well for dialect-specific keywords on Google Play and the App Store.

## Metadata Files

```
aso/
├── metadata/
│   ├── ios/en-US/
│   │   ├── name.txt          # App name (30 chars max)
│   │   ├── subtitle.txt      # App subtitle (30 chars max)
│   │   ├── keywords.txt      # Keywords (100 chars max, comma-separated)
│   │   ├── promotional_text.txt  # Promo text (170 chars max, iOS only)
│   │   ├── description.txt   # Full description (4000 chars max)
│   │   └── release_notes.txt # What's new (4000 chars max)
│   └── android/en-US/
│       ├── title.txt         # App title (50 chars max)
│       ├── short_description.txt  # Short desc (80 chars max)
│       └── full_description.txt   # Full description (4000 chars max)
├── scripts/
│   ├── review_responder.js   # Auto-reply Google Play reviews (Node.js)
│   ├── promo_text_scheduler.py  # Rotate iOS promo text weekly
│   └── rank_tracker.py       # Track keyword rankings
└── fastlane/
    ├── Appfile               # iOS (in.stageflutter) + Android (in.stage)
    └── Fastfile              # deliver/supply lanes
```

## Current Metadata

**iOS:**
- Name: `STAGE: Regional OTT Web Series` (30 chars)
- Subtitle: `Haryanvi Rajasthani Bhojpuri` (28 chars)
- Keywords: `haryanvi,hariyanvi,rajasthani,bhojpuri,ott,webseries,movie,drama,folk,ragni,geet,kavi,comedy,desi` (97/100 chars)
  - Note: `hariyanvi` is intentional — it's a common misspelling users search for

**Android:**
- Title: `STAGE - Regional OTT Web Series & Movies` (40 chars)
- Short Description: `Haryanvi, Rajasthani & Bhojpuri web series, movies, comedy — sirf Rs 1 mein!` (79/80 chars)

## Keyword Rules — MUST FOLLOW

### Protected Core Keywords (NEVER remove these)
`haryanvi`, `hariyanvi`, `ott`, `webseries`, `rajasthani`, `bhojpuri`

### Allowed Keyword Categories
- Regional dialect terms: haryanvi, rajasthani, bhojpuri, hariyanvi, bihari
- Content types: webseries, movie, drama, comedy, folk, ragni, geet, kavi, serial
- Seasonal/festival: baisakhi, holi, diwali, navratri, teej, chhath
- Discovery terms: desi, regional, entertainment, streaming
- Common misspellings users actually search for (e.g. hariyanvi)

### Blocklist — NEVER add these keywords (or any variation)
The following categories are strictly prohibited in ALL metadata fields (keywords, title, description, short description):

**Adult/Sexual content:** sex, sexy, porn, pornography, xnxx, xvideos, xxx, adult, nude, naked, hot girl, hot video, erotic,18+, romance hot, bold scene
**Vulgar terms:** any profanity in Hindi, English, or Haryanvi/Bhojpuri dialects
**Misleading claims:** free forever, #1 in India, best app (unless verified), guaranteed
**Competitor brand names:** Netflix, Amazon Prime, Hotstar, JioCinema, MX Player, Zee5, SonyLiv (Google/Apple prohibit this)

> ⚠️ IMPORTANT: Any PR containing blocklisted keywords will be automatically flagged in Slack and must NOT be merged. The automated PR check workflow will catch these.

### Keyword Update Process
1. Research seasonal trends, competitor gaps, and new Haryanvi/Bhojpuri content
2. Update metadata files on a feature branch (`feature/aso-update-YYYY-MM-DD`)
3. Self-check: run through blocklist mentally before committing
4. Push branch and create PR — the automated workflow will:
   - Check all metadata files against the blocklist
   - Post a Slack review request with the full diff
5. Wait for human approval (merge) before changes go live

## Agent Roles

### ASO CEO (runs every 6 hours)
Your job is to oversee the ASO pipeline and create GitHub PRs when metadata changes are made.

**On every run:**
1. Check Paperclip inbox for assigned tasks
2. If metadata changes exist:
   - Ensure changes are committed on branch `feature/aso-update-YYYY-MM-DD`
   - Push to GitHub
   - Create a PR on `vatsanatech/stage-seo-pipeline` repo with full details in body
   - Post Slack notification with metadata details (see format below)
3. If no changes, check if seasonal keyword updates are needed (quarterly review)

**PR Creation (using GITHUB_TOKEN):**
```bash
DATE=$(date +%Y-%m-%d)
BRANCH="feature/aso-update-${DATE}"

cd /paperclip/stage-seo-pipeline

git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH"

# Make changes in aso/metadata/ ...

git add aso/metadata/
git commit -m "feat(aso): update app store metadata ${DATE}"
git push origin "$BRANCH"

# Read current metadata for PR body
IOS_NAME=$(cat aso/metadata/ios/en-US/name.txt 2>/dev/null || echo "N/A")
IOS_SUBTITLE=$(cat aso/metadata/ios/en-US/subtitle.txt 2>/dev/null || echo "N/A")
IOS_KEYWORDS=$(cat aso/metadata/ios/en-US/keywords.txt 2>/dev/null || echo "N/A")
AND_TITLE=$(cat aso/metadata/android/en-US/title.txt 2>/dev/null || echo "N/A")
AND_SHORT=$(cat aso/metadata/android/en-US/short_description.txt 2>/dev/null || echo "N/A")

PR_BODY="## ASO Metadata Update — ${DATE}

Automated update of iOS and Android store metadata.

### iOS
| Field | Value |
|-------|-------|
| Name | ${IOS_NAME} |
| Subtitle | ${IOS_SUBTITLE} |
| Keywords | ${IOS_KEYWORDS} |

### Android
| Field | Value |
|-------|-------|
| Title | ${AND_TITLE} |
| Short Description | ${AND_SHORT} |

> Generated by ASO CEO agent via Paperclip"

PR_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/vatsanatech/stage-seo-pipeline/pulls \
  -d "$(jq -n \
    --arg title "feat(aso): update app store metadata ${DATE}" \
    --arg body "$PR_BODY" \
    --arg head "$BRANCH" \
    '{title: $title, body: $body, head: $head, base: "main"}')")

PR_URL=$(echo "$PR_RESPONSE" | grep -o '"html_url":"[^"]*pulls[^"]*"' | head -1 | cut -d'"' -f4)
```

**Slack Notification (with details):**
```bash
IOS_NAME=$(cat aso/metadata/ios/en-US/name.txt 2>/dev/null || echo "N/A")
IOS_SUBTITLE=$(cat aso/metadata/ios/en-US/subtitle.txt 2>/dev/null || echo "N/A")
IOS_KEYWORDS=$(cat aso/metadata/ios/en-US/keywords.txt 2>/dev/null || echo "N/A")
AND_TITLE=$(cat aso/metadata/android/en-US/title.txt 2>/dev/null || echo "N/A")
AND_SHORT=$(cat aso/metadata/android/en-US/short_description.txt 2>/dev/null || echo "N/A")
IOS_KW_LEN=$(echo -n "$IOS_KEYWORDS" | wc -c | tr -d ' ')
AND_SHORT_LEN=$(echo -n "$AND_SHORT" | wc -c | tr -d ' ')

curl -s -X POST "${SLACK_WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg text "*ASO Metadata Update — ${DATE}*
Hi @Tarun Sahnan, please review this automated ASO metadata PR: ${PR_URL}" \
    --arg ios_name "$IOS_NAME" \
    --arg ios_subtitle "$IOS_SUBTITLE" \
    --arg ios_kw "$IOS_KEYWORDS" \
    --arg ios_kw_len "${IOS_KW_LEN}/100 chars" \
    --arg and_title "$AND_TITLE" \
    --arg and_short "$AND_SHORT" \
    --arg and_short_len "${AND_SHORT_LEN}/80 chars" \
    '{
      text: $text,
      attachments: [{
        color: "#36a64f",
        fields: [
          {title: "iOS Name", value: $ios_name, short: true},
          {title: "iOS Subtitle", value: $ios_subtitle, short: true},
          {title: ("iOS Keywords (" + $ios_kw_len + ")"), value: $ios_kw, short: false},
          {title: "Android Title", value: $and_title, short: true},
          {title: ("Android Short Desc (" + $and_short_len + ")"), value: $and_short, short: false}
        ],
        footer: "ASO CEO Agent • Paperclip"
      }]
    }')"
```

### Metadata Manager (runs every 24 hours)
Update metadata files based on trends and seasonal opportunities.

- Keep keywords fresh — add seasonal terms (festivals, events) when relevant
- Ensure all character limits are respected
- Focus on Haryanvi, Rajasthani, Bhojpuri dialect keywords
- Never change the core brand keywords (haryanvi, hariyanvi, ott, webseries, rajasthani, bhojpuri)
- **Always check the Blocklist section above before adding any keyword**
- When done with updates, leave files committed in the repo (CEO will create the PR)

### Promo Text Rotator (runs weekly)
Rotate iOS promotional text through 6 variants weekly (use week_number % 6).

Current variants (pick by week index):
0. `Haryanvi web series aur movies — sirf Rs 1 mein. Abhi try karo!`
1. `Rajasthani aur Bhojpuri content — India ka #1 regional OTT!`
2. `Ragni, comedy, drama — sab kuch ek jagah. Rs 1 se start!`
3. `Haryanvi desi entertainment — new shows har hafta!`
4. `Folk music, web series, movies — apni bhasha mein. Rs 1 mein!`
5. `Comedy, drama, ragni — STAGE pe milega sab. Try karo free!`

Update `metadata/ios/en-US/promotional_text.txt` with the week's variant.

### ASO Auditor (runs every 12 hours)
Audit ASO metadata quality and alert CEO if issues found.

**Checks to run:**
1. **Character limits** — verify all fields are within limits:
   - iOS name ≤ 30, subtitle ≤ 30, keywords ≤ 100, promo text ≤ 170
   - Android title ≤ 50, short description ≤ 80
2. **Keyword coverage** — ensure core keywords present: haryanvi, rajasthani, bhojpuri, ott
3. **Blocklist scan** — check no prohibited keywords have crept into any metadata file
4. **Competitor gap** — check if MX Player, JioCinema, Zee5 rank for keywords we're missing
5. **Metadata staleness** — flag if metadata hasn't changed in 30+ days

**If issues found**, post to Slack:
```bash
curl -s -X POST "${SLACK_WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"*ASO Audit Alert* :warning:
[issue description]
Action needed: @ASO CEO\"}"
```

**If everything is healthy**, just log to `scripts/audit_log/YYYY-MM-DD.json` — no Slack noise.

### Rank Tracker (runs weekly)
Track keyword rankings. Log results to `scripts/rank_data/YYYY-MM-DD.json`.

Focus keywords: haryanvi, rajasthani, bhojpuri, ott, web series, regional movies

### Review Responder (runs every 24 hours)
Respond to 1-3 star Google Play reviews in English. See `scripts/review_responder.js`.

Note: Needs `PLAY_STORE_KEY_PATH` env var set to `/paperclip/secrets/play-store-key.json`.

### Monthly Reporter (runs monthly)
Generate monthly ASO performance report. Save to `reports/YYYY-MM.md`.

## Git Workflow

The repo is already cloned at `/paperclip/stage-seo-pipeline` with GitHub auth via GITHUB_TOKEN in the remote URL.

```bash
cd /paperclip/stage-seo-pipeline
git status
git log --oneline -5
```

**Never push directly to main.** Always use feature branches: `feature/aso-update-YYYY-MM-DD`

## Environment Variables

- `GITHUB_TOKEN` — GitHub token for API calls and git push
- `SLACK_WEBHOOK_URL` — Slack webhook for notifications (tech-mates channel)
- `PAPERCLIP_API_BASE` — Paperclip API endpoint
- `PLAY_STORE_KEY_PATH` — Path to Google Play service account JSON (`/paperclip/secrets/play-store-key.json`)

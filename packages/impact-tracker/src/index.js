#!/usr/bin/env node

/**
 * SEO Impact Tracker - Main entry point & CLI.
 *
 * Commands:
 *   register  - Register a new fix for tracking
 *   check-ready - List fixes ready for impact measurement
 *   track     - Run impact tracking on all ready fixes
 *   report    - Generate and send ROI summary report
 */

const db = require('./db');
const compare = require('./compare');
const slack = require('./slack');

const command = process.argv[2] || 'help';

async function main() {
  switch (command) {
    case 'register': {
      const pageUrl = process.argv[3] || process.env.FIX_PAGE_URL;
      const fixDescription = process.argv[4] || process.env.FIX_DESCRIPTION || '';
      const fixDate = process.argv[5] || process.env.FIX_DATE || new Date().toISOString();
      const deployAgent = process.argv[6] || process.env.DEPLOY_AGENT || 'unknown';

      if (!pageUrl) {
        console.error('Usage: node src/index.js register <pageUrl> [description] [fixDate] [deployAgent]');
        process.exit(1);
      }

      const fix = db.registerFix({ pageUrl, fixDescription, fixDate, deployAgent });
      console.log(`Registered fix: ${fix.id}`);
      console.log(`  Page: ${fix.pageUrl}`);
      console.log(`  Fix date: ${fix.fixDate}`);
      console.log(`  Status: ${fix.status}`);
      console.log(`  Will be ready for tracking in ${require('./config').tracking.readyCheckDays} days.`);
      break;
    }

    case 'check-ready': {
      const ready = db.getFixesReadyForTracking();
      if (ready.length === 0) {
        console.log('No fixes are ready for tracking yet.');
        const pending = db.getPendingFixes();
        if (pending.length > 0) {
          console.log(`\n${pending.length} fix(es) still in waiting period:`);
          for (const f of pending) {
            const daysLeft = Math.ceil(
              (new Date(f.fixDate).getTime() + require('./config').tracking.readyCheckDays * 86400000 - Date.now()) / 86400000
            );
            console.log(`  - ${f.pageUrl} (${Math.max(0, daysLeft)} days remaining)`);
          }
        }
      } else {
        console.log(`${ready.length} fix(es) ready for impact tracking:`);
        for (const f of ready) {
          console.log(`  - ${f.pageUrl} (fixed ${f.fixDate.split('T')[0]})`);
        }
      }
      break;
    }

    case 'track': {
      console.log('Starting impact tracking run...\n');
      const results = await compare.trackAllReady();

      if (results.length > 0) {
        console.log(`\n--- Tracking Complete ---`);
        console.log(`Tracked ${results.length} fix(es).`);

        // Send alerts for significant changes
        for (const result of results) {
          if (result.alerts && result.alerts.length > 0) {
            await slack.sendAlert(result);
          }
        }

        // Send summary
        await slack.sendRoiSummary(results);
      }
      break;
    }

    case 'report': {
      const impacts = db.getAllImpact();
      if (impacts.length === 0) {
        console.log('No impact data recorded yet. Run "track" first.');
        break;
      }

      // Default: report on last 7 days of tracked impacts
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const recent = impacts.filter(i => new Date(i.trackedAt) >= since);

      if (recent.length === 0) {
        console.log('No recent impact data (last 7 days). Showing all-time summary.\n');
        await slack.sendRoiSummary(impacts);
      } else {
        console.log(`Generating report for ${recent.length} recent impact(s)...\n`);
        await slack.sendRoiSummary(recent);
      }
      break;
    }

    case 'status': {
      const fixes = db.getAllFixes();
      const impacts = db.getAllImpact();
      console.log('=== SEO Impact Tracker Status ===');
      console.log(`Total fixes registered: ${fixes.length}`);
      console.log(`  Pending: ${fixes.filter(f => f.status === 'pending').length}`);
      console.log(`  Tracked: ${fixes.filter(f => f.status === 'tracked').length}`);
      console.log(`  Errors: ${fixes.filter(f => f.status === 'error').length}`);
      console.log(`Total impact records: ${impacts.length}`);
      if (impacts.length > 0) {
        const avgRoi = impacts.reduce((s, i) => s + i.roiScore, 0) / impacts.length;
        console.log(`  Average ROI score: ${avgRoi.toFixed(1)}`);
      }
      break;
    }

    case 'geo-report': {
      // GAP-12: GEO metrics report — reads from ai-visibility-tracker data
      const fs = require('fs');
      const path = require('path');
      const dataDir = process.env.AI_TRACKER_DATA_DIR || path.join(__dirname, '..', '..', 'ai-visibility-tracker', 'data');
      const citationsFile = path.join(dataDir, 'citations.json');

      if (!fs.existsSync(citationsFile)) {
        console.log('No AI citation data found. Run ai-visibility-tracker first.');
        console.log(`Expected at: ${citationsFile}`);
        console.log('Override with AI_TRACKER_DATA_DIR env var.');
        break;
      }

      const citations = JSON.parse(fs.readFileSync(citationsFile, 'utf8'));
      const days = parseInt(process.argv[3] || '30', 10);
      const since = new Date();
      since.setDate(since.getDate() - days);
      const recent = citations.filter(c => new Date(c.checkedAt) >= since);

      if (recent.length === 0) {
        console.log(`No AI citation data in the last ${days} days.`);
        break;
      }

      // Aggregate by platform
      const byPlatform = {};
      for (const c of recent) {
        if (!byPlatform[c.platform]) byPlatform[c.platform] = { total: 0, cited: 0 };
        byPlatform[c.platform].total++;
        if (c.cited) byPlatform[c.platform].cited++;
      }

      // Aggregate by dialect
      const byDialect = {};
      for (const c of recent) {
        if (!byDialect[c.dialect]) byDialect[c.dialect] = { total: 0, cited: 0 };
        byDialect[c.dialect].total++;
        if (c.cited) byDialect[c.dialect].cited++;
      }

      const totalCited = recent.filter(c => c.cited).length;
      const overallRate = (totalCited / recent.length * 100).toFixed(1);

      console.log(`\n=== GEO / AI Citation Report (last ${days} days) ===\n`);
      console.log(`Overall citation rate: ${overallRate}% (${totalCited}/${recent.length} queries)\n`);

      console.log('By platform:');
      for (const [platform, data] of Object.entries(byPlatform)) {
        const rate = (data.cited / data.total * 100).toFixed(1);
        console.log(`  ${platform}: ${rate}% (${data.cited}/${data.total})`);
      }

      console.log('\nBy dialect:');
      for (const [dialect, data] of Object.entries(byDialect)) {
        const rate = (data.cited / data.total * 100).toFixed(1);
        console.log(`  ${dialect}: ${rate}% (${data.cited}/${data.total})`);
      }

      // Trend: first half vs second half
      const midpoint = new Date(since.getTime() + (Date.now() - since.getTime()) / 2);
      const firstHalf = recent.filter(c => new Date(c.checkedAt) < midpoint);
      const secondHalf = recent.filter(c => new Date(c.checkedAt) >= midpoint);
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstRate = firstHalf.filter(c => c.cited).length / firstHalf.length * 100;
        const secondRate = secondHalf.filter(c => c.cited).length / secondHalf.length * 100;
        const trend = secondRate > firstRate ? '↑ improving' : secondRate < firstRate ? '↓ declining' : '→ stable';
        console.log(`\nTrend: ${firstRate.toFixed(1)}% → ${secondRate.toFixed(1)}% ${trend}`);
      }

      // Send to Slack if webhook configured
      if (process.env.SLACK_WEBHOOK_URL) {
        const slack = require('./slack');
        await slack.sendSlackMessage(
          `*GEO Citation Report (${days}d)*\nOverall: ${overallRate}% citation rate (${totalCited}/${recent.length})\n` +
          Object.entries(byPlatform).map(([p, d]) => `${p}: ${(d.cited/d.total*100).toFixed(1)}%`).join(' | ')
        );
        console.log('\nReport sent to Slack.');
      }
      break;
    }

    case 'help':
    default:
      console.log(`SEO Impact Tracker - Track and measure SEO fix ROI

Usage: node src/index.js <command> [options]

Commands:
  register <url> [desc] [date] [agent]  Register a fix for tracking
  check-ready                           List fixes ready for measurement
  track                                 Run impact tracking on ready fixes
  report                                Generate and send ROI summary
  geo-report [days]                     GEO / AI citation rate report (default: 30 days)
  status                                Show tracker status summary
  help                                  Show this help message

Environment Variables:
  GSC_CREDENTIALS_PATH    Path to Google Search Console service account JSON
  GSC_SITE_URL            Site URL in GSC (e.g. https://example.com)
  SLACK_WEBHOOK_URL       Slack incoming webhook URL
  SLACK_CHANNEL           Slack channel (default: #seo-alerts)
  POST_FIX_DAYS           Days to wait before measuring (default: 7)
  PRE_FIX_BASELINE_DAYS   Baseline comparison window (default: 7)
  AI_TRACKER_DATA_DIR     Path to ai-visibility-tracker data dir (for geo-report)
`);
      break;
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

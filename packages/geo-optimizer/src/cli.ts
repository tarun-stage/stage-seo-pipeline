import { fetchAndCheckRobots } from './analyzers/robots-checker.js';
import { analyzeContentStructure } from './analyzers/content-structurer.js';
import { checkFreshness } from './analyzers/freshness-monitor.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help') {
    console.log(`
GEO Optimizer — AI Search Optimization for Stage.in

Usage:
  node cli.js robots <site-url>         Check robots.txt for blocked AI bots
  node cli.js structure <url>           Analyze content structure for AI citation
  node cli.js freshness <url>           Check content freshness (stale >90 days)
  node cli.js full <site-url>           Run all GEO checks

Examples:
  node cli.js robots https://stage.in
  node cli.js structure https://stage.in/hi/haryanvi/movies
  node cli.js full https://stage.in
`);
    process.exit(0);
  }

  const url = args[1];
  if (!url) {
    console.error('Please provide a URL');
    process.exit(1);
  }

  if (command === 'robots') {
    console.log(`\nChecking robots.txt for ${url}...\n`);
    const result = await fetchAndCheckRobots(url);

    console.log(`Allowed bots (${result.allowedBots.length}): ${result.allowedBots.join(', ') || 'none'}`);
    console.log(`Blocked bots (${result.blockedBots.length}): ${result.blockedBots.join(', ') || 'none'}`);
    console.log(`Missing (not mentioned): ${result.missingBots.join(', ') || 'none'}`);

    if (result.issues.length > 0) {
      console.log('\n=== Issues ===');
      for (const issue of result.issues) {
        console.log(`\n[${issue.severity.toUpperCase()}] ${issue.bot}`);
        console.log(`  Problem: ${issue.message}`);
        console.log(`  Fix: ${issue.fix}`);
      }
    } else {
      console.log('\n✓ All AI bots are allowed');
    }

  } else if (command === 'structure') {
    console.log(`\nAnalyzing content structure for ${url}...\n`);
    const response = await fetch(url);
    const html = await response.text();
    const result = analyzeContentStructure(url, html);

    console.log(`GEO Score: ${result.score}/100`);

    if (result.issues.length > 0) {
      console.log('\n=== Issues ===');
      for (const issue of result.issues) {
        console.log(`[${issue.severity.toUpperCase()}] ${issue.message}`);
        console.log(`  Fix: ${issue.fix}`);
      }
    }

    if (result.recommendations.length > 0) {
      console.log('\n=== Recommendations ===');
      result.recommendations.forEach(r => console.log(`  • ${r}`));
    }

  } else if (command === 'freshness') {
    console.log(`\nChecking content freshness for ${url}...\n`);
    const response = await fetch(url);
    const html = await response.text();
    const lastModified = response.headers.get('last-modified') || undefined;
    const result = checkFreshness(url, html, lastModified);

    console.log(`Status: ${result.status.toUpperCase()}`);
    if (result.lastModified) console.log(`Last modified: ${result.lastModified}`);
    if (result.daysSinceUpdate !== null) console.log(`Days since update: ${result.daysSinceUpdate}`);
    if (result.issue) console.log(`\n⚠ ${result.issue}`);
    else console.log('✓ Content is fresh');

  } else if (command === 'full') {
    console.log(`\n=== Full GEO Check: ${url} ===\n`);

    // Robots check
    const robots = await fetchAndCheckRobots(url);
    const blockedCount = robots.blockedBots.length;
    console.log(`robots.txt: ${blockedCount === 0 ? '✓ All AI bots allowed' : `✗ ${blockedCount} bot(s) blocked: ${robots.blockedBots.join(', ')}`}`);

    // Homepage structure
    const response = await fetch(url);
    const html = await response.text();
    const structure = analyzeContentStructure(url, html);
    console.log(`Content structure score: ${structure.score}/100`);

    // Freshness
    const lastModified = response.headers.get('last-modified') || undefined;
    const freshness = checkFreshness(url, html, lastModified);
    console.log(`Content freshness: ${freshness.status} ${freshness.daysSinceUpdate !== null ? `(${freshness.daysSinceUpdate} days)` : ''}`);

    const totalIssues = robots.issues.length + structure.issues.length + (freshness.issue ? 1 : 0);
    console.log(`\nTotal GEO issues: ${totalIssues}`);
    if (totalIssues === 0) console.log('✓ No GEO issues found');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

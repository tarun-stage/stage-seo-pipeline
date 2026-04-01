import { recordVisibility, generateReport, printReport, TARGET_QUERIES } from './tracker.js';
import { parseCitations } from './platforms/perplexity.js';

const DB_PATH = process.env.DB_PATH || 'ai_visibility.json';
const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'stage.in';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help') {
    console.log(`
AI Visibility Tracker — Track Stage.in in AI Search Platforms

Usage:
  node cli.js track               Manually record a visibility check
  node cli.js report [--days 30]  Generate visibility report
  node cli.js queries             List all tracked queries
  node cli.js record <query> <dialect> <platform> <cited> [position]
                                  Record a single check result

Examples:
  node cli.js report
  node cli.js report --days 7
  node cli.js record "haryanvi movies online" haryanvi perplexity true 2
  node cli.js queries
`);
    process.exit(0);
  }

  if (command === 'report') {
    const daysArg = args.indexOf('--days');
    const days = daysArg >= 0 ? parseInt(args[daysArg + 1] || '30') : 30;
    const report = generateReport(DB_PATH, days);
    printReport(report);

  } else if (command === 'queries') {
    console.log('\nTracked queries by dialect:');
    for (const [dialect, queries] of Object.entries(TARGET_QUERIES)) {
      console.log(`\n${dialect}:`);
      queries.forEach(q => console.log(`  • ${q}`));
    }

  } else if (command === 'record') {
    const [, , query, dialect, platform, citedStr, positionStr] = args;
    if (!query || !dialect || !platform || !citedStr) {
      console.error('Usage: node cli.js record <query> <dialect> <platform> <cited> [position]');
      process.exit(1);
    }

    const cited = citedStr === 'true' || citedStr === '1' || citedStr === 'yes';
    const position = positionStr ? parseInt(positionStr) : null;

    recordVisibility(DB_PATH, {
      query,
      dialect,
      platform,
      cited,
      position,
      competitorsCited: [],
    });

    console.log(`✓ Recorded: "${query}" on ${platform} — ${cited ? `cited at position ${position}` : 'not cited'}`);

  } else if (command === 'track') {
    console.log('\nManual visibility tracking mode');
    console.log('Open Perplexity/ChatGPT and search for each query below.');
    console.log('Check if stage.in appears in the response/citations.\n');
    console.log('Run: node cli.js record "<query>" <dialect> perplexity <true/false> [position]\n');

    for (const [dialect, queries] of Object.entries(TARGET_QUERIES)) {
      console.log(`--- ${dialect.toUpperCase()} ---`);
      queries.forEach(q => console.log(`Search: "${q}"`));
      console.log('');
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

import { validateSchema } from './validators/schema-validator.js';
import { generateFaqPage, DIALECT_FAQS } from './generators/faq-page.js';
import { generateOrganizationAndWebsite, generateBreadcrumbs } from './generators/organization.js';
import { generateVideoObject } from './generators/video-object.js';
import { generateTVSeries } from './generators/tv-series.js';

const SITE_URL = process.env.SITE_URL || 'https://stage.in';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help') {
    console.log(`
Schema Generator — JSON-LD Schema for Stage.in OTT

Usage:
  node cli.js generate <type> [options]
  node cli.js validate <json-file>
  node cli.js preview <type>

Types:
  faq <dialect>         Generate FAQPage schema for dialect landing page
  organization          Generate Organization + WebSite schema for homepage
  breadcrumbs           Generate BreadcrumbList example
  video                 Generate VideoObject example

Options:
  --site <url>          Site URL (default: https://stage.in)
  --output json|script  Output format (default: script)
`);
    process.exit(0);
  }

  if (command === 'generate') {
    const type = args[1];

    if (type === 'faq') {
      const dialect = args[2] || 'haryanvi';
      const faqs = DIALECT_FAQS[dialect];
      if (!faqs) {
        console.error(`Unknown dialect: ${dialect}. Available: ${Object.keys(DIALECT_FAQS).join(', ')}`);
        process.exit(1);
      }
      const schema = generateFaqPage(faqs);
      outputSchema(schema, args);
    } else if (type === 'organization') {
      const schema = generateOrganizationAndWebsite(SITE_URL);
      outputSchema(schema, args);
    } else if (type === 'breadcrumbs') {
      const schema = generateBreadcrumbs([
        { name: 'Home', url: SITE_URL },
        { name: 'Movies', url: `${SITE_URL}/movies` },
        { name: 'Haryanvi Movies', url: `${SITE_URL}/hi/haryanvi/movies` },
      ]);
      outputSchema(schema, args);
    } else if (type === 'video') {
      const schema = generateVideoObject(SITE_URL, {
        id: 'example-movie-123',
        title: 'Example Movie Title',
        description: 'Example movie description for demonstration',
        thumbnailUrl: `${SITE_URL}/thumbnails/example.jpg`,
        uploadDate: '2024-01-01',
        duration: 'PT1H30M',
        dialect: 'hi',
        genre: ['Drama'],
      });
      outputSchema(schema, args);
    } else if (type === 'tv-series') {
      const schema = generateTVSeries(SITE_URL, {
        id: 'example-show-123',
        title: 'Example Show',
        description: 'Example show description',
        thumbnailUrl: `${SITE_URL}/thumbnails/show-example.jpg`,
        startDate: '2024-01-01',
        numberOfSeasons: 2,
        dialect: 'hi',
        genre: ['Drama', 'Comedy'],
      });
      outputSchema(schema, args);
    } else {
      console.error(`Unknown type: ${type}`);
      process.exit(1);
    }
  } else if (command === 'validate') {
    const { readFileSync } = await import('node:fs');
    const file = args[1];
    if (!file) {
      console.error('Please provide a JSON file to validate');
      process.exit(1);
    }
    const schema = JSON.parse(readFileSync(file, 'utf-8'));
    const result = validateSchema(schema);

    console.log(`\n=== Schema Validation: ${result.type} ===`);
    console.log(`Status: ${result.valid ? '✓ Valid' : '✗ Invalid'}`);
    if (result.issues.length) {
      console.log('\nIssues (must fix):');
      result.issues.forEach(i => console.log(`  ✗ ${i}`));
    }
    if (result.warnings.length) {
      console.log('\nWarnings (recommended):');
      result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
    }

    process.exit(result.valid ? 0 : 1);
  } else if (command === 'preview') {
    console.log('\nAvailable dialect FAQs:');
    Object.keys(DIALECT_FAQS).forEach(d => {
      console.log(`  ${d}: ${DIALECT_FAQS[d].length} FAQs`);
    });
  }
}

function outputSchema(schema: object, args: string[]): void {
  const outputFormat = args.includes('--output') ? args[args.indexOf('--output') + 1] : 'script';
  if (outputFormat === 'json') {
    console.log(JSON.stringify(schema, null, 2));
  } else {
    console.log(`<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

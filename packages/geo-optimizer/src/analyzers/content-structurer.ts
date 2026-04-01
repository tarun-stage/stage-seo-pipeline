import * as cheerio from 'cheerio';

export interface ContentStructureResult {
  url: string;
  score: number;            // 0-100
  issues: ContentIssue[];
  recommendations: string[];
}

export interface ContentIssue {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  fix: string;
}

/**
 * Analyzes content structure for AI search optimization.
 * Based on Princeton GEO research — methods that increase AI citation rates.
 */
export function analyzeContentStructure(url: string, html: string): ContentStructureResult {
  const $ = cheerio.load(html);
  const issues: ContentIssue[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // 1. Answer-first structure (direct answer in first 50 words)
  const firstParagraph = $('main p, article p, .content p').first().text().trim();
  const firstParaWords = firstParagraph.split(/\s+/).length;
  if (firstParagraph.length < 50) {
    issues.push({
      type: 'answer_first',
      severity: 'warning',
      message: 'First paragraph is too short — AI models prefer direct answers in the first 50 words',
      fix: 'Start with a clear, direct answer to the main question this page addresses',
    });
    score -= 15;
  }

  // 2. Single H1 check (87% of AI-cited pages)
  const h1s = $('h1');
  if (h1s.length === 0) {
    issues.push({
      type: 'missing_h1',
      severity: 'critical',
      message: 'No H1 heading found — 87% of AI-cited pages use a single H1',
      fix: 'Add a single descriptive H1 heading',
    });
    score -= 20;
  } else if (h1s.length > 1) {
    issues.push({
      type: 'multiple_h1',
      severity: 'warning',
      message: `Multiple H1 tags (${h1s.length}) — use only one H1 per page`,
      fix: 'Keep only one H1, convert others to H2',
    });
    score -= 10;
  }

  // 3. Heading hierarchy (H1 > H2 > H3)
  const headings: { level: number; text: string }[] = [];
  $('h1, h2, h3, h4').each((_, el) => {
    headings.push({
      level: parseInt(el.tagName.replace('h', '')),
      text: $(el).text().trim(),
    });
  });

  let hierarchyBroken = false;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      hierarchyBroken = true;
      break;
    }
  }

  if (hierarchyBroken) {
    issues.push({
      type: 'heading_hierarchy',
      severity: 'warning',
      message: 'Heading hierarchy is broken (e.g., H1 → H3 skipping H2) — logical hierarchy increases citation rate 2.8x',
      fix: 'Ensure headings follow H1 → H2 → H3 order without skipping levels',
    });
    score -= 10;
  }

  // 4. Statistics and data points (+37% AI citation)
  const bodyText = $('main, article, .content').text() || $('body').text();
  const hasStatistics = /\d+%|\d+\s*(million|crore|lakh|thousand|billion|users|views|downloads)/i.test(bodyText);
  if (!hasStatistics) {
    issues.push({
      type: 'missing_statistics',
      severity: 'info',
      message: 'No statistics or data points found — pages with stats get +37% AI citation rate',
      fix: 'Add relevant statistics: platform size, content count, user base, etc.',
    });
    recommendations.push('Add data points: "X+ movies", "Y+ shows", "Z million users"');
    score -= 10;
  }

  // 5. Content length check
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 300) {
    issues.push({
      type: 'thin_content',
      severity: 'warning',
      message: `Thin content: ${wordCount} words — AI prefers pages with 300+ words for citation`,
      fix: 'Expand content with descriptive text, FAQs, or additional context',
    });
    score -= 15;
  }

  // 6. Lists (74.2% of AI citations come from structured lists)
  const listItems = $('ul li, ol li').length;
  if (listItems < 3 && wordCount > 300) {
    recommendations.push('Add structured lists — 74% of AI citations reference pages with listicle format');
  }

  // 7. External citations/sources
  const externalLinks = $('a[href^="http"]').not('[href*="stage.in"]').length;
  if (externalLinks === 0 && wordCount > 500) {
    recommendations.push('Add external citations/sources — pages citing authoritative sources get more AI trust');
  }

  return {
    url,
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

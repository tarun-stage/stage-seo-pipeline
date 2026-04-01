import * as cheerio from 'cheerio';

export interface FreshnessResult {
  url: string;
  lastModified: string | null;
  daysSinceUpdate: number | null;
  status: 'fresh' | 'aging' | 'stale' | 'unknown';
  issue: string | null;
}

const STALE_THRESHOLD_DAYS = 90;   // 3x citation loss after 90 days
const AGING_THRESHOLD_DAYS = 60;   // Warning at 60 days

/**
 * Checks content freshness — stale pages lose 3x AI citation rate.
 * Looks at dateModified in JSON-LD, <meta> tags, and HTTP headers.
 */
export function checkFreshness(url: string, html: string, lastModifiedHeader?: string): FreshnessResult {
  const $ = cheerio.load(html);
  let lastModified: string | null = null;

  // 1. Check JSON-LD dateModified
  $('script[type="application/ld+json"]').each((_, el) => {
    if (lastModified) return;
    try {
      const parsed = JSON.parse($(el).html() || '{}');
      const schemas = parsed['@graph'] ? parsed['@graph'] : [parsed];
      for (const s of schemas) {
        if (s.dateModified) { lastModified = s.dateModified; break; }
        if (s.uploadDate) { lastModified = s.uploadDate; break; }
      }
    } catch { /* skip */ }
  });

  // 2. Check meta tags
  if (!lastModified) {
    lastModified =
      $('meta[name="last-modified"]').attr('content') ||
      $('meta[property="article:modified_time"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      null;
  }

  // 3. Fall back to HTTP Last-Modified header
  if (!lastModified && lastModifiedHeader) {
    lastModified = lastModifiedHeader;
  }

  if (!lastModified) {
    return { url, lastModified: null, daysSinceUpdate: null, status: 'unknown', issue: null };
  }

  const modifiedDate = new Date(lastModified);
  if (isNaN(modifiedDate.getTime())) {
    return { url, lastModified, daysSinceUpdate: null, status: 'unknown', issue: null };
  }

  const daysSinceUpdate = Math.floor((Date.now() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceUpdate > STALE_THRESHOLD_DAYS) {
    return {
      url,
      lastModified,
      daysSinceUpdate,
      status: 'stale',
      issue: `Content not updated in ${daysSinceUpdate} days — pages stale >90 days lose 3x AI citation rate`,
    };
  }

  if (daysSinceUpdate > AGING_THRESHOLD_DAYS) {
    return {
      url,
      lastModified,
      daysSinceUpdate,
      status: 'aging',
      issue: `Content aging (${daysSinceUpdate} days) — consider refreshing before 90-day mark`,
    };
  }

  return { url, lastModified, daysSinceUpdate, status: 'fresh', issue: null };
}

/**
 * Batch freshness check for multiple pages.
 * Returns only pages that need attention.
 */
export function filterStalePages(results: FreshnessResult[]): FreshnessResult[] {
  return results.filter(r => r.status === 'stale' || r.status === 'aging' || r.status === 'unknown');
}

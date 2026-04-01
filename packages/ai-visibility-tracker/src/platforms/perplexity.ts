export interface CitationCheckResult {
  platform: string;
  query: string;
  cited: boolean;
  position: number | null;       // 1-based position in citations, null if not cited
  competitorsCited: string[];
  checkedAt: string;
  rawSnippet?: string;
}

/**
 * Stage.in target queries to track in AI search.
 * These represent high-intent queries where Stage should appear.
 */
export const TARGET_QUERIES: Record<string, string[]> = {
  haryanvi: [
    'best haryanvi movies to watch online',
    'haryanvi web series streaming',
    'watch haryanvi comedy online',
    'haryanvi movies app',
    'new haryanvi films 2024',
  ],
  rajasthani: [
    'best rajasthani movies online',
    'rajasthani web series streaming',
    'watch rajasthani films online',
    'rajasthani content OTT platform',
  ],
  bhojpuri: [
    'best bhojpuri movies online',
    'bhojpuri web series watch online',
    'bhojpuri comedy shows streaming',
  ],
  gujarati: [
    'best gujarati movies online',
    'gujarati web series streaming platform',
    'watch gujarati films online',
  ],
  brand: [
    'stage app haryanvi',
    'stage.in regional content',
    'stage OTT platform India',
    'regional language OTT India',
  ],
};

/** Known competitors to check if they are cited when Stage.in is not. */
export const COMPETITOR_DOMAINS = [
  'mxplayer.in',
  'jiocinema.com',
  'zee5.com',
  'sonyliv.com',
  'hotstar.com',
  'primevideo.com',
  'netflix.com',
  'youtube.com',
];

/**
 * Check if a domain appears in text content (citation check).
 */
export function checkDomainCited(text: string, domain: string): boolean {
  const cleanDomain = domain.replace('www.', '').replace(/\/$/, '');
  return text.toLowerCase().includes(cleanDomain.toLowerCase());
}

/**
 * Parse a Perplexity-style response text to find citations.
 * Looks for URLs and domain mentions in the response.
 */
export function parseCitations(responseText: string, targetDomain: string): {
  cited: boolean;
  position: number | null;
  competitors: string[];
} {
  const domainPattern = /https?:\/\/([^/\s]+)/g;
  const domains: string[] = [];
  let match;

  while ((match = domainPattern.exec(responseText)) !== null) {
    domains.push(match[1].replace('www.', ''));
  }

  const normalizedTarget = targetDomain.replace('www.', '');
  const targetIndex = domains.findIndex(d => d.includes(normalizedTarget));

  const competitors = COMPETITOR_DOMAINS.filter(c =>
    domains.some(d => d.includes(c.replace('www.', '')))
  );

  return {
    cited: targetIndex !== -1,
    position: targetIndex !== -1 ? targetIndex + 1 : null,
    competitors,
  };
}

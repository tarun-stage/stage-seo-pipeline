import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { TARGET_QUERIES, parseCitations } from './platforms/perplexity.js';

export interface VisibilitySnapshot {
  date: string;
  query: string;
  dialect: string;
  platform: string;
  cited: boolean;
  position: number | null;
  competitorsCited: string[];
}

export interface VisibilityReport {
  date: string;
  totalQueries: number;
  citedCount: number;
  citationRate: number;        // 0-1
  avgPosition: number | null;
  topCompetitors: Array<{ domain: string; count: number }>;
  byDialect: Record<string, { total: number; cited: number; rate: number }>;
  trend: 'improving' | 'declining' | 'stable' | 'unknown';
}

const DB_FILE = 'ai_visibility.json';

function loadDb(dbPath: string): VisibilitySnapshot[] {
  if (!existsSync(dbPath)) return [];
  try {
    return JSON.parse(readFileSync(dbPath, 'utf-8'));
  } catch {
    return [];
  }
}

function saveDb(dbPath: string, data: VisibilitySnapshot[]): void {
  writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Record a manual or automated visibility check result.
 */
export function recordVisibility(
  dbPath: string,
  snapshot: Omit<VisibilitySnapshot, 'date'>
): void {
  const db = loadDb(dbPath);
  db.push({ ...snapshot, date: new Date().toISOString() });
  saveDb(dbPath, db);
}

/**
 * Generate a visibility report from stored snapshots.
 */
export function generateReport(dbPath: string, days: number = 30): VisibilityReport {
  const db = loadDb(dbPath);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const recent = db.filter(s => new Date(s.date) > cutoff);

  if (recent.length === 0) {
    return {
      date: new Date().toISOString(),
      totalQueries: 0,
      citedCount: 0,
      citationRate: 0,
      avgPosition: null,
      topCompetitors: [],
      byDialect: {},
      trend: 'unknown',
    };
  }

  const citedSnapshots = recent.filter(s => s.cited);
  const positions = citedSnapshots.map(s => s.position).filter((p): p is number => p !== null);

  // Competitor frequency
  const competitorCount: Record<string, number> = {};
  for (const snap of recent) {
    for (const comp of snap.competitorsCited) {
      competitorCount[comp] = (competitorCount[comp] || 0) + 1;
    }
  }
  const topCompetitors = Object.entries(competitorCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, count }));

  // By dialect
  const byDialect: Record<string, { total: number; cited: number; rate: number }> = {};
  for (const snap of recent) {
    if (!byDialect[snap.dialect]) byDialect[snap.dialect] = { total: 0, cited: 0, rate: 0 };
    byDialect[snap.dialect].total++;
    if (snap.cited) byDialect[snap.dialect].cited++;
  }
  for (const d of Object.values(byDialect)) {
    d.rate = d.total > 0 ? d.cited / d.total : 0;
  }

  // Trend (compare first half vs second half)
  const mid = Math.floor(recent.length / 2);
  const firstHalf = recent.slice(0, mid);
  const secondHalf = recent.slice(mid);
  const firstRate = firstHalf.filter(s => s.cited).length / (firstHalf.length || 1);
  const secondRate = secondHalf.filter(s => s.cited).length / (secondHalf.length || 1);
  const trend: VisibilityReport['trend'] =
    secondRate > firstRate + 0.05 ? 'improving' :
    secondRate < firstRate - 0.05 ? 'declining' :
    firstHalf.length > 0 ? 'stable' : 'unknown';

  return {
    date: new Date().toISOString(),
    totalQueries: recent.length,
    citedCount: citedSnapshots.length,
    citationRate: citedSnapshots.length / recent.length,
    avgPosition: positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : null,
    topCompetitors,
    byDialect,
    trend,
  };
}

/**
 * Print a formatted report to console.
 */
export function printReport(report: VisibilityReport): void {
  console.log('\n=== AI Visibility Report ===');
  console.log(`Date: ${new Date(report.date).toLocaleDateString()}`);
  console.log(`Citation Rate: ${(report.citationRate * 100).toFixed(1)}% (${report.citedCount}/${report.totalQueries} queries)`);
  if (report.avgPosition) console.log(`Avg Citation Position: #${report.avgPosition.toFixed(1)}`);
  console.log(`Trend: ${report.trend.toUpperCase()}`);

  if (Object.keys(report.byDialect).length > 0) {
    console.log('\nBy Dialect:');
    for (const [dialect, data] of Object.entries(report.byDialect)) {
      console.log(`  ${dialect}: ${(data.rate * 100).toFixed(0)}% cited (${data.cited}/${data.total})`);
    }
  }

  if (report.topCompetitors.length > 0) {
    console.log('\nTop Competitors Cited Instead:');
    report.topCompetitors.forEach(({ domain, count }) =>
      console.log(`  ${domain}: cited ${count} times`)
    );
  }

  if (report.citationRate < 0.3) {
    console.log('\n⚠ Low citation rate — consider:');
    console.log('  1. Adding FAQPage schema to dialect landing pages (+40% citation)');
    console.log('  2. Ensuring robots.txt allows PerplexityBot, GPTBot, ClaudeBot');
    console.log('  3. Updating content freshness (stale >90 days = 3x citation loss)');
    console.log('  4. Improving content structure (answer-first, statistics, heading hierarchy)');
  }
}

export { TARGET_QUERIES };

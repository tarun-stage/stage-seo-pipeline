import { type Database } from 'sql.js';
import type {
  AuditIssue,
  AgentRun,
  ContentSuggestion,
  GeoScore,
  LinkSuggestion,
} from '../models/types.js';

// --- Audit Issues ---

export function getOpenAuditIssues(db: Database): AuditIssue[] {
  const results = db.exec(
    `SELECT * FROM audit_issues WHERE fix_status = 'open' ORDER BY severity, detected_at DESC`
  );
  return resultsToObjects<AuditIssue>(results);
}

export function insertAuditIssue(
  db: Database,
  issue: Omit<AuditIssue, 'id' | 'detected_at' | 'fixed_at'>
): void {
  db.run(
    `INSERT OR IGNORE INTO audit_issues (url, issue_type, severity, description, suggested_fix, fix_status, pr_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [issue.url, issue.issue_type, issue.severity, issue.description, issue.suggested_fix ?? null, issue.fix_status, issue.pr_url ?? null]
  );
}

export function updateAuditIssueStatus(
  db: Database,
  id: number,
  status: AuditIssue['fix_status'],
  prUrl?: string
): void {
  const fixedAt = status === 'fixed' ? "datetime('now')" : 'NULL';
  db.run(
    `UPDATE audit_issues SET fix_status = ?, pr_url = COALESCE(?, pr_url), fixed_at = ${fixedAt} WHERE id = ?`,
    [status, prUrl ?? null, id]
  );
}

// --- Agent Runs ---

export function startAgentRun(db: Database, agentName: string, runType: string): number {
  db.run(
    `INSERT INTO agent_runs (agent_name, run_type, status) VALUES (?, ?, 'running')`,
    [agentName, runType]
  );
  const result = db.exec(`SELECT last_insert_rowid() as id`);
  return result[0].values[0][0] as number;
}

export function finishAgentRun(
  db: Database,
  runId: number,
  status: 'success' | 'failure',
  itemsProcessed: number,
  itemsFailed: number,
  summary?: string
): void {
  db.run(
    `UPDATE agent_runs SET status = ?, finished_at = datetime('now'), items_processed = ?, items_failed = ?, summary = ? WHERE id = ?`,
    [status, itemsProcessed, itemsFailed, summary ?? null, runId]
  );
}

// --- Content Suggestions ---

export function getPendingContentSuggestions(db: Database): ContentSuggestion[] {
  const results = db.exec(
    `SELECT * FROM content_suggestions WHERE status = 'pending' ORDER BY priority, created_at DESC`
  );
  return resultsToObjects<ContentSuggestion>(results);
}

export function insertContentSuggestion(
  db: Database,
  suggestion: Omit<ContentSuggestion, 'id' | 'created_at'>
): void {
  db.run(
    `INSERT INTO content_suggestions (url, suggestion_type, title, body, priority, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [suggestion.url, suggestion.suggestion_type, suggestion.title, suggestion.body, suggestion.priority, suggestion.status]
  );
}

// --- Link Suggestions ---

export function getPendingLinkSuggestions(db: Database): LinkSuggestion[] {
  const results = db.exec(
    `SELECT * FROM link_suggestions WHERE status = 'pending' ORDER BY priority, created_at DESC`
  );
  return resultsToObjects<LinkSuggestion>(results);
}

// --- GEO Scores ---

export function getLatestGeoScores(db: Database, url: string): GeoScore[] {
  const results = db.exec(
    `SELECT * FROM geo_scores WHERE url = ? ORDER BY measured_at DESC LIMIT 10`,
    [url]
  );
  return resultsToObjects<GeoScore>(results);
}

export function insertGeoScore(
  db: Database,
  score: Omit<GeoScore, 'id' | 'measured_at'>
): void {
  db.run(
    `INSERT OR IGNORE INTO geo_scores (url, score_type, score, details) VALUES (?, ?, ?, ?)`,
    [score.url, score.score_type, score.score, score.details ?? null]
  );
}

// --- Lessons (Self-Improvement Loop) ---

export interface Lesson {
  id?: number;
  source: string;
  pattern: string;
  type: 'success' | 'failure' | 'observation';
  confidence: number;
  created_at?: string;
  last_confirmed_at?: string;
  times_confirmed?: number;
}

export function insertLesson(db: Database, lesson: Omit<Lesson, 'id' | 'created_at'>): void {
  db.run(
    `INSERT INTO lessons (source, pattern, type, confidence) VALUES (?, ?, ?, ?)`,
    [lesson.source, lesson.pattern, lesson.type, lesson.confidence]
  );
}

export function confirmLesson(db: Database, id: number): void {
  db.run(
    `UPDATE lessons
     SET times_confirmed = times_confirmed + 1,
         confidence = MIN(1.0, confidence + 0.1),
         last_confirmed_at = datetime('now')
     WHERE id = ?`,
    [id]
  );
}

export function getHighConfidenceLessons(db: Database, minConfidence: number = 0.6): Lesson[] {
  const results = db.exec(
    `SELECT * FROM lessons WHERE confidence >= ? ORDER BY confidence DESC, times_confirmed DESC LIMIT 50`,
    [minConfidence]
  );
  return resultsToObjects<Lesson>(results);
}

export function getFailureLessons(db: Database): Lesson[] {
  const results = db.exec(
    `SELECT * FROM lessons WHERE type = 'failure' ORDER BY confidence DESC LIMIT 20`
  );
  return resultsToObjects<Lesson>(results);
}

// --- AI Citations ---

export interface AiCitation {
  id?: number;
  query: string;
  dialect: string;
  platform: string;
  cited: 0 | 1;
  position?: number;
  competitors_cited: string;
  checked_at?: string;
}

export function insertAiCitation(db: Database, citation: Omit<AiCitation, 'id' | 'checked_at'>): void {
  db.run(
    `INSERT INTO ai_citations (query, dialect, platform, cited, position, competitors_cited)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      citation.query,
      citation.dialect,
      citation.platform,
      citation.cited,
      citation.position ?? null,
      citation.competitors_cited,
    ]
  );
}

export function getAiCitationRate(
  db: Database,
  platform?: string,
  days: number = 30
): { total: number; cited: number; rate: number } {
  const platformFilter = platform ? `AND platform = '${platform}'` : '';
  const results = db.exec(
    `SELECT COUNT(*) as total, SUM(cited) as cited
     FROM ai_citations
     WHERE checked_at >= datetime('now', '-${days} days')
     ${platformFilter}`
  );
  if (!results.length || !results[0].values.length) return { total: 0, cited: 0, rate: 0 };
  const [total, cited] = results[0].values[0] as [number, number];
  return { total, cited: cited || 0, rate: total > 0 ? (cited || 0) / total : 0 };
}

// --- Helpers ---

function resultsToObjects<T>(results: { columns: string[]; values: any[][] }[]): T[] {
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj as T;
  });
}

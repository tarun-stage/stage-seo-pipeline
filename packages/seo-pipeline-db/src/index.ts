export { getDatabase, saveDatabase, closeDatabase } from './db/schema.js';
export {
  getOpenAuditIssues,
  insertAuditIssue,
  updateAuditIssueStatus,
  startAgentRun,
  finishAgentRun,
  getPendingContentSuggestions,
  insertContentSuggestion,
  getPendingLinkSuggestions,
  getLatestGeoScores,
  insertGeoScore,
  // Self-improvement loop
  insertLesson,
  confirmLesson,
  getHighConfidenceLessons,
  getFailureLessons,
  // AI citation tracking
  insertAiCitation,
  getAiCitationRate,
} from './db/repository.js';
export type {
  Keyword,
  AuditIssue,
  TrendSnapshot,
  ContentSuggestion,
  LinkGraphEntry,
  LinkSuggestion,
  GeoScore,
  AgentRun,
  Lesson,
  AiCitation,
} from './db/repository.js';

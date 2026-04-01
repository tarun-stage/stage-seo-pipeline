export interface RobotsCheckResult {
  url: string;
  blockedBots: string[];
  allowedBots: string[];
  missingBots: string[];
  issues: RobotsIssue[];
}

export interface RobotsIssue {
  bot: string;
  severity: 'critical' | 'warning';
  message: string;
  fix: string;
}

/**
 * AI bots that must be allowed for AI search visibility.
 * Blocking any of these = invisible to that AI platform.
 */
export const AI_BOTS = [
  { name: 'PerplexityBot', platform: 'Perplexity' },
  { name: 'GPTBot', platform: 'ChatGPT' },
  { name: 'ChatGPT-User', platform: 'ChatGPT browsing' },
  { name: 'ClaudeBot', platform: 'Claude' },
  { name: 'anthropic-ai', platform: 'Anthropic/Claude' },
  { name: 'Google-Extended', platform: 'Google AI (Gemini training)' },
  { name: 'Googlebot', platform: 'Google Search (baseline)' },
  { name: 'OAI-SearchBot', platform: 'OpenAI SearchBot' },
];

/**
 * Checks robots.txt for blocked AI bots.
 * AI bots blocked = invisible to that platform's search results.
 */
export function checkRobotsTxt(robotsTxtContent: string): RobotsCheckResult {
  const issues: RobotsIssue[] = [];
  const blockedBots: string[] = [];
  const allowedBots: string[] = [];
  const missingBots: string[] = [];

  const lines = robotsTxtContent.split('\n').map(l => l.trim());

  for (const bot of AI_BOTS) {
    const botSection = extractBotSection(lines, bot.name);

    if (botSection === null) {
      // Bot not mentioned — falls under wildcard rules
      const wildcardSection = extractBotSection(lines, '*');
      if (wildcardSection?.disallows.includes('/')) {
        blockedBots.push(bot.name);
        issues.push({
          bot: bot.name,
          severity: 'critical',
          message: `${bot.name} (${bot.platform}) is blocked by wildcard Disallow: / — invisible to ${bot.platform}`,
          fix: `Add explicit User-agent: ${bot.name}\\nAllow: / before the wildcard rule`,
        });
      } else {
        missingBots.push(bot.name);
      }
    } else if (botSection.disallows.includes('/')) {
      blockedBots.push(bot.name);
      issues.push({
        bot: bot.name,
        severity: 'critical',
        message: `${bot.name} (${bot.platform}) is explicitly blocked — site invisible to ${bot.platform}`,
        fix: `Remove or change: Disallow: / under User-agent: ${bot.name}`,
      });
    } else {
      allowedBots.push(bot.name);
    }
  }

  return {
    url: '/robots.txt',
    blockedBots,
    allowedBots,
    missingBots,
    issues,
  };
}

interface BotSection {
  disallows: string[];
  allows: string[];
}

function extractBotSection(lines: string[], botName: string): BotSection | null {
  let inSection = false;
  const section: BotSection = { disallows: [], allows: [] };
  let found = false;

  for (const line of lines) {
    if (line.toLowerCase().startsWith('user-agent:')) {
      const agent = line.split(':')[1]?.trim();
      inSection = agent?.toLowerCase() === botName.toLowerCase();
      if (inSection) found = true;
    } else if (inSection) {
      if (line === '' && found) break; // End of section
      if (line.toLowerCase().startsWith('disallow:')) {
        section.disallows.push(line.split(':')[1]?.trim() || '');
      } else if (line.toLowerCase().startsWith('allow:')) {
        section.allows.push(line.split(':')[1]?.trim() || '');
      }
    }
  }

  return found ? section : null;
}

/**
 * Fetch and check robots.txt from a live URL.
 */
export async function fetchAndCheckRobots(siteUrl: string): Promise<RobotsCheckResult> {
  const robotsUrl = `${siteUrl.replace(/\/$/, '')}/robots.txt`;
  const response = await fetch(robotsUrl, {
    headers: { 'User-Agent': 'SEO-Audit-Bot/1.0' },
  });

  if (!response.ok) {
    return {
      url: robotsUrl,
      blockedBots: [],
      allowedBots: [],
      missingBots: AI_BOTS.map(b => b.name),
      issues: [{
        bot: 'all',
        severity: 'warning',
        message: `robots.txt returned HTTP ${response.status} — AI bots may be unable to determine crawl rules`,
        fix: 'Create a valid /robots.txt file',
      }],
    };
  }

  const content = await response.text();
  return checkRobotsTxt(content);
}

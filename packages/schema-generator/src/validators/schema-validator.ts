export interface SchemaValidationResult {
  valid: boolean;
  type: string;
  issues: string[];
  warnings: string[];
}

/**
 * Validates JSON-LD schema objects against required fields.
 * Runs before deploying schemas to catch missing fields.
 */
export function validateSchema(schema: Record<string, unknown>): SchemaValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Handle @graph
  if (schema['@graph'] && Array.isArray(schema['@graph'])) {
    const results = (schema['@graph'] as Record<string, unknown>[]).map(validateSchema);
    return {
      valid: results.every(r => r.valid),
      type: '@graph',
      issues: results.flatMap(r => r.issues),
      warnings: results.flatMap(r => r.warnings),
    };
  }

  const type = schema['@type'] as string;
  if (!type) {
    issues.push('Missing @type');
    return { valid: false, type: 'unknown', issues, warnings };
  }

  switch (type) {
    case 'VideoObject':
      requiredFields(['name', 'description', 'thumbnailUrl', 'uploadDate', 'duration'], schema, issues);
      recommendedFields(['contentUrl', 'inLanguage', 'potentialAction'], schema, warnings);
      break;

    case 'Movie':
      requiredFields(['name', 'description'], schema, issues);
      recommendedFields(['image', 'datePublished', 'inLanguage', 'genre'], schema, warnings);
      break;

    case 'TVSeries':
      requiredFields(['name', 'description'], schema, issues);
      recommendedFields(['startDate', 'numberOfSeasons', 'inLanguage', 'genre'], schema, warnings);
      break;

    case 'TVEpisode':
      requiredFields(['name', 'episodeNumber', 'partOfSeason', 'partOfTVSeries'], schema, issues);
      recommendedFields(['description', 'thumbnailUrl', 'duration'], schema, warnings);
      break;

    case 'FAQPage':
      if (!schema['mainEntity'] || !Array.isArray(schema['mainEntity'])) {
        issues.push('FAQPage: mainEntity must be an array of Questions');
      } else if ((schema['mainEntity'] as unknown[]).length < 2) {
        warnings.push('FAQPage: recommend at least 2 FAQ items');
      }
      break;

    case 'Organization':
      requiredFields(['name', 'url'], schema, issues);
      recommendedFields(['logo', 'sameAs', 'description'], schema, warnings);
      break;

    case 'BreadcrumbList':
      if (!schema['itemListElement'] || !Array.isArray(schema['itemListElement'])) {
        issues.push('BreadcrumbList: itemListElement must be an array');
      }
      break;

    default:
      warnings.push(`Unknown schema type: ${type} — cannot validate`);
  }

  return { valid: issues.length === 0, type, issues, warnings };
}

function requiredFields(
  fields: string[],
  schema: Record<string, unknown>,
  issues: string[]
): void {
  for (const field of fields) {
    if (!schema[field]) {
      issues.push(`${schema['@type']}: missing required field "${field}"`);
    }
  }
}

function recommendedFields(
  fields: string[],
  schema: Record<string, unknown>,
  warnings: string[]
): void {
  for (const field of fields) {
    if (!schema[field]) {
      warnings.push(`${schema['@type']}: recommended field "${field}" is missing`);
    }
  }
}

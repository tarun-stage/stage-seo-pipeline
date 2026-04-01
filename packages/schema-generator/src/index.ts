export { generateVideoObject, videoObjectToScript } from './generators/video-object.js';
export type { VideoObjectInput } from './generators/video-object.js';

export { generateTVSeries, generateTVEpisode } from './generators/tv-series.js';
export type { TVSeriesInput, TVEpisodeInput, TVSeasonInput } from './generators/tv-series.js';

export { generateFaqPage, DIALECT_FAQS } from './generators/faq-page.js';
export type { FAQ } from './generators/faq-page.js';

export {
  generateOrganizationAndWebsite,
  generateBreadcrumbs,
  generateSpeakable,
} from './generators/organization.js';

export { validateSchema } from './validators/schema-validator.js';
export type { SchemaValidationResult } from './validators/schema-validator.js';

/** Serialize any schema object to an injectable <script> tag. */
export function toScriptTag(schema: object): string {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}
